const express = require('express');
const { sql } = require('../db');
const { authenticate } = require('../middleware/auth');
const { sendSMS } = require('../utils/sms');
const { sendEmail } = require('../utils/email');

const router = express.Router();

// POST /api/communication/birthday-check — check and send birthday wishes (called by cron)
router.post('/birthday-check', authenticate, async (req, res) => {
  try {
    const result = await sql`
      SELECT id, first_name, last_name, phone, email, branch_id FROM members
      WHERE EXTRACT(MONTH FROM date_of_birth) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(DAY FROM date_of_birth) = EXTRACT(DAY FROM CURRENT_DATE)
        AND membership_status = 'active'
    `;

    const sent = [];
    for (const member of result) {
      const message = `🎉 Happy Birthday ${member.first_name}! 🎂 The Holiness Evangelistic Church family celebrates you today. We pray God's abundant blessings over your new year. — HEC HQ`;
      const smsResult = await sendSMS(member.phone, message);

      await sql`
        INSERT INTO sms_log (member_id, phone, message, type, status)
        VALUES (${member.id}, ${member.phone}, ${message}, 'birthday', ${smsResult.error ? 'failed' : 'sent'})
      `;

      if (member.email) {
        const emailHtml = `<div style="font-family:Georgia,serif;color:#800000;text-align:center;padding:40px;background:#f8f3e3;"><h1>🎉 Happy Birthday ${member.first_name}!</h1><p style="font-size:18px;">The Holiness Evangelistic Church family celebrates you today. We pray God's abundant blessings over your new year.</p><p style="margin-top:30px;color:#d4af37;">— HEC Headquarters</p></div>`;
        const emailResult = await sendEmail({ to: member.email, subject: `🎉 Happy Birthday ${member.first_name}! — HEC`, html: emailHtml });
        await sql`
          INSERT INTO email_log (member_id, email, subject, type, status)
          VALUES (${member.id}, ${member.email}, 'Happy Birthday from HEC', 'birthday', ${emailResult.error ? 'failed' : 'sent'})
        `;
      }

      sent.push({ id: member.id, name: `${member.first_name} ${member.last_name}` });
    }

    res.json({ sent: sent.length, members: sent });
  } catch (err) {
    console.error('Birthday check error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/communication/send — send custom SMS/email (pastors/hq)
router.post('/send', authenticate, async (req, res) => {
  try {
    const { member_ids, message, type } = req.body;
    if (!member_ids?.length || !message) return res.status(400).json({ error: 'Members and message required' });

    const results = [];
    for (const id of member_ids) {
      const memberResult = await sql`SELECT id, first_name, last_name, phone, email FROM members WHERE id = ${id}`;
      const member = memberResult[0];
      if (!member) continue;

      if (type === 'sms' || !type) {
        const smsResult = await sendSMS(member.phone, message);
        await sql`INSERT INTO sms_log (member_id, phone, message, type, status) VALUES (${member.id}, ${member.phone}, ${message}, 'bulk', ${smsResult.error ? 'failed' : 'sent'})`;
        results.push({ id: member.id, type: 'sms', status: smsResult.error ? 'failed' : 'sent' });
      }

      if (type === 'email' && member.email) {
        const emailResult = await sendEmail({ to: member.email, subject: 'Message from HEC', html: `<p>${message}</p>` });
        await sql`INSERT INTO email_log (member_id, email, subject, type, status) VALUES (${member.id}, ${member.email}, 'Message from HEC', 'bulk', ${emailResult.error ? 'failed' : 'sent'})`;
        results.push({ id: member.id, type: 'email', status: emailResult.error ? 'failed' : 'sent' });
      }
    }

    res.json({ sent: results.length, results });
  } catch (err) {
    console.error('Send communication error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
