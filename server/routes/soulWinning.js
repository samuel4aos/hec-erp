const express = require('express');
const { sql } = require('../db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// POST /api/soul-winning — log a soul won
router.post('/', authenticate, async (req, res) => {
  try {
    const { soul_name, soul_phone, soul_address, service_attended, notes } = req.body;
    const result = await sql`
      INSERT INTO soul_winning (member_id, branch_id, soul_name, soul_phone, soul_address, service_attended, notes)
      VALUES (${req.body.member_id || req.user.id}, ${req.user.branch_id}, ${soul_name}, ${soul_phone}, ${soul_address}, ${service_attended}, ${notes})
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/soul-winning — list souls won (branch-scoped)
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await sql`
      SELECT sw.*, m.first_name || ' ' || m.last_name AS won_by_name
      FROM soul_winning sw
      JOIN members m ON m.id = sw.member_id
      WHERE sw.branch_id = ${req.user.branch_id}
      ORDER BY sw.date_won DESC LIMIT 100
    `;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/soul-winning/leaderboard — monthly leaderboard
router.get('/leaderboard', authenticate, async (req, res) => {
  try {
    const result = await sql`
      SELECT m.id, m.first_name, m.last_name, m.photo_url, COUNT(sw.id)::int AS souls_won
      FROM soul_winning sw
      JOIN members m ON m.id = sw.member_id
      WHERE sw.branch_id = ${req.user.branch_id}
        AND EXTRACT(MONTH FROM sw.date_won) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM sw.date_won) = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY m.id, m.first_name, m.last_name, m.photo_url
      ORDER BY souls_won DESC LIMIT 20
    `;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/soul-winning/my-stats — current user's soul winning stats
router.get('/my-stats', authenticate, async (req, res) => {
  try {
    const monthly = await sql`
      SELECT COUNT(*)::int AS count FROM soul_winning 
      WHERE member_id = ${req.user.id} 
        AND EXTRACT(MONTH FROM date_won) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM date_won) = EXTRACT(YEAR FROM CURRENT_DATE)
    `;
    const total = await sql`
      SELECT COUNT(*)::int AS count FROM soul_winning WHERE member_id = ${req.user.id}
    `;
    const target = await sql`
      SELECT target FROM soul_winning_targets 
      WHERE member_id = ${req.user.id} AND month = EXTRACT(MONTH FROM CURRENT_DATE) AND year = EXTRACT(YEAR FROM CURRENT_DATE)
    `;
    res.json({
      monthly: monthly[0]?.count || 0,
      total: total[0]?.count || 0,
      target: target[0]?.target || 5,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/soul-winning/target — set monthly target
router.post('/target', authenticate, async (req, res) => {
  try {
    const { member_id, target } = req.body;
    const now = new Date();
    const result = await sql`
      INSERT INTO soul_winning_targets (branch_id, member_id, month, year, target)
      VALUES (${req.user.branch_id}, ${member_id || req.user.id}, ${now.getMonth() + 1}, ${now.getFullYear()}, ${target || 5})
      ON CONFLICT (member_id, month, year) DO UPDATE SET target = EXCLUDED.target
      RETURNING *
    `;
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
