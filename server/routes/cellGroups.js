const express = require('express');
const { sql } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/cell-groups — list all groups
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await sql`
      SELECT cg.*, m.first_name || ' ' || m.last_name AS leader_name,
        (SELECT COUNT(*) FROM cell_group_members WHERE cell_group_id = cg.id) AS member_count
      FROM cell_groups cg
      LEFT JOIN members m ON m.id = cg.leader_id
      ORDER BY cg.name
    `;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/cell-groups — create group
router.post('/', authenticate, authorize('hq_admin', 'pastor'), async (req, res) => {
  try {
    const { name, leader_id, meeting_day, meeting_time, location, zone } = req.body;
    const result = await sql`
      INSERT INTO cell_groups (name, leader_id, branch_id, meeting_day, meeting_time, location, zone)
      VALUES (${name}, ${leader_id}, ${req.user.branch_id}, ${meeting_day}, ${meeting_time}, ${location}, ${zone})
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/cell-groups/:id — update group
router.put('/:id', authenticate, authorize('hq_admin', 'pastor'), async (req, res) => {
  try {
    const { name, leader_id, meeting_day, meeting_time, location, zone } = req.body;
    const result = await sql`
      UPDATE cell_groups SET name = COALESCE(${name}, name), leader_id = COALESCE(${leader_id}, leader_id), meeting_day = COALESCE(${meeting_day}, meeting_day), meeting_time = COALESCE(${meeting_time}, meeting_time), location = COALESCE(${location}, location), zone = COALESCE(${zone}, zone) WHERE id = ${req.params.id} RETURNING *
    `;
    if (!result[0]) return res.status(404).json({ error: 'Cell group not found' });
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/cell-groups/:id
router.delete('/:id', authenticate, authorize('hq_admin'), async (req, res) => {
  try {
    await sql`DELETE FROM cell_groups WHERE id = ${req.params.id}`;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/cell-groups/:id/members — list members in group
router.get('/:id/members', authenticate, async (req, res) => {
  try {
    const result = await sql`
      SELECT cgm.*, m.first_name, m.last_name, m.phone, m.email, m.photo_url
      FROM cell_group_members cgm
      JOIN members m ON m.id = cgm.member_id
      WHERE cgm.cell_group_id = ${req.params.id}
      ORDER BY m.first_name
    `;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/cell-groups/:id/members — add member
router.post('/:id/members', authenticate, authorize('hq_admin', 'pastor'), async (req, res) => {
  try {
    const { member_id } = req.body;
    const result = await sql`
      INSERT INTO cell_group_members (cell_group_id, member_id)
      VALUES (${req.params.id}, ${member_id})
      ON CONFLICT (cell_group_id, member_id) DO NOTHING
      RETURNING *
    `;
    res.status(201).json(result[0] || { message: 'Already a member' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/cell-groups/:id/members/:memberId
router.delete('/:id/members/:memberId', authenticate, authorize('hq_admin', 'pastor'), async (req, res) => {
  try {
    await sql`DELETE FROM cell_group_members WHERE cell_group_id = ${req.params.id} AND member_id = ${req.params.memberId}`;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
