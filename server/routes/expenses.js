const express = require('express');
const { sql } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// POST /api/expenses — create expense
router.post('/', authenticate, async (req, res) => {
  try {
    const { description, amount, currency, category, expense_date, receipt_url } = req.body;
    if (!description || !amount) return res.status(400).json({ error: 'Description and amount required' });
    const result = await sql`
      INSERT INTO expenses (branch_id, description, amount, currency, category, expense_date, receipt_url, entered_by)
      VALUES (${req.user.branch_id}, ${description}, ${amount}, ${currency || 'NGN'}, ${category || 'Operations'}, ${expense_date || new Date().toISOString().split('T')[0]}, ${receipt_url}, ${req.user.id})
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (err) {
    console.error('Create expense error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/expenses — list expenses (branch-scoped)
router.get('/', authenticate, async (req, res) => {
  try {
    let result;
    if (req.user.role === 'hq_admin') {
      result = await sql`SELECT e.*, u.full_name AS entered_by_name FROM expenses e LEFT JOIN users u ON u.id = e.entered_by ORDER BY e.created_at DESC LIMIT 100`;
    } else {
      result = await sql`SELECT e.*, u.full_name AS entered_by_name FROM expenses e LEFT JOIN users u ON u.id = e.entered_by WHERE e.branch_id = ${req.user.branch_id} ORDER BY e.created_at DESC LIMIT 100`;
    }
    res.json(result);
  } catch (err) {
    console.error('Expenses list error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
