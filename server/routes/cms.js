const express = require('express');
const { sql } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/cms — get all site content (public)
router.get('/', async (req, res) => {
  try {
    const result = await sql`SELECT section, key, value, content_type FROM site_content ORDER BY section, key`;
    const grouped = {};
    for (const row of result) {
      if (!grouped[row.section]) grouped[row.section] = {};
      grouped[row.section][row.key.replace(row.section + '.', '')] = row.value;
    }
    res.json(grouped);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/cms — update site content (HQ only)
router.put('/', authenticate, authorize('hq_admin'), async (req, res) => {
  try {
    const updates = req.body; // { key: value, ... }
    const keys = Object.keys(updates);
    for (const key of keys) {
      const section = key.split('.')[0];
      await sql`
        INSERT INTO site_content (section, key, value, updated_by)
        VALUES (${section}, ${key}, ${updates[key]}, ${req.user.id})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_by = EXCLUDED.updated_by, updated_at = NOW()
      `;
    }
    res.json({ success: true, updated: keys.length });
  } catch (err) {
    console.error('CMS update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
