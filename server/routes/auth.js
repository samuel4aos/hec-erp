const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sql } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await sql`SELECT * FROM users WHERE email = ${email} AND is_active = true`;
    const user = result[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await sql`UPDATE users SET last_login = NOW() WHERE id = ${user.id}`;

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        branch_id: user.branch_id,
        full_name: user.full_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Get branch info
    let branch = null;
    if (user.branch_id) {
      const branchResult = await sql`SELECT id, name, code, city, country FROM branches WHERE id = ${user.branch_id}`;
      branch = branchResult[0] || null;
    }

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        phone: user.phone,
        avatar_url: user.avatar_url,
        branch,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await sql`
      SELECT id, email, full_name, role, phone, avatar_url, branch_id, is_active, last_login, created_at
      FROM users WHERE id = ${req.user.id}
    `;
    const user = result[0];
    if (!user) return res.status(404).json({ error: 'User not found' });

    let branch = null;
    if (user.branch_id) {
      const branchResult = await sql`SELECT id, name, code, city, country FROM branches WHERE id = ${user.branch_id}`;
      branch = branchResult[0] || null;
    }

    res.json({ ...user, branch });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/users — list users (HQ only)
router.get('/users', authenticate, authorize('hq_admin'), async (req, res) => {
  try {
    const result = await sql`
      SELECT u.id, u.email, u.full_name, u.phone, u.role, u.is_active, u.last_login, u.created_at,
             b.name AS branch_name, b.code AS branch_code
      FROM users u
      LEFT JOIN branches b ON b.id = u.branch_id
      ORDER BY u.created_at DESC
    `;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/users — create user (HQ only)
router.post('/users', authenticate, authorize('hq_admin'), async (req, res) => {
  try {
    const { email, password, full_name, phone, role, branch_id } = req.body;
    if (!email || !password || !full_name || !role) return res.status(400).json({ error: 'Email, password, full_name, role required' });
    const hash = await bcrypt.hash(password, 10);
    const result = await sql`
      INSERT INTO users (email, password_hash, full_name, phone, role, branch_id)
      VALUES (${email}, ${hash}, ${full_name}, ${phone}, ${role}, ${branch_id})
      RETURNING id, email, full_name, role, phone, branch_id, created_at
    `;
    res.status(201).json(result[0]);
  } catch (err) {
    if (err.constraint === 'users_email_key') return res.status(409).json({ error: 'Email already exists' });
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/auth/users/:id — update user (HQ only)
router.put('/users/:id', authenticate, authorize('hq_admin'), async (req, res) => {
  try {
    const { full_name, phone, role, is_active, branch_id } = req.body;
    const result = await sql`
      UPDATE users SET full_name = COALESCE(${full_name}, full_name), phone = COALESCE(${phone}, phone), role = COALESCE(${role}, role), is_active = COALESCE(${is_active}, is_active), branch_id = COALESCE(${branch_id}, branch_id)
      WHERE id = ${req.params.id} RETURNING id, email, full_name, role, phone, is_active, branch_id
    `;
    if (!result[0]) return res.status(404).json({ error: 'User not found' });
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/demo-login — passwordless login for demo accounts
router.post('/demo-login', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const result = await sql`SELECT * FROM users WHERE email = ${email} AND is_active = true`;
    const user = result[0];
    if (!user) return res.status(401).json({ error: 'User not found' });

    await sql`UPDATE users SET last_login = NOW() WHERE id = ${user.id}`;

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, branch_id: user.branch_id, full_name: user.full_name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    let branch = null;
    if (user.branch_id) {
      const branchResult = await sql`SELECT id, name, code, city, country FROM branches WHERE id = ${user.branch_id}`;
      branch = branchResult[0] || null;
    }

    res.json({
      token,
      user: {
        id: user.id, email: user.email, full_name: user.full_name,
        role: user.role, phone: user.phone, avatar_url: user.avatar_url, branch,
      },
    });
  } catch (err) {
    console.error('Demo login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/branch-users — create branch-level users (pastor for own branch, or hq_admin)
router.post('/branch-users', authenticate, async (req, res) => {
  try {
    const { email, password, full_name, phone, role } = req.body;
    if (!email || !password || !full_name || !role) return res.status(400).json({ error: 'Email, password, full_name, role required' });

    // Pastors can only create ushers/treasurer roles in their own branch
    if (req.user.role === 'pastor' && !['ushers', 'treasurer', 'admin_staff'].includes(role)) {
      return res.status(403).json({ error: 'Pastors can only create ushers, treasurer, or admin_staff' });
    }
    // Only hq_admin can create pastors
    if (role === 'pastor' && req.user.role !== 'hq_admin') {
      return res.status(403).json({ error: 'Only HQ can create pastors' });
    }

    const branch_id = req.user.role === 'hq_admin' ? (req.body.branch_id || req.user.branch_id) : req.user.branch_id;
    if (!branch_id) return res.status(400).json({ error: 'Branch required' });

    const hash = await bcrypt.hash(password, 10);
    const result = await sql`
      INSERT INTO users (email, password_hash, full_name, phone, role, branch_id)
      VALUES (${email}, ${hash}, ${full_name}, ${phone}, ${role}, ${branch_id})
      RETURNING id, email, full_name, role, phone, branch_id, created_at
    `;
    res.status(201).json(result[0]);
  } catch (err) {
    if (err.constraint === 'users_email_key') return res.status(409).json({ error: 'Email already exists' });
    console.error('Create branch user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
