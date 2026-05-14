const TERMII_BASE = 'https://api.termii.com/v1';

async function sendSMS(to, message) {
  try {
    const resp = await fetch(`${TERMII_BASE}/sms/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.TERMII_API_KEY,
        to,
        from: process.env.TERMII_SENDER_ID || 'HECPortal',
        sms: message,
        type: 'plain',
        channel: 'generic',
      }),
    });
    return await resp.json();
  } catch (err) {
    console.error('Termii SMS error:', err);
    return { error: err.message };
  }
}

async function sendBulkSMS(numbers, message) {
  const results = [];
  for (const num of numbers) {
    const r = await sendSMS(num, message);
    results.push(r);
  }
  return results;
}

module.exports = { sendSMS, sendBulkSMS };
