const express = require('express');
const { sql } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// POST /api/remittances — submit remittance (treasurer)
router.post('/', authenticate, authorize('treasurer', 'hq_admin'), async (req, res) => {
  try {
    const { amount, currency, teller_url, notes, period } = req.body;
    const result = await sql`
      INSERT INTO remittances (branch_id, amount, currency, teller_url, notes, period, entered_by)
      VALUES (${req.user.branch_id}, ${amount}, ${currency || 'NGN'}, ${teller_url}, ${notes}, ${period}, ${req.user.id})
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (err) {
    console.error('Remittance create error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/remittances — list remittances (branch-scoped)
router.get('/', authenticate, async (req, res) => {
  try {
    let result;
    if (req.user.role === 'hq_admin') {
      result = await sql`
        SELECT r.*, b.name AS branch_name, u.full_name AS entered_by_name
        FROM remittances r
        JOIN branches b ON b.id = r.branch_id
        LEFT JOIN users u ON u.id = r.entered_by
        ORDER BY r.created_at DESC LIMIT 100
      `;
    } else {
      result = await sql`
        SELECT r.*, u.full_name AS entered_by_name
        FROM remittances r
        LEFT JOIN users u ON u.id = r.entered_by
        WHERE r.branch_id = ${req.user.branch_id}
        ORDER BY r.created_at DESC LIMIT 50
      `;
    }
    res.json(result);
  } catch (err) {
    console.error('Remittance list error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/remittances/:id/reconcile — reconcile remittance (HQ only)
router.put('/:id/reconcile', authenticate, authorize('hq_admin'), async (req, res) => {
  try {
    const result = await sql`
      UPDATE remittances SET status = 'reconciled', reconciled_by = ${req.user.id}, reconciled_at = NOW()
      WHERE id = ${req.params.id} RETURNING *
    `;
    if (!result[0]) return res.status(404).json({ error: 'Remittance not found' });
    res.json(result[0]);
  } catch (err) {
    console.error('Remittance reconcile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
