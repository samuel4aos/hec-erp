const express = require('express');
const { sql } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/event-registrations — list all registrations
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await sql`
      SELECT er.*, e.title AS event_title, e.start_date, e.location AS event_location
      FROM event_registrations er
      JOIN events e ON e.id = er.event_id
      ORDER BY er.registered_at DESC
      LIMIT 100
    `;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/event-registrations/:eventId — registrations for specific event
router.get('/:eventId', authenticate, async (req, res) => {
  try {
    const result = await sql`
      SELECT er.*, e.title AS event_title
      FROM event_registrations er
      JOIN events e ON e.id = er.event_id
      WHERE er.event_id = ${req.params.eventId}
      ORDER BY er.registered_at DESC
    `;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/event-registrations/:id/checkin — toggle check-in
router.put('/:id/checkin', authenticate, authorize('hq_admin', 'pastor', 'ushers'), async (req, res) => {
  try {
    const reg = await sql`SELECT checked_in FROM event_registrations WHERE id = ${req.params.id}`;
    if (!reg[0]) return res.status(404).json({ error: 'Registration not found' });
    const result = await sql`
      UPDATE event_registrations SET checked_in = ${!reg[0].checked_in}
      WHERE id = ${req.params.id} RETURNING *
    `;
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
