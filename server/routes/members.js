const express = require('express');
const { sql } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/members — list members (branch-scoped)
router.get('/', authenticate, async (req, res) => {
  try {
    let query;
    if (req.user.role === 'hq_admin') {
      query = sql`
        SELECT m.*, b.name AS branch_name, b.city AS branch_city, b.country AS branch_country
        FROM members m
        LEFT JOIN branches b ON b.id = m.branch_id
        ORDER BY m.created_at DESC LIMIT 100
      `;
    } else {
      query = sql`
        SELECT m.*, b.name AS branch_name, b.city AS branch_city, b.country AS branch_country
        FROM members m
        LEFT JOIN branches b ON b.id = m.branch_id
        WHERE m.branch_id = ${req.user.branch_id}
        ORDER BY m.created_at DESC LIMIT 100
      `;
    }
    const members = await query;
    res.json(members);
  } catch (err) {
    console.error('Members list error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/members/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await sql`SELECT * FROM members WHERE id = ${req.params.id}`;
    if (!result[0]) return res.status(404).json({ error: 'Member not found' });
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/members — create member
router.post('/', authenticate, async (req, res) => {
  try {
    const { first_name, last_name, email, phone, gender, date_of_birth, marital_status, occupation, address, city, state_province, country, emergency_contact_name, emergency_contact_phone, spiritual_gifts, departments, notes, first_timer_date } = req.body;
    const branchId = req.user.role === 'hq_admin' ? (req.body.branch_id || req.user.branch_id) : req.user.branch_id;

    const result = await sql`
      INSERT INTO members (first_name, last_name, email, phone, gender, date_of_birth, marital_status, occupation, address, city, state_province, country, branch_id, emergency_contact_name, emergency_contact_phone, spiritual_gifts, departments, notes, first_timer_date)
      VALUES (${first_name}, ${last_name}, ${email}, ${phone}, ${gender}, ${date_of_birth}, ${marital_status}, ${occupation}, ${address}, ${city}, ${state_province}, ${country}, ${branchId}, ${emergency_contact_name}, ${emergency_contact_phone}, ${spiritual_gifts}, ${departments}, ${notes}, ${first_timer_date})
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (err) {
    console.error('Create member error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/members/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { first_name, last_name, email, phone, gender, date_of_birth, marital_status, occupation, address, city, state_province, country, emergency_contact_name, emergency_contact_phone, spiritual_gifts, departments, notes, membership_status, photo_url } = req.body;
    const result = await sql`
      UPDATE members SET first_name = COALESCE(${first_name}, first_name), last_name = COALESCE(${last_name}, last_name), email = COALESCE(${email}, email), phone = COALESCE(${phone}, phone), gender = COALESCE(${gender}, gender), date_of_birth = COALESCE(${date_of_birth}, date_of_birth), marital_status = COALESCE(${marital_status}, marital_status), occupation = COALESCE(${occupation}, occupation), address = COALESCE(${address}, address), city = COALESCE(${city}, city), state_province = COALESCE(${state_province}, state_province), country = COALESCE(${country}, country), emergency_contact_name = COALESCE(${emergency_contact_name}, emergency_contact_name), emergency_contact_phone = COALESCE(${emergency_contact_phone}, emergency_contact_phone), spiritual_gifts = COALESCE(${spiritual_gifts}, spiritual_gifts), departments = COALESCE(${departments}, departments), notes = COALESCE(${notes}, notes), membership_status = COALESCE(${membership_status}, membership_status), photo_url = COALESCE(${photo_url}, photo_url), updated_at = NOW() WHERE id = ${req.params.id} RETURNING *
    `;
    if (!result[0]) return res.status(404).json({ error: 'Member not found' });
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/members/birthdays/today — members with birthday today
router.get('/birthdays/today', authenticate, async (req, res) => {
  try {
    const result = await sql`
      SELECT id, first_name, last_name, phone, email, branch_id
      FROM members
      WHERE EXTRACT(MONTH FROM date_of_birth) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(DAY FROM date_of_birth) = EXTRACT(DAY FROM CURRENT_DATE)
        AND membership_status = 'active'
    `;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/members/:id — delete member
router.delete('/:id', authenticate, authorize('hq_admin'), async (req, res) => {
  try {
    await sql`DELETE FROM members WHERE id = ${req.params.id}`;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/members/:id/generate-tithing-code
router.post('/:id/generate-tithing-code', authenticate, async (req, res) => {
  try {
    const code = `HEC-${req.params.id.slice(0, 6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    const result = await sql`UPDATE members SET tithing_code = ${code} WHERE id = ${req.params.id} RETURNING tithing_code`;
    if (!result[0]) return res.status(404).json({ error: 'Member not found' });
    res.json({ tithing_code: result[0].tithing_code });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
