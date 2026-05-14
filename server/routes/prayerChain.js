const express = require('express');
const { sql } = require('../db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// GET /api/prayer-chain/intercessors — list intercessors
router.get('/intercessors', authenticate, async (req, res) => {
  try {
    const result = await sql`
      SELECT i.*, m.first_name || ' ' || m.last_name AS name, m.phone, m.city
      FROM intercessors i
      JOIN members m ON m.id = i.member_id
      WHERE i.is_active = true
    `;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/prayer-chain/assignments — list prayer assignments
router.get('/assignments', authenticate, async (req, res) => {
  try {
    const result = await sql`
      SELECT pa.*, pr.prayer_text, pr.category, pr.full_name AS requester,
             m.first_name || ' ' || m.last_name AS intercessor_name
      FROM prayer_assignments pa
      JOIN prayer_requests pr ON pr.id = pa.prayer_id
      JOIN intercessors i ON i.id = pa.intercessor_id
      JOIN members m ON m.id = i.member_id
      ORDER BY pa.created_at DESC LIMIT 50
    `;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/prayer-chain/assign — auto-assign prayer to intercessor
router.post('/assign', authenticate, async (req, res) => {
  try {
    const { prayer_id } = req.body;
    if (!prayer_id) return res.status(400).json({ error: 'prayer_id required' });

    // Get prayer category
    const prayer = await sql`SELECT id, category FROM prayer_requests WHERE id = ${prayer_id}`;
    if (!prayer[0]) return res.status(404).json({ error: 'Prayer not found' });

    const category = prayer[0].category || 'other';

    // Find matching intercessor (round-robin by least assignments)
    const intercessor = await sql`
      SELECT i.id, i.member_id FROM intercessors i
      WHERE ${category} = ANY(i.categories) AND i.is_active = true
      ORDER BY (SELECT COUNT(*) FROM prayer_assignments WHERE intercessor_id = i.id) ASC
      LIMIT 1
    `;

    if (!intercessor[0]) return res.status(404).json({ error: 'No available intercessor for this category' });

    const result = await sql`
      INSERT INTO prayer_assignments (prayer_id, intercessor_id, assigned_by)
      VALUES (${prayer_id}, ${intercessor[0].id}, ${req.user.id})
      RETURNING *
    `;

    // Also update prayer request status
    await sql`UPDATE prayer_requests SET status = 'assigned', assigned_to = ${intercessor[0].member_id} WHERE id = ${prayer_id}`;

    res.status(201).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/prayer-chain/assignments/:id/prayed — mark as prayed
router.put('/assignments/:id/prayed', authenticate, async (req, res) => {
  try {
    const result = await sql`
      UPDATE prayer_assignments SET status = 'prayed', prayed_at = NOW() WHERE id = ${req.params.id} RETURNING *
    `;
    if (!result[0]) return res.status(404).json({ error: 'Assignment not found' });
    // Also update prayer status
    await sql`UPDATE prayer_requests SET status = 'prayed_for' WHERE id = ${result[0].prayer_id}`;
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
