const express = require('express');
const router = express.Router();
const { db } = require('../lib/db');
const { authenticate } = require('../middleware/auth');

const BANNED_WORDS = ['abuse', 'idiot', 'scam', 'cheat', 'bastard', 'fake'];

function filterProfanity(text) {
  let cleaned = text;
  for (const word of BANNED_WORDS) {
    const reg = new RegExp(`\\b${word}\\b`, 'gi');
    cleaned = cleaned.replace(reg, '****');
  }
  return cleaned;
}

// GET /api/chat/:claimId (U5)
router.get('/:claimId', authenticate, (req, res) => {
  const claim = db.claims.find(c => c.id === req.params.claimId);
  if (!claim) {
    return res.status(404).json({ error: 'Claim session not found' });
  }

  const item = db.items.find(i => i.id === claim.item_id);
  const isClaimant = claim.claimant_id === req.user.id;
  const isFinder = item && item.user_id === req.user.id;
  const isAdmin = req.user.role === 'ADMIN';

  if (!isClaimant && !isFinder && !isAdmin) {
    return res.status(403).json({ error: 'Access denied: You are not a party in this claim chat.' });
  }

  const chatMessages = db.messages
    .filter(m => m.claim_id === claim.id)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .map(m => {
      const sender = db.profiles.find(p => p.id === m.sender_id);
      return {
        id: m.id,
        sender_id: m.sender_id,
        sender_name: sender ? sender.name : 'Participant',
        sender_role: sender ? sender.role : 'STUDENT',
        is_me: m.sender_id === req.user.id,
        body: m.body,
        created_at: m.created_at
      };
    });

  const claimant = db.profiles.find(p => p.id === claim.claimant_id);
  const finder = db.profiles.find(p => p.id === item?.user_id);
  const bothShared = (claim.claimant_contact_shared && claim.finder_contact_shared) || isAdmin;

  res.json({
    claimId: claim.id,
    itemTitle: item?.title || 'Claimed Item',
    bothShared,
    contactDetails: bothShared ? {
      claimant: claimant ? { name: claimant.name, phone: claimant.phone, email: claimant.email } : null,
      finder: finder ? { name: finder.name, phone: finder.phone, email: finder.email } : null
    } : null,
    messages: chatMessages
  });
});

// POST /api/chat/:claimId (Send message)
router.post('/:claimId', authenticate, (req, res) => {
  const { body } = req.body;
  if (!body || !body.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }

  const claim = db.claims.find(c => c.id === req.params.claimId);
  if (!claim) {
    return res.status(404).json({ error: 'Claim session not found' });
  }

  const item = db.items.find(i => i.id === claim.item_id);
  const isClaimant = claim.claimant_id === req.user.id;
  const isFinder = item && item.user_id === req.user.id;
  const isAdmin = req.user.role === 'ADMIN';

  if (!isClaimant && !isFinder && !isAdmin) {
    return res.status(403).json({ error: 'Access denied: You cannot send messages in this chat.' });
  }

  const cleanBody = filterProfanity(body.trim());

  const newMsg = {
    id: `msg-${Date.now()}`,
    claim_id: claim.id,
    sender_id: req.user.id,
    body: cleanBody,
    created_at: new Date().toISOString()
  };

  db.messages.push(newMsg);

  // Notify recipient
  const recipientId = isClaimant ? item.user_id : claim.claimant_id;
  db.notifications.push({
    id: `notif-${Date.now()}-chat`,
    user_id: recipientId,
    message: `New message from ${req.user.name} regarding claim on "${item.title}".`,
    link: `/dashboard`,
    is_read: false,
    created_at: new Date().toISOString()
  });

  res.status(201).json({
    message: 'Message sent',
    chatMessage: {
      ...newMsg,
      sender_name: req.user.name,
      sender_role: req.user.role,
      is_me: true
    }
  });
});

module.exports = router;
