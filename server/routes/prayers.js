const express = require('express');
const { sql } = require('../db');
const { authenticate } = require('../middleware/auth');
const { categorizePrayer, generatePrayerResponse } = require('../utils/ai');
const { sendSMS } = require('../utils/sms');

const router = express.Router();

// GET /api/prayers — latest prayers (public, approved/prayed_for)
router.get('/', async (req, res) => {
  try {
    const result = await sql`
      SELECT id, full_name, prayer_text, category, is_anonymous, status, created_at
      FROM prayer_requests
      ORDER BY created_at DESC LIMIT 20
    `;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/prayers — submit prayer
router.post('/', async (req, res) => {
  try {
    const { prayer_text, full_name, phone, is_anonymous } = req.body;
    if (!prayer_text) return res.status(400).json({ error: 'Prayer text required' });

    // AI categorize the prayer
    const category = await categorizePrayer(prayer_text);

    // If member has phone, send AI-generated prayer response SMS
    let smsSent = false;
    if (phone) {
      const reply = await generatePrayerResponse(prayer_text, full_name || 'Beloved');
      try {
        await sendSMS(phone, reply);
        smsSent = true;
      } catch {}
    }

    const result = await sql`
      INSERT INTO prayer_requests (full_name, prayer_text, category, is_anonymous, ai_categorized)
      VALUES (${full_name || 'Anonymous'}, ${prayer_text}, ${category}, ${is_anonymous || false}, true)
      RETURNING id, full_name, prayer_text, category, is_anonymous, status, created_at
    `;

    res.status(201).json({ ...result[0], sms_sent: smsSent });
  } catch (err) {
    console.error('Prayer submit error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/prayers/categories — stats by category (auth)
router.get('/categories', authenticate, async (req, res) => {
  try {
    const result = await sql`
      SELECT category, COUNT(*) as count FROM prayer_requests GROUP BY category ORDER BY count DESC
    `;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
