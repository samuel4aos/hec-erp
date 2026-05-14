const express = require('express');
const { sql } = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/first-timers — list follow-ups (branch-scoped)
router.get('/', authenticate, async (req, res) => {
  try {
    let result;
    if (req.user.role === 'hq_admin') {
      result = await sql`
        SELECT ft.*, b.name AS branch_name
        FROM first_timer_followups ft
        JOIN branches b ON b.id = ft.branch_id
        ORDER BY ft.created_at DESC LIMIT 100
      `;
    } else {
      result = await sql`
        SELECT ft.*, b.name AS branch_name
        FROM first_timer_followups ft
        JOIN branches b ON b.id = ft.branch_id
        WHERE ft.branch_id = ${req.user.branch_id}
        ORDER BY ft.created_at DESC LIMIT 100
      `;
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/first-timers/:id/status — update follow-up status
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const { follow_up_status, assigned_to } = req.body;
    const result = await sql`
      UPDATE first_timer_followups SET follow_up_status = COALESCE(${follow_up_status}, follow_up_status), assigned_to = COALESCE(${assigned_to}, assigned_to)
      WHERE id = ${req.params.id} RETURNING *
    `;
    if (!result[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/first-timers/stats — pipeline stats (branch-scoped)
router.get('/stats', authenticate, async (req, res) => {
  try {
    let result;
    if (req.user.role === 'hq_admin') {
      result = await sql`
        SELECT follow_up_status, COUNT(*)::int AS count
        FROM first_timer_followups
        GROUP BY follow_up_status
        ORDER BY follow_up_status
      `;
    } else {
      result = await sql`
        SELECT follow_up_status, COUNT(*)::int AS count
        FROM first_timer_followups
        WHERE branch_id = ${req.user.branch_id}
        GROUP BY follow_up_status
        ORDER BY follow_up_status
      `;
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
