const express = require('express');
const { sql } = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/preacher-log — record a service (pastor/treasurer)
router.post('/', authenticate, async (req, res) => {
  try {
    const { service_date, service_type, preacher_name, sermon_title, sermon_notes, attendance_count, offering_amount } = req.body;
    const result = await sql`
      INSERT INTO preacher_log (branch_id, service_date, service_type, preacher_name, sermon_title, sermon_notes, attendance_count, offering_amount, recorded_by)
      VALUES (${req.user.branch_id}, ${service_date || new Date()}, ${service_type || 'Sunday'}, ${preacher_name}, ${sermon_title}, ${sermon_notes}, ${attendance_count || 0}, ${offering_amount || 0}, ${req.user.id})
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (err) {
    console.error('Preacher log error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/preacher-log — list records (branch-scoped)
router.get('/', authenticate, async (req, res) => {
  try {
    let result;
    if (req.user.role === 'hq_admin') {
      result = await sql`
        SELECT pl.*, b.name AS branch_name, u.full_name AS recorded_by_name
        FROM preacher_log pl
        JOIN branches b ON b.id = pl.branch_id
        LEFT JOIN users u ON u.id = pl.recorded_by
        ORDER BY pl.service_date DESC LIMIT 100
      `;
    } else {
      result = await sql`
        SELECT pl.*, u.full_name AS recorded_by_name
        FROM preacher_log pl
        LEFT JOIN users u ON u.id = pl.recorded_by
        WHERE pl.branch_id = ${req.user.branch_id}
        ORDER BY pl.service_date DESC LIMIT 50
      `;
    }
    res.json(result);
  } catch (err) {
    console.error('Preacher log list error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
