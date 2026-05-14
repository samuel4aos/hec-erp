// WhatsApp Cloud API integration via Meta's API
// Requires: WhatsApp Business Account + Permanent Token

const WHATSAPP_API = 'https://graph.facebook.com/v18.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const TOKEN = process.env.WHATSAPP_TOKEN;

async function sendWhatsApp(to, message) {
  if (!TOKEN || !PHONE_NUMBER_ID) {
    console.warn('WhatsApp not configured. Set WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID');
    return { error: 'WhatsApp not configured' };
  }
  try {
    const resp = await fetch(`${WHATSAPP_API}/${PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to.replace(/[^0-9]/g, ''),
        type: 'text',
        text: { body: message },
      }),
    });
    return await resp.json();
  } catch (err) {
    console.error('WhatsApp send error:', err);
    return { error: err.message };
  }
}

async function sendWhatsAppTemplate(to, templateName, params) {
  if (!TOKEN || !PHONE_NUMBER_ID) return { error: 'WhatsApp not configured' };
  try {
    const resp = await fetch(`${WHATSAPP_API}/${PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to.replace(/[^0-9]/g, ''),
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'en' },
          components: params ? [{ type: 'body', parameters: params.map((p) => ({ type: 'text', text: p })) }] : [],
        },
      }),
    });
    return await resp.json();
  } catch (err) {
    console.error('WhatsApp template error:', err);
    return { error: err.message };
  }
}

module.exports = { sendWhatsApp, sendWhatsAppTemplate };
