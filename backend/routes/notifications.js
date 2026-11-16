const express = require('express');
const router = express.Router();
const { db } = require('../lib/db');
const { authenticate } = require('../middleware/auth');

// GET /api/notifications
router.get('/', authenticate, (req, res) => {
  const notifs = db.notifications
    .filter(n => n.user_id === req.user.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const unreadCount = notifs.filter(n => !n.is_read).length;

  res.json({ notifications: notifs, unreadCount });
});

// PUT /api/notifications/read-all
router.put('/read-all', authenticate, (req, res) => {
  db.notifications.forEach(n => {
    if (n.user_id === req.user.id) n.is_read = true;
  });
  res.json({ message: 'All notifications marked as read' });
});

// PUT /api/notifications/:id/read
router.put('/:id/read', authenticate, (req, res) => {
  const notif = db.notifications.find(n => n.id === req.params.id && n.user_id === req.user.id);
  if (notif) notif.is_read = true;
  res.json({ message: 'Notification marked as read' });
});

module.exports = router;
