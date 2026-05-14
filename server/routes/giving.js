const express = require('express');
const { sql } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// POST /api/giving — submit giving record
router.post('/', authenticate, async (req, res) => {
  try {
    const { member_id, full_name, amount, currency, purpose, payment_proof_url } = req.body;
    const branchId = req.user.branch_id;
    const result = await sql`
      INSERT INTO giving_records (member_id, full_name, branch_id, amount, currency, purpose, payment_proof_url)
      VALUES (${member_id}, ${full_name}, ${branchId}, ${amount}, ${currency || 'NGN'}, ${purpose}, ${payment_proof_url})
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/giving — list giving (branch-scoped)
router.get('/', authenticate, async (req, res) => {
  try {
    let result;
    if (req.user.role === 'hq_admin') {
      result = await sql`SELECT * FROM giving_records ORDER BY created_at DESC LIMIT 50`;
    } else if (req.user.role === 'treasurer' || req.user.role === 'pastor') {
      result = await sql`SELECT * FROM giving_records WHERE branch_id = ${req.user.branch_id} ORDER BY created_at DESC LIMIT 50`;
    } else {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/giving/:id/verify — verify giving (treasurer or hq_admin)
router.put('/:id/verify', authenticate, authorize('treasurer', 'hq_admin'), async (req, res) => {
  try {
    const result = await sql`
      UPDATE giving_records SET status = 'verified', verified_by = ${req.user.id}, verified_at = NOW()
      WHERE id = ${req.params.id} RETURNING *
    `;
    if (!result[0]) return res.status(404).json({ error: 'Record not found' });
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
