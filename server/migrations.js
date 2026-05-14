const { sql } = require('./db');

async function runMigrations() {
  // site_content table (used by CMS routes)
  await sql`
    CREATE TABLE IF NOT EXISTS site_content (
      id SERIAL PRIMARY KEY,
      section VARCHAR(100) NOT NULL DEFAULT 'general',
      key VARCHAR(255) UNIQUE NOT NULL,
      value TEXT,
      content_type VARCHAR(20) DEFAULT 'text',
      updated_by UUID REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // bank_accounts table (bookstore checkout)
  await sql`
    CREATE TABLE IF NOT EXISTS bank_accounts (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      bank_name VARCHAR(255) NOT NULL,
      account_name VARCHAR(255) NOT NULL,
      account_number VARCHAR(50) NOT NULL,
      currency VARCHAR(10) DEFAULT 'NGN',
      is_active BOOLEAN DEFAULT true,
      created_by UUID REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // preacher_log table (Sunday service preaching records)
  await sql`
    CREATE TABLE IF NOT EXISTS preacher_log (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      branch_id UUID REFERENCES branches(id),
      service_date DATE DEFAULT CURRENT_DATE,
      service_type VARCHAR(50) DEFAULT 'Sunday',
      preacher_name VARCHAR(255),
      sermon_title VARCHAR(500),
      sermon_notes TEXT,
      attendance_count INTEGER DEFAULT 0,
      offering_amount DECIMAL(12,2) DEFAULT 0,
      recorded_by UUID REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Add branch_id and address to bookstore_orders (public checkout info)
  await sql`
    ALTER TABLE bookstore_orders ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id)
  `;
  await sql`
    ALTER TABLE bookstore_orders ADD COLUMN IF NOT EXISTS address TEXT DEFAULT ''
  `;

  // Seed bookstore products if empty
  const existing = await sql`SELECT COUNT(*) as cnt FROM bookstore_products`;
  if (existing[0]?.cnt === 0) {
    await sql`
      INSERT INTO bookstore_products (title, author, price, color1, color2, rating, reviews, status) VALUES
      ('The Beauty of Holiness', 'Apostle J. Adekunle', 12.99, '#800000', '#4a0000', 4.9, 1284, 'live'),
      ('Prayer that Moves Mountains', 'Pst. E. Adekunle', 9.99, '#006400', '#003600', 4.8, 902, 'live'),
      ('Marriage by Fire', 'Pst. & Mrs. Adekunle', 14.99, '#d4af37', '#9a7d22', 5.0, 488, 'live'),
      ('The New Convert''s Companion', 'HEC Discipleship', 6.99, '#a32020', '#800000', 4.7, 2104, 'live'),
      ('Walking in Dominion', 'Apostle J. Adekunle', 11.99, '#2a8c2a', '#006400', 4.9, 712, 'live'),
      ('Daily Manna · Vol. III', 'HEC Devotional Press', 8.99, '#9a7d22', '#4a0000', 4.8, 1670, 'live')
    `;
    console.log('Seeded bookstore products');
  }

  // Seed a default bank account if none exists
  const existingBanks = await sql`SELECT COUNT(*) as cnt FROM bank_accounts`;
  if (existingBanks[0]?.cnt === 0) {
    await sql`
      INSERT INTO bank_accounts (bank_name, account_name, account_number, currency) VALUES
      ('GTBank', 'HEC Bookstore', '0123456789', 'NGN')
    `;
    console.log('Seeded default bank account');
  }

  console.log('Migrations complete');
}

module.exports = { runMigrations };
