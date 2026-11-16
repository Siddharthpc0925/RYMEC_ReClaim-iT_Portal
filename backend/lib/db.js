// ============================================================================
// RYMEC ReClaim-iT: In-Memory / Persisted Campus Data Store & Engine
// ============================================================================

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { scoreMatch } = require('./matching');
const { sendEmail } = require('./mailer');

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

function sha256(text) {
  return crypto.createHash('sha256').update(text.trim().toLowerCase()).digest('hex');
}

function levenshteinDistance(a, b) {
  const s1 = a.trim().toLowerCase();
  const s2 = b.trim().toLowerCase();
  const m = s1.length;
  const n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

// 1. Campus Locations
const locations = [
  { id: 'loc-1', slug: 'library', name: 'Central Library & Reading Hall', parent_zone: 'Academic Core', x: 28.5, y: 35.0 },
  { id: 'loc-2', slug: 'canteen', name: 'Campus Canteen & Cafeteria', parent_zone: 'Student Amenities', x: 62.0, y: 48.0 },
  { id: 'loc-3', slug: 'main-gate', name: 'RYMEC Main Arch Gate', parent_zone: 'Security & Entrance', x: 50.0, y: 92.0 },
  { id: 'loc-4', slug: 'bus-bay', name: 'College Bus Bay & Parking', parent_zone: 'Transit Zone', x: 82.0, y: 75.0 },
  { id: 'loc-5', slug: 'block-mech', name: 'Mechanical Block & Workshops', parent_zone: 'Engineering Wings', x: 22.0, y: 65.0 },
  { id: 'loc-6', slug: 'block-ee', name: 'Electrical & Electronics Block', parent_zone: 'Engineering Wings', x: 42.0, y: 60.0 },
  { id: 'loc-7', slug: 'cs-it-labs', name: 'CS & IT Laboratory Complex', parent_zone: 'Computing Center', x: 38.0, y: 25.0 },
  { id: 'loc-8', slug: 'auditorium', name: 'Sir M. Visvesvaraya Auditorium', parent_zone: 'Central Facility', x: 70.0, y: 28.0 },
  { id: 'loc-9', slug: 'sports-ground', name: 'Sports Pavilion & Cricket Ground', parent_zone: 'Athletics Zone', x: 80.0, y: 18.0 },
  { id: 'loc-10', slug: 'hostel-road', name: 'Hostel Avenue & Gym Block', parent_zone: 'Residential Zone', x: 15.0, y: 85.0 }
];

// 2. Profiles (1 Admin Desk, 1 Student Demo)
const passwordAdmin = hashPassword('Admin@123');
const passwordStudent = hashPassword('Student@123');

const profiles = [
  {
    id: 'user-admin',
    name: 'Campus Security Desk',
    roll_no: 'ADM-001',
    email: 'admin@college.edu',
    password_hash: passwordAdmin,
    phone: '+91 94480 12345',
    role: 'ADMIN',
    points: 0,
    fraud_claims: 0,
    flagged: false,
    is_verified: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'user-1',
    name: 'Rahul B',
    roll_no: '3BR21CS089',
    email: 'rahul.b@rymec.edu.in',
    password_hash: passwordStudent,
    phone: '+91 98451 11001',
    role: 'STUDENT',
    points: 0,
    fraud_claims: 0,
    flagged: false,
    is_verified: true,
    created_at: new Date().toISOString()
  }
];

// 3. Badges Initial Table (Clean)
const badges = [];

// 4. Points Ledger (Clean)
const pointsLedger = [];

// 5. Items (Clean)
const items = [];

// 6. Pre-computed Matches (Clean)
const matches = [];

// 7. Claims (Clean)
const claims = [];

// 8. Custody Events (Clean)
const custodyEvents = [];

// 9. Messages (Clean)
const messages = [];

// 10. Saved Searches (Clean)
const savedSearches = [];

// 11. Notifications (Clean)
const notifications = [];

// 12. Abuse Reports (Clean)
const abuseReports = [];

// 13. Audit & Activity Logs (Records every user step with campus location)
const auditLogs = [
  {
    id: 'log-seed-1',
    timestamp: new Date().toISOString(),
    user_id: 'user-admin',
    user_name: 'Campus Security Desk',
    user_email: 'admin@college.edu',
    role: 'ADMIN',
    action: 'SYSTEM_STARTUP',
    location_name: 'RYMEC Main Arch Gate',
    campus_zone: 'Security & Entrance',
    details: 'Security desk monitoring initialized and online',
    ip_address: '10.37.146.1'
  }
];

function logUserActivity(payload) {
  const logEntry = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    user_id: payload.user_id || 'guest',
    user_name: payload.user_name || 'Anonymous User',
    user_email: payload.user_email || 'N/A',
    role: payload.role || 'STUDENT',
    action: payload.action || 'PORTAL_ACTION',
    location_name: payload.location_name || 'Online Portal',
    campus_zone: payload.campus_zone || 'Campus Web Gateway',
    details: payload.details || '',
    ip_address: payload.ip_address || '127.0.0.1'
  };
  auditLogs.unshift(logEntry);
  if (auditLogs.length > 500) auditLogs.pop();
  return logEntry;
}

