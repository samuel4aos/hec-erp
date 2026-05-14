const express = require('express');
const { sql } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/bookstore/products — public (live only), auth (all)
router.get('/products', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let result;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      result = await sql`SELECT * FROM bookstore_products ORDER BY created_at DESC`;
    } else {
      result = await sql`SELECT * FROM bookstore_products WHERE status = 'live' ORDER BY created_at DESC`;
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/bookstore/products — create product (HQ only)
router.post('/products', authenticate, authorize('hq_admin'), async (req, res) => {
  try {
    const { title, author, price, color1, color2, rating, reviews, status } = req.body;
    if (!title || !price) return res.status(400).json({ error: 'Title and price required' });
    const result = await sql`
      INSERT INTO bookstore_products (title, author, price, color1, color2, rating, reviews, status, created_by)
      VALUES (${title}, ${author || ''}, ${price}, ${color1 || '#800000'}, ${color2 || '#4a0000'}, ${rating || 5.0}, ${reviews || 0}, ${status || 'draft'}, ${req.user.id})
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/bookstore/orders — place order
router.post('/orders', async (req, res) => {
  try {
    const { items, full_name, email, total_amount, branch_id, address } = req.body;
    if (!items?.length) return res.status(400).json({ error: 'Cart is empty' });

    const orderRef = `HEC-BK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const order = await sql`
      INSERT INTO bookstore_orders (full_name, email, total_amount, branch_id, address)
      VALUES (${full_name}, ${email}, ${total_amount}, ${branch_id || null}, ${address || ''})
      RETURNING *
    `;

    for (const item of items) {
      await sql`
        INSERT INTO order_items (order_id, product_id, title, price)
        VALUES (${order[0].id}, ${item.product_id}, ${item.title}, ${item.price})
      `;
    }

    res.status(201).json(order[0]);
  } catch (err) {
    console.error('Order error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/bookstore/orders — list orders (auth)
router.get('/orders', authenticate, async (req, res) => {
  try {
    let result;
    if (req.user.role === 'hq_admin') {
      result = await sql`
        SELECT o.*, b.name AS branch_name
        FROM bookstore_orders o
        LEFT JOIN branches b ON b.id = o.branch_id
        ORDER BY o.created_at DESC LIMIT 50
      `;
    } else {
      result = await sql`
        SELECT o.*, b.name AS branch_name
        FROM bookstore_orders o
        LEFT JOIN branches b ON b.id = o.branch_id
        WHERE o.branch_id = ${req.user.branch_id}
        ORDER BY o.created_at DESC LIMIT 20
      `;
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/bookstore/products/:id — update product (HQ only)
router.put('/products/:id', authenticate, authorize('hq_admin'), async (req, res) => {
  try {
    const { title, author, price, status } = req.body;
    const result = await sql`
      UPDATE bookstore_products SET title = COALESCE(${title}, title), author = COALESCE(${author}, author), price = COALESCE(${price}, price), status = COALESCE(${status}, status) WHERE id = ${req.params.id} RETURNING *
    `;
    if (!result[0]) return res.status(404).json({ error: 'Product not found' });
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/bookstore/products/:id
router.delete('/products/:id', authenticate, authorize('hq_admin'), async (req, res) => {
  try {
    await sql`DELETE FROM bookstore_products WHERE id = ${req.params.id}`;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/bookstore/bank-accounts — active bank accounts (public for checkout)
router.get('/bank-accounts', async (_req, res) => {
  try {
    const result = await sql`SELECT * FROM bank_accounts WHERE is_active = true ORDER BY bank_name`;
    res.json(result);
  } catch (err) {
    console.error('Bank accounts error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/bookstore/bank-accounts — add bank account (HQ only)
router.post('/bank-accounts', authenticate, authorize('hq_admin'), async (req, res) => {
  try {
    const { bank_name, account_name, account_number, currency } = req.body;
    if (!bank_name || !account_name || !account_number) return res.status(400).json({ error: 'All fields required' });
    const result = await sql`
      INSERT INTO bank_accounts (bank_name, account_name, account_number, currency, created_by)
      VALUES (${bank_name}, ${account_name}, ${account_number}, ${currency || 'NGN'}, ${req.user.id})
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (err) {
    console.error('Create bank account error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/bookstore/bank-accounts/:id — delete bank account (HQ only)
router.delete('/bank-accounts/:id', authenticate, authorize('hq_admin'), async (req, res) => {
  try {
    await sql`DELETE FROM bank_accounts WHERE id = ${req.params.id}`;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/bookstore/orders/:id/verify — mark order as verified (HQ only)
router.put('/orders/:id/verify', authenticate, authorize('hq_admin'), async (req, res) => {
  try {
    const result = await sql`
      UPDATE bookstore_orders SET status = 'verified', verified_by = ${req.user.id}
      WHERE id = ${req.params.id} RETURNING *
    `;
    if (!result[0]) return res.status(404).json({ error: 'Order not found' });
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
