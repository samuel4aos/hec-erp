const express = require('express');
const { sql } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/courses — public list
router.get('/', async (req, res) => {
  try {
    const result = await sql`SELECT * FROM courses ORDER BY ordering`;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/courses — create course
router.post('/', authenticate, authorize('hq_admin'), async (req, res) => {
  try {
    const { title, code, instructor, description, duration_weeks, total_lessons, color, badge, is_locked, ordering } = req.body;
    if (!title || !code) return res.status(400).json({ error: 'Title and code required' });
    const result = await sql`
      INSERT INTO courses (title, code, instructor, description, duration_weeks, total_lessons, color, badge, is_locked, ordering)
      VALUES (${title}, ${code}, ${instructor}, ${description}, ${duration_weeks}, ${total_lessons}, ${color}, ${badge}, ${is_locked || false}, ${ordering || 0})
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (err) {
    console.error('Create course error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/courses/:id — update course
router.put('/:id', authenticate, authorize('hq_admin'), async (req, res) => {
  try {
    const { title, instructor, description, duration_weeks, total_lessons, color, badge, is_locked, ordering } = req.body;
    const result = await sql`
      UPDATE courses SET title = COALESCE(${title}, title), instructor = COALESCE(${instructor}, instructor), description = COALESCE(${description}, description), duration_weeks = COALESCE(${duration_weeks}, duration_weeks), total_lessons = COALESCE(${total_lessons}, total_lessons), color = COALESCE(${color}, color), badge = COALESCE(${badge}, badge), is_locked = COALESCE(${is_locked}, is_locked), ordering = COALESCE(${ordering}, ordering) WHERE id = ${req.params.id} RETURNING *
    `;
    if (!result[0]) return res.status(404).json({ error: 'Course not found' });
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/courses/:id
router.delete('/:id', authenticate, authorize('hq_admin'), async (req, res) => {
  try {
    await sql`DELETE FROM courses WHERE id = ${req.params.id}`;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/courses/:id/modules — get course modules
router.get('/:id/modules', async (req, res) => {
  try {
    const result = await sql`SELECT * FROM course_modules WHERE course_id = ${req.params.id} ORDER BY ordering`;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
