const express = require('express');
const router = express.Router();
const { db, sha256 } = require('../lib/db');
const { authenticate, optionalAuthenticate } = require('../middleware/auth');
const { checkReportRateLimit, checkDuplicateReport } = require('../lib/duplicateGuard');

// GET /api/items (C3 Browse & Search)
router.get('/', optionalAuthenticate, (req, res) => {
  const {
    type,
    category,
    location,
    status,
    search,
    sort = 'newest',
    page = 1,
    limit = 12
  } = req.query;

  let list = db.getPublicItems(req.user);

  // Filter by Type (LOST / FOUND)
  if (type && (type === 'LOST' || type === 'FOUND')) {
    list = list.filter(i => i.type === type);
  }

  // Filter by Category
  if (category && category !== 'All') {
    list = list.filter(i => i.category.toLowerCase() === category.toLowerCase());
  }

  // Filter by Location
  if (location && location !== 'All') {
    list = list.filter(i => i.location_id === location || i.location_slug === location);
  }

  // Filter by Status
  if (status && status !== 'All') {
    list = list.filter(i => i.status.toLowerCase() === status.toLowerCase());
  }

  // Keyword Search (C3)
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(i =>
      i.title.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q) ||
      (i.brand && i.brand.toLowerCase().includes(q)) ||
      (i.colour && i.colour.toLowerCase().includes(q)) ||
      (i.location_name && i.location_name.toLowerCase().includes(q))
    );
  }

  // Sort
  if (sort === 'oldest') {
    list.sort((a, b) => new Date(a.occurred_at) - new Date(b.occurred_at));
  } else {
    // Default newest
    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  // Pagination
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.max(1, Math.min(50, parseInt(limit, 10) || 12));
  const totalItems = list.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginated = list.slice((pageNum - 1) * pageSize, pageNum * pageSize);

  res.json({
    items: paginated,
    totalItems,
    totalPages,
    currentPage: pageNum
  });
});

// GET /api/items/locations
router.get('/locations/list', (req, res) => {
  res.json({ locations: db.locations });
});

// GET /api/items/:id (C4 Item Details)
router.get('/:id', optionalAuthenticate, (req, res) => {
  const item = db.getItemById(req.params.id, req.user);
  if (!item) {
    return res.status(404).json({ error: 'Item not found or restricted' });
  }

  // Custody events timeline (U3)
  const events = db.custodyEvents
    .filter(e => e.item_id === item.id)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  // Possible matches (U1) - only show to owner, targeted student, or admin
  let itemMatches = [];
  const isOwner = req.user && req.user.id === item.user_id;
  const isAdmin = req.user && req.user.role === 'ADMIN';

  if (isOwner || isAdmin) {
    const rawMatches = db.matches.filter(
      m => m.lost_item_id === item.id || m.found_item_id === item.id
    );

    itemMatches = rawMatches.map(m => {
      const isLost = m.lost_item_id === item.id;
      const matchedItemId = isLost ? m.found_item_id : m.lost_item_id;
      const otherItem = db.items.find(i => i.id === matchedItemId);
      const loc = db.locations.find(l => l.id === otherItem?.location_id);

      return {
        id: m.id,
        score: m.score,
        reasons: m.reasons,
        created_at: m.created_at,
        matchedItem: otherItem ? {
          id: otherItem.id,
          title: otherItem.title,
          category: otherItem.category,
          type: otherItem.type,
          colour: otherItem.colour,
          location_name: loc ? loc.name : 'Campus',
          image_path: otherItem.image_path,
          status: otherItem.status
        } : null
      };
    }).sort((a, b) => b.score - a.score);
  }

  // If item is Found, check if current user has an active claim
  let userClaim = null;
  if (req.user) {
    userClaim = db.claims.find(c => c.item_id === item.id && c.claimant_id === req.user.id) || null;
  }

  res.json({
    item,
    custodyEvents: events,
    matches: itemMatches,
    userClaim
  });
});

