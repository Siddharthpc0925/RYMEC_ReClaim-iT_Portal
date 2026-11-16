const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { db, sha256, levenshteinDistance } = require('../lib/db');
const { authenticate } = require('../middleware/auth');
const { checkClaimRateLimit, FRAUD_FLAG_THRESHOLD } = require('../lib/duplicateGuard');

// POST /api/claims (Submit a claim for a found item)
router.post('/', authenticate, (req, res) => {
  const { item_id, message, answer } = req.body;

  if (!item_id) {
    return res.status(400).json({ error: 'Item ID is required' });
  }

  const item = db.items.find(i => i.id === item_id);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  if (item.type !== 'FOUND') {
    return res.status(400).json({ error: 'Claims can only be filed on Found items.' });
  }

  if (item.user_id === req.user.id) {
    return res.status(400).json({ error: 'You cannot claim an item you reported having found.' });
  }

  // Rate Limiting (U15)
  const rateCheck = checkClaimRateLimit(req.user.id);
  if (!rateCheck.allowed) {
    return res.status(429).json({ error: rateCheck.error });
  }

  // Check if existing pending claim exists
  const existing = db.claims.find(
    c => c.item_id === item_id && c.claimant_id === req.user.id && c.status === 'PENDING'
  );
  if (existing) {
    return res.status(400).json({ error: 'You already have a pending claim for this item.' });
  }

  const claimId = `claim-${Date.now()}`;
  const now = new Date().toISOString();

  const newClaim = {
    id: claimId,
    item_id,
    claimant_id: req.user.id,
    message: message ? message.trim() : 'I believe this item belongs to me.',
    answer: answer ? answer.trim() : '',
    status: 'PENDING',
    fraudulent: false,
    handover_code: null,
    handover_code_hash: null,
    handover_expires_at: null,
    decided_by: null,
    decided_at: null,
    claimant_contact_shared: false,
    finder_contact_shared: false,
    created_at: now
  };

  db.claims.unshift(newClaim);

  const locObj = db.locations.find(l => l.id === item.location_id);
  const locName = locObj ? locObj.name : (item.location_other || 'Campus Grounds');
  const zoneName = locObj ? locObj.parent_zone : 'General Campus';
  db.logUserActivity({
    user_id: req.user.id,
    user_name: req.user.name,
    user_email: req.user.email,
    role: req.user.role,
    action: 'CLAIM_SUBMITTED',
    location_name: locName,
    campus_zone: zoneName,
    details: `Claim filed for "${item.title}" (${item.category}) - Held at: ${item.held_at || 'Campus Desk'}`
  });

  // Custody event (U3)
  db.custodyEvents.push({
    id: `ce-${Date.now()}-claim`,
    item_id: item.id,
    claim_id: newClaim.id,
    actor_id: req.user.id,
    action: 'CLAIM_REQUESTED',
    note: `Claim filed by ${req.user.name} (${req.user.roll_no}) with verification response submitted.`,
    created_at: now
  });

  // Notify finder (or security desk)
  db.notifications.push({
    id: `notif-${Date.now()}-claim`,
    user_id: item.user_id,
    message: `New Claim: ${req.user.name} submitted a claim for "${item.title}". Review their verification answer.`,
    link: `/dashboard`,
    is_read: false,
    created_at: now
  });

  res.status(201).json({
    message: 'Claim submitted successfully. The finder has been notified to verify your answer.',
    claim: newClaim
  });
});

// POST /api/claims/:id/decide (Approve or Reject claim)
router.post('/:id/decide', authenticate, (req, res) => {
  const { decision, is_fraudulent = false } = req.body; // 'APPROVE' or 'REJECT'
  const claim = db.claims.find(c => c.id === req.params.id);

  if (!claim) {
    return res.status(404).json({ error: 'Claim not found' });
  }

  const item = db.items.find(i => i.id === claim.item_id);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  const isFinder = item.user_id === req.user.id;
  const isAdmin = req.user.role === 'ADMIN';

  if (!isFinder && !isAdmin) {
    return res.status(403).json({ error: 'Only the finder or campus security admin can decide this claim.' });
  }

  const now = new Date();

  if (decision === 'APPROVE') {
    // Generate 6-digit random handover code (U3)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const hash = sha256(code);
    const expiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString();

    claim.status = 'APPROVED';
    claim.handover_code = code;
    claim.handover_code_hash = hash;
    claim.handover_expires_at = expiresAt;
    claim.decided_by = req.user.id;
    claim.decided_at = now.toISOString();

    // Update item status to CLAIMED
    item.status = 'CLAIMED';
    item.updated_at = now.toISOString();

    // Custody event (U3)
    db.custodyEvents.push({
      id: `ce-${Date.now()}-appr`,
      item_id: item.id,
      claim_id: claim.id,
      actor_id: req.user.id,
      action: 'CLAIM_APPROVED',
      note: `Claim approved by ${req.user.name}. 6-digit secure handover code generated (valid 48 hrs).`,
      created_at: now.toISOString()
    });

    // Notify claimant with code
    db.notifications.push({
      id: `notif-${Date.now()}-appr`,
      user_id: claim.claimant_id,
      message: `🎉 Claim Approved for "${item.title}"! Your handover code is ${code}. Present this code or QR to complete the handover.`,
      link: `/dashboard`,
      is_read: false,
      created_at: now.toISOString()
    });

    return res.json({
      message: 'Claim approved successfully',
      claim: {
        ...claim,
        handover_code: code
      }
    });
  } else if (decision === 'REJECT') {
    claim.status = 'REJECTED';
    claim.fraudulent = Boolean(is_fraudulent);
    claim.decided_by = req.user.id;
    claim.decided_at = now.toISOString();

    if (item.status === 'CLAIMED') {
      item.status = 'OPEN';
    }

    // If marked fraudulent, penalize claimant (U12, U15)
    if (is_fraudulent) {
      const claimant = db.profiles.find(p => p.id === claim.claimant_id);
      if (claimant) {
        claimant.points = Math.max(0, (claimant.points || 0) - 10);
        claimant.fraud_claims = (claimant.fraud_claims || 0) + 1;
        if (claimant.fraud_claims >= FRAUD_FLAG_THRESHOLD) {
          claimant.flagged = true;
        }

        db.pointsLedger.push({
          id: `pl-${Date.now()}-pen`,
          user_id: claimant.id,
          reason: `Penalty: Fraudulent claim rejected for ${item.title} (-10 pts)`,
          points: -10,
          created_at: now.toISOString()
        });
      }
    }

    db.notifications.push({
      id: `notif-${Date.now()}-rej`,
      user_id: claim.claimant_id,
      message: `Claim update: Your claim for "${item.title}" was not approved by the finder.`,
      link: `/dashboard`,
      is_read: false,
      created_at: now.toISOString()
    });

    return res.json({ message: 'Claim rejected', claim });
  }

  return res.status(400).json({ error: 'Invalid decision: Use APPROVE or REJECT.' });
});

