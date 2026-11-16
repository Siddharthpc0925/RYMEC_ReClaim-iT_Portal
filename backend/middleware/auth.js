const jwt = require('jsonwebtoken');
const { db } = require('../lib/db');

const JWT_SECRET = process.env.JWT_SECRET || 'rymec-reclaim-it-super-secret-jwt-token-key-2026';

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.profiles.find(p => p.id === decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User account not found.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = db.profiles.find(p => p.id === decoded.id) || null;
    } catch (err) {
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied: Admin credentials required.' });
  }
  next();
}

module.exports = {
  authenticate,
  optionalAuthenticate,
  requireAdmin,
  JWT_SECRET
};