// POST /api/items (C2 Report Form)
router.post('/', authenticate, (req, res) => {
  const {
    type,
    title,
    category,
    description,
    colour,
    brand,
    location_id,
    location_other,
    occurred_at,
    image_path,
    held_at,
    verify_question,
    verify_answer,
    is_anonymous,
    id_roll_no
  } = req.body;

  // Validation (TC02)
  if (!type || !title || !category || !description || !colour || !occurred_at) {
    return res.status(400).json({ error: 'Please provide all mandatory fields (type, title, category, description, colour, date/time).' });
  }

  // Rate Limiting (U15)
  const rateLimitCheck = checkReportRateLimit(req.user.id);
  if (!rateLimitCheck.allowed) {
    return res.status(429).json({ error: rateLimitCheck.error });
  }

  // Duplicate Check (U15)
  const dupCheck = checkDuplicateReport(req.user.id, { title, description, category }, db.items);
  if (dupCheck.isDuplicate) {
    return res.status(409).json({
      error: 'Duplicate Report Warning: You already have an active report for this category with similar details.',
      duplicateItem: dupCheck.matchedItem,
      similarity: Math.round(dupCheck.similarity * 100)
    });
  }

  let isPrivate = false;
  let targetRoll = null;

  // U2 ID-Card Instant Notify
  if (category === 'ID card' && type === 'FOUND') {
    if (id_roll_no && id_roll_no.trim()) {
      targetRoll = id_roll_no.trim().toUpperCase();
      const studentProfile = db.profiles.find(p => p.roll_no === targetRoll);
      if (studentProfile) {
        isPrivate = true; // Hidden from public browse and search!
        // Instant private notification
        db.notifications.push({
          id: `notif-${Date.now()}-id`,
          user_id: studentProfile.id,
          message: `🚨 Private Alert: Your College ID Card (${targetRoll}) was found on campus. You can claim it directly.`,
          link: `/dashboard`,
          is_read: false,
          created_at: new Date().toISOString()
        });
      } else {
        // Unknown student: keep private for security desk
        isPrivate = true;
      }
    }
  }

  const itemId = `item-${Date.now()}`;
  const now = new Date().toISOString();

  const newItem = {
    id: itemId,
    user_id: req.user.id,
    type,
    title: title.trim(),
    category: category.trim(),
    description: description.trim(),
    colour: colour.trim(),
    brand: brand ? brand.trim() : null,
    location_id: location_id || null,
    location_other: location_other ? location_other.trim() : null,
    occurred_at: new Date(occurred_at).toISOString(),
    image_path: image_path || (type === 'LOST' ? '/images/rymec-building.png' : '/images/rymec-campus.png'),
    held_at: type === 'FOUND' ? (held_at || 'With me') : null,
    verify_question: type === 'FOUND' ? (verify_question ? verify_question.trim() : null) : null,
    verify_answer_hash: type === 'FOUND' && verify_answer ? sha256(verify_answer) : null,
    is_anonymous: Boolean(is_anonymous),
    is_private: isPrivate,
    id_roll_no: targetRoll,
    status: 'OPEN',
    created_at: now,
    updated_at: now
  };

  db.items.unshift(newItem);

  const locObj = db.locations.find(l => l.id === location_id);
  const locName = locObj ? locObj.name : (location_other || 'Campus Grounds');
  const zoneName = locObj ? locObj.parent_zone : 'General Campus';
  db.logUserActivity({
    user_id: req.user.id,
    user_name: req.user.name,
    user_email: req.user.email,
    role: req.user.role,
    action: type === 'LOST' ? 'REPORT_LOST_ITEM' : 'REPORT_FOUND_ITEM',
    location_name: locName,
    campus_zone: zoneName,
    details: `${type}: "${title}" (${category}, Color: ${colour}) at ${locName}`
  });

  // Initial custody event (U3)
  db.custodyEvents.push({
    id: `ce-${Date.now()}-init`,
    item_id: newItem.id,
    claim_id: null,
    actor_id: req.user.id,
    action: type === 'LOST' ? 'REPORTED' : (is_anonymous ? 'DEPOSITED' : 'FOUND'),
    note: is_anonymous
      ? 'Item deposited anonymously at Campus Security Desk'
      : (type === 'LOST' ? 'Lost item report submitted by student' : 'Found item reported on campus portal'),
    created_at: now
  });

  // U1: Run explainable match engine!
  const createdMatches = db.runMatchingForNewItem(newItem);

  res.status(201).json({
    message: 'Report submitted successfully',
    item: db.getItemById(newItem.id, req.user),
    matchesFound: createdMatches.length,
    isPrivate
  });
});

// PUT /api/items/:id (Edit Report)
router.put('/:id', authenticate, (req, res) => {
  const item = db.items.find(i => i.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  const isOwner = item.user_id === req.user.id;
  const isAdmin = req.user.role === 'ADMIN';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: 'You are not authorized to edit this report' });
  }

  const { title, description, colour, brand, location_id, status } = req.body;
  if (title) item.title = title.trim();
  if (description) item.description = description.trim();
  if (colour) item.colour = colour.trim();
  if (brand !== undefined) item.brand = brand ? brand.trim() : null;
  if (location_id) item.location_id = location_id;
  if (status && ['OPEN', 'MATCHED', 'CLAIMED', 'RETURNED', 'ARCHIVED', 'DONATED', 'REMOVED'].includes(status)) {
    item.status = status;
  }
  item.updated_at = new Date().toISOString();

  // Re-run matching on edit
  db.runMatchingForNewItem(item);

  res.json({ message: 'Item updated successfully', item: db.getItemById(item.id, req.user) });
});

// DELETE /api/items/:id (Close/Delete Report)
router.delete('/:id', authenticate, (req, res) => {
  const item = db.items.find(i => i.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  const isOwner = item.user_id === req.user.id;
  const isAdmin = req.user.role === 'ADMIN';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: 'Unauthorized to delete this report' });
  }

  item.status = 'REMOVED';
  item.updated_at = new Date().toISOString();

  res.json({ message: 'Item report removed successfully' });
});

// POST /api/items/:id/abuse (C4 Abuse Reporting)
router.post('/:id/abuse', authenticate, (req, res) => {
  const { reason } = req.body;
  if (!reason || !reason.trim()) {
    return res.status(400).json({ error: 'Reason for report is required' });
  }

  const item = db.items.find(i => i.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  const newReport = {
    id: `ab-${Date.now()}`,
    item_id: item.id,
    reporter_id: req.user.id,
    reason: reason.trim(),
    resolved: false,
    created_at: new Date().toISOString()
  };

  db.abuseReports.push(newReport);
  res.status(201).json({ message: 'Report submitted. Campus security will review promptly.' });
});

module.exports = router;
