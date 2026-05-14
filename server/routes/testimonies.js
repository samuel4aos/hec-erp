const express = require('express');
const { sql } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/testimonies — public
router.get('/', async (req, res) => {
  try {
    const result = await sql`SELECT * FROM testimonies WHERE status = 'approved' ORDER BY likes DESC, created_at DESC LIMIT 20`;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/testimonies — submit testimony
router.post('/', async (req, res) => {
  try {
    const { member_id, full_name, title, body, has_video, video_url } = req.body;
    const result = await sql`
      INSERT INTO testimonies (member_id, full_name, title, body, has_video, video_url)
      VALUES (${member_id}, ${full_name}, ${title}, ${body}, ${has_video || false}, ${video_url})
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/testimonies/:id/approve — approve testimony (pastor/hq)
router.put('/:id/approve', authenticate, authorize('pastor', 'hq_admin'), async (req, res) => {
  try {
    const result = await sql`
      UPDATE testimonies SET status = 'approved', approved_by = ${req.user.id} WHERE id = ${req.params.id} RETURNING *
    `;
    if (!result[0]) return res.status(404).json({ error: 'Testimony not found' });
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/testimonies/:id/like — like testimony
router.post('/:id/like', async (req, res) => {
  try {
    const result = await sql`UPDATE testimonies SET likes = likes + 1 WHERE id = ${req.params.id} RETURNING likes`;
    if (!result[0]) return res.status(404).json({ error: 'Testimony not found' });
    res.json({ likes: result[0].likes });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
