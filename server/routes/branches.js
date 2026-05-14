const express = require('express');
const { sql } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/branches — list all branches (public)
router.get('/', async (req, res) => {
  try {
    const result = await sql`SELECT id, name, code, city, country, pastor_name, phone, email FROM branches WHERE status = 'active' ORDER BY name`;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/branches/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await sql`SELECT * FROM branches WHERE id = ${req.params.id}`;
    if (!result[0]) return res.status(404).json({ error: 'Branch not found' });
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/branches — create branch (HQ only)
router.post('/', authenticate, authorize('hq_admin'), async (req, res) => {
  try {
    const { name, code, location, city, country, pastor_name, email, phone, established_date } = req.body;
    const result = await sql`
      INSERT INTO branches (name, code, location, city, country, pastor_name, email, phone, established_date)
      VALUES (${name}, ${code}, ${location}, ${city}, ${country}, ${pastor_name}, ${email}, ${phone}, ${established_date})
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/branches/:id — update branch
router.put('/:id', authenticate, authorize('hq_admin'), async (req, res) => {
  try {
    const { name, code, location, city, country, pastor_name, email, phone, status } = req.body;
    const result = await sql`
      UPDATE branches SET name = COALESCE(${name}, name), code = COALESCE(${code}, code), location = COALESCE(${location}, location), city = COALESCE(${city}, city), country = COALESCE(${country}, country), pastor_name = COALESCE(${pastor_name}, pastor_name), email = COALESCE(${email}, email), phone = COALESCE(${phone}, phone), status = COALESCE(${status}, status) WHERE id = ${req.params.id} RETURNING *
    `;
    if (!result[0]) return res.status(404).json({ error: 'Branch not found' });
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/branches/:id
router.delete('/:id', authenticate, authorize('hq_admin'), async (req, res) => {
  try {
    await sql`DELETE FROM branches WHERE id = ${req.params.id}`;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
