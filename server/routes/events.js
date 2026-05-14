const express = require('express');
const { sql } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/events — upcoming events (public)
router.get('/', async (req, res) => {
  try {
    const result = await sql`
      SELECT * FROM events WHERE status = 'upcoming' AND start_date >= NOW() ORDER BY start_date ASC LIMIT 20
    `;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/events/all — all events (auth required)
router.get('/all', authenticate, async (req, res) => {
  try {
    const result = await sql`SELECT * FROM events ORDER BY start_date DESC LIMIT 50`;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/events — create event (pastors + hq_admin)
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, description, event_type, start_date, end_date, location, flyer_url, registration_required, max_attendees } = req.body;
    const branchId = req.user.branch_id;
    const result = await sql`
      INSERT INTO events (title, description, event_type, start_date, end_date, location, branch_id, flyer_url, registration_required, max_attendees, created_by)
      VALUES (${title}, ${description}, ${event_type}, ${start_date}, ${end_date}, ${location}, ${branchId}, ${flyer_url}, ${registration_required}, ${max_attendees}, ${req.user.id})
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (err) {
    console.error('Create event error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/events/:id/register — register for event
router.post('/:id/register', async (req, res) => {
  try {
    const { full_name, email, phone } = req.body;
    const result = await sql`
      INSERT INTO event_registrations (event_id, full_name, email, phone)
      VALUES (${req.params.id}, ${full_name}, ${email}, ${phone})
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/events/:id — update event
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { title, description, event_type, start_date, end_date, location, flyer_url, status } = req.body;
    const result = await sql`
      UPDATE events SET title = COALESCE(${title}, title), description = COALESCE(${description}, description), event_type = COALESCE(${event_type}, event_type), start_date = COALESCE(${start_date}, start_date), end_date = COALESCE(${end_date}, end_date), location = COALESCE(${location}, location), flyer_url = COALESCE(${flyer_url}, flyer_url), status = COALESCE(${status}, status) WHERE id = ${req.params.id} RETURNING *
    `;
    if (!result[0]) return res.status(404).json({ error: 'Event not found' });
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/events/:id
router.delete('/:id', authenticate, authorize('hq_admin'), async (req, res) => {
  try {
    await sql`DELETE FROM events WHERE id = ${req.params.id}`;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