// Database Helper methods
const db = {
  locations,
  profiles,
  badges,
  pointsLedger,
  items,
  matches,
  claims,
  custodyEvents,
  messages,
  savedSearches,
  notifications,
  abuseReports,
  auditLogs,
  logUserActivity,

  // Public items view generator (filters private, masks anonymous)
  getPublicItems(currentUser = null) {
    return items
      .filter(item => {
        if (item.status === 'REMOVED') return false;
        if (item.is_private) {
          if (!currentUser) return false;
          const isAdmin = currentUser.role === 'ADMIN';
          const isOwner = item.user_id === currentUser.id;
          const isTargetedStudent = item.id_roll_no && item.id_roll_no === currentUser.roll_no;
          return isAdmin || isOwner || isTargetedStudent;
        }
        return true;
      })
      .map(item => {
        const loc = locations.find(l => l.id === item.location_id);
        const owner = profiles.find(p => p.id === item.user_id);
        const isAnon = Boolean(item.is_anonymous);
        const showOwner = currentUser && (currentUser.role === 'ADMIN' || currentUser.id === item.user_id);

        return {
          id: item.id,
          user_id: isAnon && !showOwner ? null : item.user_id,
          reporter_name: isAnon && !showOwner ? 'Anonymous Student' : (owner ? owner.name : 'Campus Member'),
          reporter_roll: isAnon && !showOwner ? null : (owner ? owner.roll_no : null),
          type: item.type,
          title: item.title,
          category: item.category,
          description: item.description,
          colour: item.colour,
          brand: item.brand,
          location_id: item.location_id,
          location_name: loc ? loc.name : (item.location_other || 'Campus Grounds'),
          location_slug: loc ? loc.slug : 'general',
          location_parent: loc ? loc.parent_zone : 'Campus',
          location_other: item.location_other,
          occurred_at: item.occurred_at,
          image_path: item.image_path,
          held_at: item.held_at,
          verify_question: item.verify_question, // question is public
          is_anonymous: item.is_anonymous,
          is_private: item.is_private,
          status: item.status,
          created_at: item.created_at,
          updated_at: item.updated_at
        };
      });
  },

  getItemById(id, currentUser = null) {
    const item = items.find(i => i.id === id);
    if (!item) return null;
    if (item.status === 'REMOVED') return null;

    if (item.is_private) {
      if (!currentUser) return null;
      const isAdmin = currentUser.role === 'ADMIN';
      const isOwner = item.user_id === currentUser.id;
      const isTargeted = item.id_roll_no && item.id_roll_no === currentUser.roll_no;
      if (!isAdmin && !isOwner && !isTargeted) return null;
    }

    const loc = locations.find(l => l.id === item.location_id);
    const owner = profiles.find(p => p.id === item.user_id);
    const isAnon = Boolean(item.is_anonymous);
    const showOwner = currentUser && (currentUser.role === 'ADMIN' || currentUser.id === item.user_id);

    return {
      ...item,
      reporter_name: isAnon && !showOwner ? 'Anonymous Student' : (owner ? owner.name : 'Campus Member'),
      reporter_roll: isAnon && !showOwner ? null : (owner ? owner.roll_no : null),
      reporter_phone: showOwner && owner ? owner.phone : null,
      location_name: loc ? loc.name : (item.location_other || 'Campus Grounds'),
      location_slug: loc ? loc.slug : 'general',
      location_parent: loc ? loc.parent_zone : 'Campus',
      // Strictly protect verify_answer_hash from client
      verify_answer_hash: undefined,
      id_roll_no: currentUser && (currentUser.role === 'ADMIN' || currentUser.roll_no === item.id_roll_no) ? item.id_roll_no : undefined
    };
  },

  // Run match engine when an item is created
  runMatchingForNewItem(newItem) {
    const oppositeType = newItem.type === 'LOST' ? 'FOUND' : 'LOST';
    const loc = locations.find(l => l.id === newItem.location_id);
    const candidates = items.filter(i => i.type === oppositeType && (i.status === 'OPEN' || i.status === 'MATCHED'));

    const createdMatches = [];

    for (const candidate of candidates) {
      const candLoc = locations.find(l => l.id === candidate.location_id);
      const lostItem = newItem.type === 'LOST' ? newItem : candidate;
      const foundItem = newItem.type === 'FOUND' ? newItem : candidate;

      const scored = scoreMatch(
        {
          ...lostItem,
          location_parent: (newItem.type === 'LOST' ? loc : candLoc)?.parent_zone
        },
        {
          ...foundItem,
          location_parent: (newItem.type === 'FOUND' ? loc : candLoc)?.parent_zone
        }
      );

      if (scored.score >= 50) {
        // Upsert match
        const existingIdx = matches.findIndex(
          m => m.lost_item_id === lostItem.id && m.found_item_id === foundItem.id
        );
        const matchObj = {
          id: existingIdx >= 0 ? matches[existingIdx].id : `match-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          lost_item_id: lostItem.id,
          found_item_id: foundItem.id,
          score: scored.score,
          reasons: scored.reasons,
          created_at: new Date().toISOString()
        };

        if (existingIdx >= 0) {
          matches[existingIdx] = matchObj;
        } else {
          matches.push(matchObj);
        }

        // Update item statuses to MATCHED if OPEN
        if (lostItem.status === 'OPEN') lostItem.status = 'MATCHED';
        if (foundItem.status === 'OPEN') foundItem.status = 'MATCHED';

        createdMatches.push(matchObj);

        // Notify both owners
        notifications.push({
          id: `notif-${Date.now()}-lost`,
          user_id: lostItem.user_id,
          message: `Match Found (${scored.score}%): A matching item "${foundItem.title}" was reported.`,
          link: `/items/${foundItem.id}`,
          is_read: false,
          created_at: new Date().toISOString()
        });

        notifications.push({
          id: `notif-${Date.now()}-found`,
          user_id: foundItem.user_id,
          message: `Match Found (${scored.score}%): A matching report "${lostItem.title}" was reported.`,
          link: `/items/${lostItem.id}`,
          is_read: false,
          created_at: new Date().toISOString()
        });

        // Mock email
        const lostOwner = profiles.find(p => p.id === lostItem.user_id);
        const foundOwner = profiles.find(p => p.id === foundItem.user_id);
        if (lostOwner) {
          sendEmail({
            to: lostOwner.email,
            subject: `[RYMEC ReClaim-iT] Possible Match for ${lostItem.title} (${scored.score}%)`,
            body: `A found item matching your lost report was posted. Reasons: ${scored.reasons.join(', ')}`,
            itemTitle: lostItem.title
          });
        }
        if (foundOwner) {
          sendEmail({
            to: foundOwner.email,
            subject: `[RYMEC ReClaim-iT] Match Notification (${scored.score}%)`,
            body: `A lost report matching your found item was registered.`,
            itemTitle: foundItem.title
          });
        }
      }
    }

    // U6: Match against saved searches if newItem is FOUND
    if (newItem.type === 'FOUND') {
      for (const search of savedSearches) {
        let matchesSearch = false;
        if (search.category && search.category.toLowerCase() === newItem.category.toLowerCase()) {
          matchesSearch = true;
        }
        if (search.location_id && search.location_id === newItem.location_id) {
          matchesSearch = true;
        }
        if (search.keywords && (
          newItem.title.toLowerCase().includes(search.keywords.toLowerCase()) ||
          newItem.description.toLowerCase().includes(search.keywords.toLowerCase())
        )) {
          matchesSearch = true;
        }

        if (matchesSearch) {
          notifications.push({
            id: `notif-${Date.now()}-watch`,
            user_id: search.user_id,
            message: `Watchlist Alert! A found item matching your saved alert "${search.keywords || search.category}" was posted.`,
            link: `/items/${newItem.id}`,
            is_read: false,
            created_at: new Date().toISOString()
          });
        }
      }
    }

    return createdMatches;
  },

  // Handover Verification (U3)
  verifyHandover(enteredCode, verifierUser) {
    const cleanCode = enteredCode.trim();
    const hash = sha256(cleanCode);
    const now = new Date();

    const claim = claims.find(c => c.handover_code_hash === hash && c.status === 'APPROVED');
    if (!claim) {
      return { success: false, error: 'Invalid handover code. Please check the 6-digit code or QR provided by claimant.' };
    }

    if (claim.handover_expires_at && new Date(claim.handover_expires_at) < now) {
      return { success: false, error: 'This handover code has expired (valid for 48 hours). Please request a new claim approval.' };
    }

    const item = items.find(i => i.id === claim.item_id);
    if (!item) {
      return { success: false, error: 'Associated item record not found.' };
    }

    // Update statuses
    item.status = 'RETURNED';
    item.updated_at = now.toISOString();

    // Log custody events
    custodyEvents.push({
      id: `ce-${Date.now()}-hv`,
      item_id: item.id,
      claim_id: claim.id,
      actor_id: verifierUser ? verifierUser.id : null,
      action: 'HANDOVER_VERIFIED',
      note: `6-digit handover code verified in person by ${verifierUser ? verifierUser.name : 'Desk Officer'}.`,
      created_at: now.toISOString()
    });

    custodyEvents.push({
      id: `ce-${Date.now()}-ret`,
      item_id: item.id,
      claim_id: claim.id,
      actor_id: claim.claimant_id,
      action: 'RETURNED',
      note: 'Item successfully returned to rightful owner. Case closed.',
      created_at: now.toISOString()
    });

    // U12: Award points and badges
    // Finder gets +20 points
    const finder = profiles.find(p => p.id === item.user_id);
    if (finder) {
      finder.points = (finder.points || 0) + 20;
      pointsLedger.push({
        id: `pl-${Date.now()}-f`,
        user_id: finder.id,
        reason: `Returned item: ${item.title} (+20 pts)`,
        points: 20,
        created_at: now.toISOString()
      });

      // Check badges for finder
      const totalReturns = pointsLedger.filter(p => p.user_id === finder.id && p.reason.startsWith('Returned item')).length;
      if (totalReturns >= 1 && !badges.some(b => b.user_id === finder.id && b.badge === 'FIRST_RETURN')) {
        badges.push({ user_id: finder.id, badge: 'FIRST_RETURN', awarded_at: now.toISOString() });
      }
      if (totalReturns >= 5 && !badges.some(b => b.user_id === finder.id && b.badge === 'HELPER')) {
        badges.push({ user_id: finder.id, badge: 'HELPER', awarded_at: now.toISOString() });
      }
      if (totalReturns >= 10 && !badges.some(b => b.user_id === finder.id && b.badge === 'CAMPUS_HERO')) {
        badges.push({ user_id: finder.id, badge: 'CAMPUS_HERO', awarded_at: now.toISOString() });
      }
    }

    // Claimant gets +2 points
    const claimant = profiles.find(p => p.id === claim.claimant_id);
    if (claimant) {
      claimant.points = (claimant.points || 0) + 2;
      pointsLedger.push({
        id: `pl-${Date.now()}-c`,
        user_id: claimant.id,
        reason: `Completed handover for: ${item.title} (+2 pts)`,
        points: 2,
        created_at: now.toISOString()
      });
    }

    // Notify parties
    notifications.push({
      id: `notif-${Date.now()}-ret1`,
      user_id: item.user_id,
      message: `🎉 Handover complete! "${item.title}" marked as RETURNED. You earned +20 points!`,
      link: `/items/${item.id}`,
      is_read: false,
      created_at: now.toISOString()
    });

    notifications.push({
      id: `notif-${Date.now()}-ret2`,
      user_id: claim.claimant_id,
      message: `🎉 You received "${item.title}". Thank you for using RYMEC ReClaim-iT!`,
      link: `/items/${item.id}`,
      is_read: false,
      created_at: now.toISOString()
    });

    return {
      success: true,
      item,
      claim,
      pointsAwarded: { finder: 20, claimant: 2 }
    };
  }
};

module.exports = {
  db,
  sha256,
  levenshteinDistance
};
