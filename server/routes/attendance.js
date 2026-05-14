const express = require('express');
const { sql } = require('../db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// POST /api/attendance/checkin — check in a member
router.post('/checkin', authenticate, async (req, res) => {
  try {
    const { member_id, service_type } = req.body;
    if (!member_id) return res.status(400).json({ error: 'member_id required' });
    const result = await sql`
      INSERT INTO attendance_records (member_id, branch_id, service_type, checked_in_by)
      VALUES (${member_id}, ${req.user.branch_id}, ${service_type || 'Sunday'}, ${req.user.id})
      ON CONFLICT (member_id, service_date, service_type) DO UPDATE SET check_in_time = NOW()
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/attendance/today — today's attendance for a branch
router.get('/today', authenticate, async (req, res) => {
  try {
    const result = await sql`
      SELECT ar.*, m.first_name, m.last_name, m.phone, m.photo_url
      FROM attendance_records ar
      JOIN members m ON m.id = ar.member_id
      WHERE ar.service_date = CURRENT_DATE AND ar.branch_id = ${req.user.branch_id}
      ORDER BY ar.check_in_time DESC
    `;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/attendance/member/:memberId — attendance history for a member
router.get('/member/:memberId', authenticate, async (req, res) => {
  try {
    const result = await sql`
      SELECT * FROM attendance_records WHERE member_id = ${req.params.memberId} ORDER BY service_date DESC LIMIT 50
    `;
    // Count consecutive missed Sundays
    const recent = await sql`
      SELECT service_date FROM attendance_records 
      WHERE member_id = ${req.params.memberId} AND service_type = 'Sunday'
      ORDER BY service_date DESC LIMIT 10
    `;
    const dates = recent.map(r => r.service_date);
    let missedStreak = 0;
    const d = new Date();
    for (let i = 0; i < 12; i++) {
      const sun = new Date(d);
      sun.setDate(d.getDate() - (d.getDay() + 7 * i));
      const sunStr = sun.toISOString().split('T')[0];
      if (!dates.some(ds => ds instanceof Date ? ds.toISOString().split('T')[0] === sunStr : ds === sunStr)) {
        missedStreak++;
      } else break;
    }
    res.json({ records: result, missed_streak: missedStreak, needs_care: missedStreak >= 3 });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/attendance/missed — members with 3+ missed Sundays (care alerts)
router.get('/missed', authenticate, async (req, res) => {
  try {
    const members = await sql`
      SELECT id, first_name, last_name, phone, email, city FROM members WHERE branch_id = ${req.user.branch_id} AND membership_status = 'active'
    `;
    const alerts = [];
    for (const m of members) {
      const recent = await sql`
        SELECT service_date FROM attendance_records 
        WHERE member_id = ${m.id} AND service_type = 'Sunday'
        ORDER BY service_date DESC LIMIT 10
      `;
      const dates = recent.map(r => r.service_date);
      let missedStreak = 0;
      const d = new Date();
      for (let i = 0; i < 12; i++) {
        const sun = new Date(d);
        sun.setDate(d.getDate() - (d.getDay() + 7 * i));
        const sunStr = sun.toISOString().split('T')[0];
        if (!dates.some(ds => ds instanceof Date ? ds.toISOString().split('T')[0] === sunStr : ds === sunStr)) {
          missedStreak++;
        } else break;
      }
      if (missedStreak >= 3) alerts.push({ member: m, missed_streak: missedStreak });
    }
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/attendance/summary — per-member attendance summary for a branch
router.get('/summary', authenticate, async (req, res) => {
  try {
    const branchId = req.query.branch_id || req.user.branch_id;
    const monthsBack = parseInt(req.query.months) || 6;
    const members = await sql`
      SELECT id, first_name, last_name, phone, photo_url, email, membership_status
      FROM members WHERE branch_id = ${branchId} AND membership_status = 'active'
      ORDER BY first_name
    `;
    const records = await sql`
      SELECT member_id, service_date, service_type, check_in_time
      FROM attendance_records
      WHERE branch_id = ${branchId}
        AND service_date >= CURRENT_DATE - (${monthsBack} || ' months')::INTERVAL
      ORDER BY service_date DESC
    `;
    const recordMap: Record<string, any[]> = {};
    for (const r of records) {
      if (!recordMap[r.member_id]) recordMap[r.member_id] = [];
      recordMap[r.member_id].push(r);
    }
    const totalSundays = await sql`
      SELECT COUNT(*)::int AS total
      FROM (
        SELECT DISTINCT service_date FROM attendance_records
        WHERE branch_id = ${branchId}
          AND service_date >= CURRENT_DATE - (${monthsBack} || ' months')::INTERVAL
      ) sub
    `;
    const sundayCount = totalSundays[0]?.total || 0;

    const result = members.map(m => {
      const attended = recordMap[m.id] || [];
      const sundayRecords = attended.filter(r => r.service_type === 'Sunday');
      const attendedCount = sundayRecords.length;
      const missedCount = Math.max(0, sundayCount - attendedCount);
      const lastAttended = sundayRecords.length > 0 ? sundayRecords[0].service_date : null;
      const attendanceRate = sundayCount > 0 ? Math.round((attendedCount / sundayCount) * 100) : 0;

      return {
        id: m.id,
        first_name: m.first_name,
        last_name: m.last_name,
        phone: m.phone,
        photo_url: m.photo_url,
        email: m.email,
        total_sundays: sundayCount,
        attended: attendedCount,
        missed: missedCount,
        attendance_rate: attendanceRate,
        last_attended: lastAttended,
        needs_care: missedCount >= 3,
      };
    });

    // Monthly trend per branch
    const monthlyTrend = await sql`
      SELECT
        TO_CHAR(service_date, 'YYYY-MM') AS month,
        EXTRACT(MONTH FROM service_date)::int AS month_num,
        EXTRACT(YEAR FROM service_date)::int AS year,
        SUM(men + women + children + first_timers)::int AS total
      FROM service_counts
      WHERE branch_id = ${branchId}
        AND service_date >= CURRENT_DATE - (${monthsBack} || ' months')::INTERVAL
      GROUP BY year, month_num, month
      ORDER BY year, month_num
    `;

    res.json({ members: result, monthlyTrend, totalSundays: sundayCount });
  } catch (err) {
    console.error('Attendance summary error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
