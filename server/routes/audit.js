const express = require('express');
const { sql } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/audit — list audit logs (HQ only)
router.get('/', authenticate, authorize('hq_admin'), async (req, res) => {
  try {
    const result = await sql`
      SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 200
    `;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
