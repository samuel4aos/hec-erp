const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_content (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      section VARCHAR(50) NOT NULL,
      key VARCHAR(100) UNIQUE NOT NULL,
      value TEXT,
      content_type VARCHAR(20) DEFAULT 'text',
      updated_by UUID,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log('✓ site_content table created');

  const seeds = [
    ['hero', 'hero.title', 'Holiness Without Which, No Man Shall See The Lord'],
    ['hero', 'hero.subtitle', 'The official global portal of the Holiness Evangelistic Church — uniting 142 branches across 4 continents under one anointing.'],
    ['stats', 'stats.branches', JSON.stringify({ value: '142', label: 'Global Branches' })],
    ['stats', 'stats.members', JSON.stringify({ value: '84,210', label: 'Active Members' })],
    ['stats', 'stats.souls', JSON.stringify({ value: '12,884', label: 'Souls Won (YTD)' })],
    ['stats', 'stats.protected', JSON.stringify({ value: '100%', label: 'RLS-Protected' })],
    ['overseer', 'overseer.name', 'Apostle Joshua O. Adekunle'],
    ['overseer', 'overseer.title', 'General Overseer'],
    ['overseer', 'overseer.bio', 'Called by God in 1986, Apostle Joshua O. Adekunle is the founder and General Overseer of the Holiness Evangelistic Church. With a mandate to preach Holiness, his ministry has spanned four decades across four continents.'],
    ['overseer', 'overseer.quote', 'The church is not a building — it is a people torchlit by the Spirit, walking in the beauty of holiness until the Master returns.'],
    ['video', 'video.title', 'The Beauty of Holiness'],
    ['video', 'video.preacher', 'Apostle Joshua O. Adekunle'],
    ['video', 'video.verse', 'Hebrews 12:14'],
    ['video', 'video.url', ''],
    ['ticker', 'ticker.messages', JSON.stringify(['Annual Convocation — Lagos HQ — Dec 18-22, 2026', 'New Branch Opening: Nairobi East', 'Global Fast & Prayer begins Monday', 'HEC Academy Cohort 14 open', 'Tithe remittance window closes 25th'])],
    ['social', 'social.facebook', 'https://facebook.com/holinessec'],
    ['social', 'social.instagram', 'https://instagram.com/holinessec'],
    ['social', 'social.youtube', 'https://youtube.com/@holinessec'],
    ['church', 'church.name', 'Holiness Evangelistic Church'],
    ['church', 'church.established', '1986'],
    ['church', 'church.address', '14, Holiness Way, Ikeja, Lagos · Nigeria'],
    ['church', 'church.phone', '+234 (0) 803 000 0000'],
    ['church', 'church.email', 'hq@holinessec.org'],
    ['live', 'live.is_active', 'true'],
    ['live', 'live.viewer_count', '8,412'],
    ['live', 'live.sermon_title', 'The Beauty of Holiness'],
    ['live', 'live.preacher', 'Apostle Joshua O. Adekunle'],
  ];

  for (const [section, key, value] of seeds) {
    await pool.query(
      'INSERT INTO site_content (section, key, value) VALUES ($1, $2, $3) ON CONFLICT (key) DO NOTHING',
      [section, key, value]
    );
  }
  console.log(`✓ ${seeds.length} content items seeded`);
  await pool.end();
}

migrate().catch(e => { console.error(e.message); pool.end(); });
