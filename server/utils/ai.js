const OpenAI = require('openai');

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

async function categorizePrayer(text) {
  const openai = getOpenAI();
  if (!openai) return 'other';
  try {
    const resp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a prayer request categorizer. Categorize the prayer into exactly one of: healing, finance, family, career, spiritual, salvation, deliverance, marriage, travel, other. Reply with only the category word.',
        },
        { role: 'user', content: text },
      ],
      max_tokens: 10,
      temperature: 0,
    });
    return resp.choices[0]?.message?.content?.trim().toLowerCase() || 'other';
  } catch (err) {
    console.error('AI categorization error:', err);
    return 'other';
  }
}

async function generateSermonNotes(transcript) {
  const openai = getOpenAI();
  if (!openai) return '';
  try {
    const resp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a sermon note-taker. Given a sermon transcript, produce:\n1. Main scripture references\n2. 3-5 key points\n3. A one-paragraph summary\n4. 3 discussion questions\n5. A prayer point',
        },
        { role: 'user', content: transcript },
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });
    return resp.choices[0]?.message?.content || '';
  } catch (err) {
    console.error('AI sermon notes error:', err);
    return '';
  }
}

async function generatePrayerResponse(prayerText, memberName) {
  const openai = getOpenAI();
  if (!openai) return 'Your prayer request has been received. The HEC intercessory team is praying with you.';
  try {
    const resp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a compassionate church prayer responder. Given a prayer request, generate a short, warm SMS reply (max 160 chars) affirming that the church is praying.',
        },
        {
          role: 'user',
          content: `Prayer from ${memberName}: ${prayerText}`,
        },
      ],
      max_tokens: 80,
      temperature: 0.5,
    });
    return resp.choices[0]?.message?.content?.trim() || 'Your prayer request has been received. The HEC intercessory team is praying with you.';
  } catch (err) {
    console.error('AI prayer response error:', err);
    return 'Your prayer request has been received. The HEC intercessory team is praying with you.';
  }
}

module.exports = { categorizePrayer, generateSermonNotes, generatePrayerResponse };
