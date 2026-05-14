const express = require('express');
const { sql } = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

function hqOnly(req, res) {
  if (req.user.role !== 'hq_admin') {
    res.status(403).json({ error: 'HQ access only' });
    return false;
  }
  return true;
}

// GET /api/analytics/attendance-velocity — monthly attendance per branch (last 12 months)
router.get('/attendance-velocity', authenticate, async (req, res) => {
  if (!hqOnly(req, res)) return;
  try {
    const result = await sql`
      SELECT
        TO_CHAR(service_date, 'Mon') AS m,
        EXTRACT(MONTH FROM service_date)::int AS month_num,
        b.name AS branch,
        SUM(men + women + children + first_timers)::int AS total
      FROM service_counts sc
      JOIN branches b ON b.id = sc.branch_id
      WHERE sc.service_date >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY month_num, m, b.name
      ORDER BY month_num, b.name
    `;
    res.json(result);
  } catch (err) {
    console.error('Analytics attendance velocity error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/analytics/financial-trends — monthly giving by purpose (last 12 months)
router.get('/financial-trends', authenticate, async (req, res) => {
  if (!hqOnly(req, res)) return;
  try {
    const result = await sql`
      SELECT
        TO_CHAR(created_at, 'Mon') AS m,
        EXTRACT(MONTH FROM created_at)::int AS month_num,
        COALESCE(purpose, 'offering') AS purpose,
        SUM(amount)::float AS total
      FROM giving_records
      WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY month_num, m, purpose
      ORDER BY month_num, purpose
    `;
    res.json(result);
  } catch (err) {
    console.error('Analytics financial trends error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/analytics/souls-trends — monthly souls won (last 12 months)
router.get('/souls-trends', authenticate, async (req, res) => {
  if (!hqOnly(req, res)) return;
  try {
    const souls = await sql`
      SELECT
        TO_CHAR(date_won, 'Mon') AS m,
        EXTRACT(MONTH FROM date_won)::int AS month_num,
        COUNT(*)::int AS souls
      FROM soul_winning
      WHERE date_won >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY month_num, m
      ORDER BY month_num
    `;
    const retained = await sql`
      SELECT
        TO_CHAR(created_at, 'Mon') AS m,
        EXTRACT(MONTH FROM created_at)::int AS month_num,
        COUNT(*)::int AS retained
      FROM first_timer_followups
      WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
        AND follow_up_status IN ('contacted', 'visited', 'enrolled')
      GROUP BY month_num, m
      ORDER BY month_num
    `;
    res.json({ souls, retained });
  } catch (err) {
    console.error('Analytics souls trends error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/analytics/demographics — congregation split
router.get('/demographics', authenticate, async (req, res) => {
  if (!hqOnly(req, res)) return;
  try {
    const members = await sql`SELECT gender, date_of_birth FROM members WHERE membership_status = 'active'`;
    let men = 0, women = 0, youth = 0, children = 0;
    const now = new Date();
    for (const m of members) {
      if (m.gender?.toLowerCase() === 'male') {
        men++;
        if (m.date_of_birth) {
          const age = Math.floor((now.getTime() - new Date(m.date_of_birth).getTime()) / 31557600000);
          if (age < 13) children++;
          else if (age < 30) youth++;
        }
      } else if (m.gender?.toLowerCase() === 'female') {
        women++;
        if (m.date_of_birth) {
          const age = Math.floor((now.getTime() - new Date(m.date_of_birth).getTime()) / 31557600000);
          if (age < 13) children++;
          else if (age < 30) youth++;
        }
      }
    }
    const total = men + women;
    res.json({
      split: [
        { name: 'Men', value: total ? Math.round((men / total) * 100) : 31, color: '#800000' },
        { name: 'Women', value: total ? Math.round((women / total) * 100) : 38, color: '#d4af37' },
        { name: 'Youth', value: total ? Math.round((youth / total) * 100) : 19, color: '#006400' },
        { name: 'Children', value: total ? Math.round((children / total) * 100) : 12, color: '#a32020' },
      ],
    });
  } catch (err) {
    console.error('Analytics demographics error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/analytics/heatmap — weekly attendance by branch (last 4 weeks)
router.get('/heatmap', authenticate, async (req, res) => {
  if (!hqOnly(req, res)) return;
  try {
    const result = await sql`
      SELECT
        b.name AS branch,
        EXTRACT(WEEK FROM sc.service_date)::int AS week_num,
        SUM(men + women + children + first_timers)::int AS total
      FROM service_counts sc
      JOIN branches b ON b.id = sc.branch_id
      WHERE sc.service_date >= CURRENT_DATE - INTERVAL '4 weeks'
      GROUP BY b.name, week_num
      ORDER BY b.name, week_num
    `;
    res.json(result);
  } catch (err) {
    console.error('Analytics heatmap error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
