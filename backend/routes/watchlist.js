const express = require('express');
const router = express.Router();
const { db } = require('../lib/db');
const { authenticate } = require('../middleware/auth');

// GET /api/watchlist (U6)
router.get('/', authenticate, (req, res) => {
  const searches = db.savedSearches
    .filter(s => s.user_id === req.user.id)
    .map(s => {
      const loc = db.locations.find(l => l.id === s.location_id);
      return {
        ...s,
        location_name: loc ? loc.name : null
      };
    });

  res.json({ savedSearches: searches });
});

// POST /api/watchlist (Save new alert)
router.post('/', authenticate, (req, res) => {
  const { keywords, category, location_id } = req.body;

  if (!keywords && !category && !location_id) {
    return res.status(400).json({ error: 'Please provide at least keywords, a category, or a campus location.' });
  }

  const newSearch = {
    id: `ss-${Date.now()}`,
    user_id: req.user.id,
    keywords: keywords ? keywords.trim() : null,
    category: category ? category.trim() : null,
    location_id: location_id || null,
    created_at: new Date().toISOString()
  };

  db.savedSearches.push(newSearch);

  const loc = db.locations.find(l => l.id === newSearch.location_id);

  res.status(201).json({
    message: 'Watchlist alert created. You will receive an instant notification when a matching item is reported.',
    search: {
      ...newSearch,
      location_name: loc ? loc.name : null
    }
  });
});

// DELETE /api/watchlist/:id
router.delete('/:id', authenticate, (req, res) => {
  const index = db.savedSearches.findIndex(s => s.id === req.params.id && s.user_id === req.user.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Saved search not found' });
  }

  db.savedSearches.splice(index, 1);
  res.json({ message: 'Watchlist alert removed' });
});

module.exports = router;
