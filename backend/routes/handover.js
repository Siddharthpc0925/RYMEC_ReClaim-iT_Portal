const express = require('express');
const router = express.Router();
const { db } = require('../lib/db');
const { authenticate } = require('../middleware/auth');

// POST /api/handover/verify (U3 Handover Code Verification)
router.post('/verify', authenticate, (req, res) => {
  const { code } = req.body;
  if (!code || !code.trim()) {
    return res.status(400).json({ error: 'Please enter the 6-digit handover code or scan the QR code.' });
  }

  const result = db.verifyHandover(code, req.user);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({
    message: 'Handover verified successfully! Item marked as RETURNED.',
    item: result.item,
    claim: result.claim,
    pointsAwarded: result.pointsAwarded
  });
});

module.exports = router;
