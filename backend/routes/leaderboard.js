const express = require('express');
const router = express.Router();
const { db } = require('../lib/db');
const { authenticate, optionalAuthenticate } = require('../middleware/auth');

function formatLeaderboardName(fullName) {
  if (!fullName) return 'Student';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
}

// GET /api/leaderboard (U12)
router.get('/', optionalAuthenticate, (req, res) => {
  const students = db.profiles
    .filter(p => p.role === 'STUDENT')
    .map(p => {
      const userBadges = db.badges.filter(b => b.user_id === p.id).map(b => b.badge);
      const returnsCount = db.pointsLedger.filter(
        pl => pl.user_id === p.id && pl.reason.startsWith('Returned item')
      ).length;

      return {
        id: p.id,
        displayName: formatLeaderboardName(p.name),
        fullName: req.user && req.user.id === p.id ? p.name : undefined,
        points: p.points || 0,
        returnsCount,
        badges: userBadges
      };
    })
    .sort((a, b) => b.points - a.points);

  res.json({
    month: 'November 2026',
    leaderboard: students
  });
});

// GET /api/leaderboard/certificate (U12 Certificate data)
router.get('/certificate', authenticate, (req, res) => {
  const user = req.user;
  const userBadges = db.badges.filter(b => b.user_id === user.id).map(b => b.badge);
  const returnsCount = db.pointsLedger.filter(
    pl => pl.user_id === user.id && pl.reason.startsWith('Returned item')
  ).length;

  if (returnsCount < 1 && user.points < 20) {
    return res.status(403).json({
      error: 'Certificate eligibility requires at least 1 successful item return on RYMEC ReClaim-iT.'
    });
  }

  const certificateData = {
    certificateId: `RYMEC-HONOR-${user.roll_no}-${new Date().getFullYear()}`,
    studentName: user.name,
    rollNumber: user.roll_no,
    college: 'Rao Bahadur Y. Mahabaleswarappa Engineering College (RYMEC), Ballari',
    title: 'Good Samaritan Citation of Honor',
    achievement: 'Exemplary Campus Integrity & Active Return of Lost Property',
    itemsReturned: returnsCount || 1,
    trustPoints: user.points,
    issueDate: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
    authorizedBy: 'Campus Proctor & Security Desk',
    verificationUrl: `http://localhost:5173/certificate?verify=${user.id}`
  };

  res.json({ certificate: certificateData });
});

module.exports = router;
