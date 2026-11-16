const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const itemsRoutes = require('./routes/items');
const claimsRoutes = require('./routes/claims');
const handoverRoutes = require('./routes/handover');
const chatRoutes = require('./routes/chat');
const notificationsRoutes = require('./routes/notifications');
const watchlistRoutes = require('./routes/watchlist');
const leaderboardRoutes = require('./routes/leaderboard');
const adminRoutes = require('./routes/admin');
const maintenanceRoutes = require('./routes/maintenance');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for photos & uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, '..', 'frontend', 'public', 'images')));

// API Routes (supports both /api/path and /path when invoked via serverless)
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/items', '/items'], itemsRoutes);
app.use(['/api/claims', '/claims'], claimsRoutes);
app.use(['/api/handover', '/handover'], handoverRoutes);
app.use(['/api/chat', '/chat'], chatRoutes);
app.use(['/api/notifications', '/notifications'], notificationsRoutes);
app.use(['/api/watchlist', '/watchlist'], watchlistRoutes);
app.use(['/api/leaderboard', '/leaderboard'], leaderboardRoutes);
app.use(['/api/admin', '/admin'], adminRoutes);
app.use(['/api/maintenance', '/maintenance'], maintenanceRoutes);

// Health check
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'ONLINE',
    app: 'RYMEC ReClaim-iT',
    college: 'Rao Bahadur Y. Mahabaleswarappa Engineering College',
    tagline: 'Lost it? Found it? Let\'s reunite them.',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error. Please try again later.' });
});

if (require.main === module || !process.env.NETLIFY) {
  app.listen(PORT, () => {
    console.log('===================================================================');
    console.log(`🚀 RYMEC ReClaim-iT API Server active on http://localhost:${PORT}`);
    console.log(`🏛️  Serving RYMEC Ballari Campus Lost & Found System`);
    console.log(`🔐 Admin: admin@college.edu | Admin@123`);
    console.log(`🎓 Student: ananya.rao@rymec.edu.in | Student@123`);
    console.log('===================================================================');
  });
}

module.exports = app;
