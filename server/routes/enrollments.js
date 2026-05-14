const express = require('express');
const { sql } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/enrollments — list enrollments (branch-scoped)
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await sql`
      SELECT me.*, c.title AS course_title, c.code AS course_code, m.first_name || ' ' || m.last_name AS member_name
      FROM member_enrollments me
      JOIN courses c ON c.id = me.course_id
      JOIN members m ON m.id = me.member_id
      ORDER BY me.created_at DESC LIMIT 100
    `;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/enrollments — enroll member in course
router.post('/', authenticate, authorize('hq_admin', 'pastor'), async (req, res) => {
  try {
    const { member_id, course_id } = req.body;
    if (!member_id || !course_id) return res.status(400).json({ error: 'member_id and course_id required' });
    const result = await sql`
      INSERT INTO member_enrollments (member_id, course_id)
      VALUES (${member_id}, ${course_id})
      ON CONFLICT (member_id, course_id) DO UPDATE SET current_module = member_enrollments.current_module
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (err) {
    console.error('Enrollment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/enrollments/:id/progress — update progress
router.put('/:id/progress', authenticate, async (req, res) => {
  try {
    const { current_module, progress, completed } = req.body;
    const result = await sql`
      UPDATE member_enrollments SET current_module = COALESCE(${current_module}, current_module), progress = COALESCE(${progress}, progress), completed = COALESCE(${completed}, completed), completed_at = CASE WHEN ${completed} = true THEN NOW() ELSE completed_at END
      WHERE id = ${req.params.id} RETURNING *
    `;
    if (!result[0]) return res.status(404).json({ error: 'Enrollment not found' });
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/enrollments/member/:memberId — member's enrollments
router.get('/member/:memberId', authenticate, async (req, res) => {
  try {
    const result = await sql`
      SELECT me.*, c.title AS course_title, c.code AS course_code, c.color, c.total_lessons
      FROM member_enrollments me
      JOIN courses c ON c.id = me.course_id
      WHERE me.member_id = ${req.params.memberId}
      ORDER BY me.created_at DESC
    `;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
