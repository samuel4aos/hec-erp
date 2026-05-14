const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail({ to, subject, html }) {
  try {
    const data = await resend.emails.send({
      from: 'HEC Portal <noreply@holinessec.org>',
      to,
      subject,
      html,
    });
    return data;
  } catch (err) {
    console.error('Resend email error:', err);
    return { error: err.message };
  }
}

module.exports = { sendEmail };
