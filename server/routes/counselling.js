const express = require('express');
const { sql } = require('../db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// GET /api/counselling — list logs (branch-scoped)
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await sql`
      SELECT cl.*, m.first_name || ' ' || m.last_name AS member_name, u.full_name AS counsellor_name
      FROM counselling_logs cl
      JOIN members m ON m.id = cl.member_id
      LEFT JOIN users u ON u.id = cl.counsellor_id
      WHERE cl.branch_id = ${req.user.branch_id}
      ORDER BY cl.visit_date DESC LIMIT 100
    `;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/counselling — create log
router.post('/', authenticate, async (req, res) => {
  try {
    const { member_id, visit_date, visit_type, notes, follow_up_date, status } = req.body;
    const result = await sql`
      INSERT INTO counselling_logs (member_id, counsellor_id, branch_id, visit_date, visit_type, notes, follow_up_date, status)
      VALUES (${member_id}, ${req.user.id}, ${req.user.branch_id}, ${visit_date || new Date()}, ${visit_type || 'counselling'}, ${notes}, ${follow_up_date}, ${status || 'open'})
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/counselling/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { notes, follow_up_date, status } = req.body;
    const result = await sql`
      UPDATE counselling_logs SET notes = COALESCE(${notes}, notes), follow_up_date = COALESCE(${follow_up_date}, follow_up_date), status = COALESCE(${status}, status)
      WHERE id = ${req.params.id} RETURNING *
    `;
    if (!result[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/counselling/member/:memberId — history for a specific member
router.get('/member/:memberId', authenticate, async (req, res) => {
  try {
    const result = await sql`
      SELECT cl.*, u.full_name AS counsellor_name
      FROM counselling_logs cl
      LEFT JOIN users u ON u.id = cl.counsellor_id
      WHERE cl.member_id = ${req.params.memberId}
      ORDER BY cl.visit_date DESC
    `;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
