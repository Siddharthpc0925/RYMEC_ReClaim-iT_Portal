const express = require('express');
const router = express.Router();
const { db } = require('../lib/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

// POST /api/maintenance/run (U16)
router.post('/run', authenticate, requireAdmin, (req, res) => {
  const now = new Date();
  let remindedCount = 0;
  let archivedCount = 0;
  let donationEligibleCount = 0;

  db.items.forEach(item => {
    if (item.status !== 'OPEN' && item.status !== 'MATCHED') return;

    const created = new Date(item.created_at);
    const ageDays = (now - created) / (1000 * 60 * 60 * 24);

    if (ageDays >= 90 && item.type === 'FOUND') {
      donationEligibleCount++;
    } else if (ageDays >= 60) {
      item.status = 'ARCHIVED';
      item.updated_at = now.toISOString();
      archivedCount++;

      db.custodyEvents.push({
        id: `ce-${Date.now()}-arch-${item.id}`,
        item_id: item.id,
        claim_id: null,
        actor_id: req.user.id,
        action: 'ARCHIVED',
        note: `Item reached 60 days without claim; auto-archived per campus lost-property policy.`,
        created_at: now.toISOString()
      });
    } else if (ageDays >= 30 && ageDays < 31) {
      // 30 day reminder
      remindedCount++;
      db.notifications.push({
        id: `notif-${Date.now()}-rem-${item.id}`,
        user_id: item.user_id,
        message: `Reminder: Your report for "${item.title}" has been active for 30 days. Please close if resolved.`,
        link: `/items/${item.id}`,
        is_read: false,
        created_at: now.toISOString()
      });
    }
  });

  res.json({
    message: 'Maintenance pipeline executed successfully.',
    stats: {
      remindersSent: remindedCount,
      itemsArchived: archivedCount,
      donationEligible: donationEligibleCount,
      executedAt: now.toISOString()
    }
  });
});

// POST /api/maintenance/donate/:id (Mark item as DONATED)
router.post('/donate/:id', authenticate, requireAdmin, (req, res) => {
  const { note = 'Donated to Ballari District Youth Welfare & Orphanage per RYMEC Campus Policy' } = req.body;
  const item = db.items.find(i => i.id === req.params.id);

  if (!item) return res.status(404).json({ error: 'Item not found' });
  if (item.type !== 'FOUND') return res.status(400).json({ error: 'Only unclaimed found items can be donated' });

  const now = new Date().toISOString();
  item.status = 'DONATED';
  item.updated_at = now;

  db.custodyEvents.push({
    id: `ce-${Date.now()}-don`,
    item_id: item.id,
    claim_id: null,
    actor_id: req.user.id,
    action: 'DONATED',
    note: `Unclaimed item donated after statutory retention period. Note: ${note}`,
    created_at: now
  });

  res.json({ message: 'Item successfully marked as DONATED and custody log updated.', item });
});

module.exports = router;