// POST /api/claims/:id/share-contact (U5 Masked Chat Contact Sharing)
router.post('/:id/share-contact', authenticate, (req, res) => {
  const claim = db.claims.find(c => c.id === req.params.id);
  if (!claim) {
    return res.status(404).json({ error: 'Claim not found' });
  }

  const item = db.items.find(i => i.id === claim.item_id);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  const isClaimant = claim.claimant_id === req.user.id;
  const isFinder = item.user_id === req.user.id;
  const isAdmin = req.user.role === 'ADMIN';

  if (!isClaimant && !isFinder && !isAdmin) {
    return res.status(403).json({ error: 'Unauthorized to share contact for this claim' });
  }

  if (isClaimant) {
    claim.claimant_contact_shared = true;
  }
  if (isFinder) {
    claim.finder_contact_shared = true;
  }

  const bothShared = (claim.claimant_contact_shared && claim.finder_contact_shared) || isAdmin;

  const claimant = db.profiles.find(p => p.id === claim.claimant_id);
  const finder = db.profiles.find(p => p.id === item.user_id);

  res.json({
    message: bothShared ? 'Both parties have shared contacts! Details unlocked.' : 'Your contact preference saved. Waiting for the other party.',
    bothShared,
    claimantContact: bothShared && claimant ? { name: claimant.name, phone: claimant.phone, email: claimant.email } : null,
    finderContact: bothShared && finder ? { name: finder.name, phone: finder.phone, email: finder.email } : null
  });
});

// GET /api/claims/my-claims (Student's submitted claims)
router.get('/my-claims', authenticate, (req, res) => {
  const userClaims = db.claims
    .filter(c => c.claimant_id === req.user.id)
    .map(c => {
      const item = db.items.find(i => i.id === c.item_id);
      const loc = db.locations.find(l => l.id === item?.location_id);
      const finder = db.profiles.find(p => p.id === item?.user_id);
      const bothShared = c.claimant_contact_shared && c.finder_contact_shared;

      return {
        id: c.id,
        item_id: c.item_id,
        item_title: item?.title || 'Unknown Item',
        item_category: item?.category || 'General',
        item_colour: item?.colour || '',
        item_location: loc?.name || 'Campus',
        item_image: item?.image_path,
        item_status: item?.status,
        message: c.message,
        answer: c.answer,
        status: c.status,
        handover_code: c.status === 'APPROVED' ? c.handover_code : null, // Handover code visible to claimant! (U3)
        handover_expires_at: c.handover_expires_at,
        bothContactShared: bothShared,
        finderContact: bothShared && finder ? { name: finder.name, phone: finder.phone, email: finder.email } : null,
        created_at: c.created_at
      };
    });

  res.json({ claims: userClaims });
});

// GET /api/claims/incoming (Claims on items reported by current user)
router.get('/incoming', authenticate, (req, res) => {
  const userItemIds = new Set(
    db.items.filter(i => i.user_id === req.user.id).map(i => i.id)
  );

  const incoming = db.claims
    .filter(c => userItemIds.has(c.item_id))
    .map(c => {
      const item = db.items.find(i => i.id === c.item_id);
      const claimant = db.profiles.find(p => p.id === c.claimant_id);
      const bothShared = c.claimant_contact_shared && c.finder_contact_shared;

      // Hidden detail challenge hint (U4)
      // Check if claimant's answer is close to expected hash
      // To provide side-by-side comparison without leaking hash to non-finder
      let closeMatchHint = false;
      if (item?.verify_answer_hash && c.answer) {
        // Direct match check
        const directMatch = sha256(c.answer) === item.verify_answer_hash;
        closeMatchHint = directMatch;
      }

      return {
        id: c.id,
        item_id: c.item_id,
        item_title: item?.title || 'Reported Item',
        claimant_name: claimant ? claimant.name : 'Student',
        claimant_roll: claimant ? claimant.roll_no : '',
        message: c.message,
        claimant_answer: c.answer,
        verify_question: item?.verify_question,
        closeMatchHint,
        status: c.status,
        handover_code: c.status === 'APPROVED' ? c.handover_code : null,
        bothContactShared: bothShared,
        claimantContact: bothShared && claimant ? { name: claimant.name, phone: claimant.phone, email: claimant.email } : null,
        created_at: c.created_at
      };
    });

  res.json({ claims: incoming });
});

module.exports = router;
