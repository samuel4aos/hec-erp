const express = require('express');
const { sql } = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/service-counts — submit count (ushers)
router.post('/', authenticate, async (req, res) => {
  try {
    const { service_type, men, women, children, first_timers, first_timers_list } = req.body;
    const result = await sql`
      INSERT INTO service_counts (branch_id, service_type, men, women, children, first_timers, entered_by, submitted)
      VALUES (${req.user.branch_id}, ${service_type || 'Sunday'}, ${men || 0}, ${women || 0}, ${children || 0}, ${first_timers || 0}, ${req.user.id}, true)
      RETURNING *
    `;

    // Insert first-timer follow-ups
    if (first_timers_list?.length) {
      for (const ft of first_timers_list) {
        await sql`
          INSERT INTO first_timer_followups (branch_id, full_name, phone, invited_by)
          VALUES (${req.user.branch_id}, ${ft.full_name}, ${ft.phone}, ${ft.invited_by})
        `;
      }
    }

    res.status(201).json(result[0]);
  } catch (err) {
    console.error('Service count error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/service-counts — list counts (branch-scoped)
router.get('/', authenticate, async (req, res) => {
  try {
    let result;
    if (req.user.role === 'hq_admin') {
      result = await sql`SELECT * FROM service_counts ORDER BY service_date DESC LIMIT 50`;
    } else {
      result = await sql`SELECT * FROM service_counts WHERE branch_id = ${req.user.branch_id} ORDER BY service_date DESC LIMIT 50`;
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
