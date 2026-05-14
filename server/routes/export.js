const express = require('express');
const { sql } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

function toCSV(headers, rows) {
  const escape = (v) => `"${(v ?? '').toString().replace(/"/g, '""')}"`;
  const headerLine = headers.map(h => escape(h.label)).join(',');
  const dataLines = rows.map(row => headers.map(h => escape(row[h.key])).join(','));
  return [headerLine, ...dataLines].join('\r\n');
}

// GET /api/export/members — CSV export
router.get('/members', authenticate, authorize('hq_admin', 'pastor'), async (req, res) => {
  try {
    const members = await sql`
      SELECT m.first_name, m.last_name, m.email, m.phone, m.gender, m.date_of_birth, m.marital_status, m.occupation, m.city, m.country, m.membership_date, m.membership_status, m.tithing_code, b.name AS branch_name
      FROM members m
      JOIN branches b ON b.id = m.branch_id
      ORDER BY m.last_name
    `;
    const headers = [
      { key: 'first_name', label: 'First Name' }, { key: 'last_name', label: 'Last Name' },
      { key: 'email', label: 'Email' }, { key: 'phone', label: 'Phone' },
      { key: 'gender', label: 'Gender' }, { key: 'date_of_birth', label: 'Date of Birth' },
      { key: 'marital_status', label: 'Marital Status' }, { key: 'occupation', label: 'Occupation' },
      { key: 'city', label: 'City' }, { key: 'country', label: 'Country' },
      { key: 'membership_date', label: 'Membership Date' }, { key: 'membership_status', label: 'Status' },
      { key: 'tithing_code', label: 'Tithing Code' }, { key: 'branch_name', label: 'Branch' },
    ];
    const csv = toCSV(headers, members);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=hec-members-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/export/giving — CSV export
router.get('/giving', authenticate, authorize('hq_admin', 'treasurer'), async (req, res) => {
  try {
    const data = await sql`
      SELECT g.full_name, g.amount, g.currency, g.purpose, g.status, g.created_at, b.name AS branch_name
      FROM giving_records g
      JOIN branches b ON b.id = g.branch_id
      ORDER BY g.created_at DESC
    `;
    const headers = [
      { key: 'full_name', label: 'Name' }, { key: 'amount', label: 'Amount' },
      { key: 'currency', label: 'Currency' }, { key: 'purpose', label: 'Purpose' },
      { key: 'status', label: 'Status' }, { key: 'created_at', label: 'Date' },
      { key: 'branch_name', label: 'Branch' },
    ];
    const csv = toCSV(headers, data);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=hec-giving-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/export/attendance — CSV export
router.get('/attendance', authenticate, authorize('hq_admin', 'pastor'), async (req, res) => {
  try {
    const data = await sql`
      SELECT m.first_name || ' ' || m.last_name AS member_name, ar.service_date, ar.service_type, ar.check_in_time, b.name AS branch_name
      FROM attendance_records ar
      JOIN members m ON m.id = ar.member_id
      JOIN branches b ON b.id = ar.branch_id
      ORDER BY ar.service_date DESC LIMIT 1000
    `;
    const headers = [
      { key: 'member_name', label: 'Member Name' }, { key: 'service_date', label: 'Service Date' },
      { key: 'service_type', label: 'Service Type' }, { key: 'check_in_time', label: 'Check In Time' },
      { key: 'branch_name', label: 'Branch' },
    ];
    const csv = toCSV(headers, data);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=hec-attendance-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
