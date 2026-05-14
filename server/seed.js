require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sql } = require('./db');

async function seed() {
  console.log('🌱 Seeding HEC ERP database...');

  // Clear existing data
  await sql`DELETE FROM sms_log`;
  await sql`DELETE FROM email_log`;
  await sql`DELETE FROM cell_group_members`;
  await sql`DELETE FROM cell_groups`;
  await sql`DELETE FROM order_items`;
  await sql`DELETE FROM bookstore_orders`;
  await sql`DELETE FROM bookstore_products`;
  await sql`DELETE FROM first_timer_followups`;
  await sql`DELETE FROM service_counts`;
  await sql`DELETE FROM member_enrollments`;
  await sql`DELETE FROM course_modules`;
  await sql`DELETE FROM courses`;
  await sql`DELETE FROM remittances`;
  await sql`DELETE FROM expenses`;
  await sql`DELETE FROM giving_records`;
  await sql`DELETE FROM testimonies`;
  await sql`DELETE FROM prayer_requests`;
  await sql`DELETE FROM event_registrations`;
  await sql`DELETE FROM events`;
  await sql`DELETE FROM family_relationships`;
  await sql`DELETE FROM members`;
  await sql`DELETE FROM users`;
  await sql`DELETE FROM branches`;

  // Branches
  const branches = await sql`
    INSERT INTO branches (name, code, location, city, country, pastor_name, email, phone, established_date) VALUES
    ('Lagos Headquarters', 'LAG-HQ', '14 Holiness Way, Ikeja', 'Lagos', 'Nigeria', 'Apostle Joshua O. Adekunle', 'lagos@holinessec.org', '+2348030000001', '1986-03-15'),
    ('Abuja Central', 'ABJ-CEN', 'Plot 7, Faith Avenue, Wuse 2', 'Abuja', 'Nigeria', 'Pst. Emmanuel Okafor', 'abuja@holinessec.org', '+2348030000002', '1995-07-22'),
    ('Nairobi East', 'NBO-EAST', '45 Deliverance Road, Eastlands', 'Nairobi', 'Kenya', 'Pst. John Otieno', 'nairobi@holinessec.org', '+254700000001', '2002-11-10'),
    ('London UK', 'LON-UK', '12 Holiness Lane, Southwark', 'London', 'United Kingdom', 'Pst. Mary Adekunle', 'london@holinessec.org', '+447000000001', '2005-04-18'),
    ('Houston TX', 'HOU-TX', '8900 Sanctuary Blvd, Suite 200', 'Houston', 'USA', 'Pst. Daniel Walker', 'houston@holinessec.org', '+17130000001', '2010-09-03'),
    ('Accra Ghana', 'ACC-GH', '28 Grace Avenue, Osu', 'Accra', 'Ghana', 'Pst. Samuel Asante', 'accra@holinessec.org', '+233500000001', '2012-06-14')
  RETURNING *`;
  console.log(`  ✓ ${branches.length} branches`);

  // Users (password: "password123" for all demo accounts)
  const hash = await bcrypt.hash('password123', 10);
  const users = await sql`
    INSERT INTO users (email, password_hash, full_name, phone, role, branch_id) VALUES
    ('hq@holinessec.org', ${hash}, 'Apostle Joshua O. Adekunle', '+2348030000100', 'hq_admin', ${branches[0].id}),
    ('pastor.lagos@holinessec.org', ${hash}, 'Pst. Esther Adekunle', '+2348030000101', 'pastor', ${branches[0].id}),
    ('treasurer.lagos@holinessec.org', ${hash}, 'Dn. Michael Ojo', '+2348030000102', 'treasurer', ${branches[0].id}),
    ('ushers.lagos@holinessec.org', ${hash}, 'Sis. Ruth Bello', '+2348030000103', 'ushers', ${branches[0].id}),
    ('pastor.nairobi@holinessec.org', ${hash}, 'Pst. John Otieno', '+254700000100', 'pastor', ${branches[2].id}),
    ('pastor.london@holinessec.org', ${hash}, 'Pst. Mary Adekunle', '+447000000100', 'pastor', ${branches[3].id}),
    ('treasurer.nairobi@holinessec.org', ${hash}, 'Bro. James Kamau', '+254700000101', 'treasurer', ${branches[2].id})
  RETURNING *`;
  console.log(`  ✓ ${users.length} users`);

  // Members (sample)
  const members = await sql`
    INSERT INTO members (first_name, last_name, email, phone, gender, date_of_birth, marital_status, occupation, city, country, branch_id, spiritual_gifts, departments, membership_date) VALUES
    ('Grace', 'Oluwaseun', 'grace.o@email.com', '+2348030000201', 'female', '1990-05-12', 'married', 'Accountant', 'Lagos', 'Nigeria', ${branches[0].id}, ARRAY['Teaching', 'Giving'], ARRAY['Choir', 'Treasury'], '2020-01-15'),
    ('Daniel', 'Chukwudi', 'daniel.c@email.com', '+2348030000202', 'male', '1985-11-03', 'married', 'Engineer', 'Lagos', 'Nigeria', ${branches[0].id}, ARRAY['Leadership', 'Prayer'], ARRAY['Ushering', 'Men Ministry'], '2019-06-22'),
    ('Esther', 'Bello', 'esther.b@email.com', '+2348030000203', 'female', '2000-08-21', 'single', 'Student', 'Lagos', 'Nigeria', ${branches[0].id}, ARRAY['Worship', 'Youth'], ARRAY['Choir', 'Youth Ministry'], '2022-03-10'),
    ('Samuel', 'Okonkwo', 'samuel.o@email.com', '+2348030000204', 'male', '1978-02-14', 'married', 'Doctor', 'Abuja', 'Nigeria', ${branches[1].id}, ARRAY['Healing', 'Teaching'], ARRAY['Medical Outreach', 'Men Ministry'], '2015-08-30'),
    ('Faith', 'Ngozi', 'faith.n@email.com', '+2348030000205', 'female', '1995-12-25', 'single', 'Lawyer', 'Abuja', 'Nigeria', ${branches[1].id}, ARRAY['Prayer', 'Mercy'], ARRAY['Prayer Team', 'Women Ministry'], '2021-11-14'),
    ('John', 'Mwangi', 'john.m@email.com', '+254700000201', 'male', '1988-07-19', 'married', 'Teacher', 'Nairobi', 'Kenya', ${branches[2].id}, ARRAY['Teaching', 'Youth'], ARRAY['Sunday School', 'Youth Ministry'], '2018-04-07'),
    ('Mary', 'Wanjiku', 'mary.w@email.com', '+254700000202', 'female', '1992-04-30', 'married', 'Nurse', 'Nairobi', 'Kenya', ${branches[2].id}, ARRAY['Mercy', 'Prayer'], ARRAY['Medical Team', 'Women Ministry'], '2020-09-12'),
    ('Peter', 'Smith', 'peter.s@email.com', '+447000000201', 'male', '1983-09-08', 'single', 'Banker', 'London', 'UK', ${branches[3].id}, ARRAY['Leadership', 'Giving'], ARRAY['Finance', 'Men Ministry'], '2017-02-18'),
    ('Sarah', 'Williams', 'sarah.w@email.com', '+17130000001', 'female', '1991-06-15', 'married', 'Consultant', 'Houston', 'USA', ${branches[4].id}, ARRAY['Worship', 'Teaching'], ARRAY['Choir', 'Children Ministry'], '2019-10-25'),
    ('Emmanuel', 'Asante', 'emmanuel.a@email.com', '+233500000201', 'male', '1986-03-22', 'married', 'Businessman', 'Accra', 'Ghana', ${branches[5].id}, ARRAY['Leadership', 'Evangelism'], ARRAY['Outreach', 'Men Ministry'], '2016-07-04')
  RETURNING *`;
  console.log(`  ✓ ${members.length} members`);

  // Events
  const events = await sql`
    INSERT INTO events (title, description, event_type, start_date, end_date, location, branch_id, created_by, status, registration_required) VALUES
    ('Annual Holy Convocation 2026', 'Five days of divine encounter, power, and prophetic release. Theme: "The Year of the Open Door."', 'convocation', '2026-12-18 08:00:00+00', '2026-12-22 20:00:00+00', 'HEC Lagos HQ, 14 Holiness Way, Ikeja', ${branches[0].id}, ${users[0].id}, 'upcoming', true),
    ('Global Fast & Prayer', 'Start the month with 3 days of prayer and fasting across all branches worldwide.', 'fasting', '2026-06-01 06:00:00+00', '2026-06-03 18:00:00+00', 'All HEC Branches', ${branches[0].id}, ${users[0].id}, 'upcoming', false),
    ('Marriage Seminar — "Building Altars Together"', 'A practical seminar for married couples and those preparing for marriage.', 'seminar', '2026-07-15 10:00:00+00', '2026-07-15 16:00:00+00', 'HEC Abuja Central', ${branches[1].id}, ${users[4].id}, 'upcoming', true),
    ('Youth Explosion 2026', 'Annual youth gathering with worship, word, and ministry. For ages 18-35.', 'youth', '2026-08-10 09:00:00+00', '2026-08-12 18:00:00+00', 'HEC Nairobi East', ${branches[2].id}, ${users[4].id}, 'upcoming', true),
    ('Medical Outreach — Ajegunle Community', 'Free medical check-ups, eye glasses, and health education for the community.', 'outreach', '2026-05-30 08:00:00+00', '2026-05-30 17:00:00+00', 'Ajegunle Community Center, Lagos', ${branches[0].id}, ${users[0].id}, 'upcoming', false)
  RETURNING *`;
  console.log(`  ✓ ${events.length} events`);

  // Prayer requests
  await sql`
    INSERT INTO prayer_requests (full_name, prayer_text, category, is_anonymous, status) VALUES
    ('Sis. Adaeze', 'Lord, heal my mother. She goes for surgery on Friday. I pray for the hand of the surgeon.', 'healing', false, 'pending'),
    ('Bro. Kwame', 'I need a new job opportunity in Toronto. Open doors that no man can shut.', 'career', false, 'pending'),
    ('Anonymous', 'Lord, restore my marriage. Bring my husband back home.', 'marriage', true, 'pending'),
    ('Sis. Bola', 'Visa appeal for my brother. Let the Lord grant him favor.', 'travel', false, 'pending'),
    ('Bro. Emmanuel', 'Financial breakthrough for my business. I owe debts that seem impossible.', 'finance', false, 'pending')
  `;
  console.log(`  ✓ 5 prayer requests`);

  // Testimonies
  await sql`
    INSERT INTO testimonies (full_name, title, body, likes, status, branch_id) VALUES
    ('Sis. Faith O.', 'Healed of stage 2 cancer after the August fast', 'Doctors confirmed the tumor is gone. I came to HEC in March barely walking — today I lead the choir again. Glory!', 1284, 'approved', ${branches[0].id}),
    ('Bro. Samuel K.', 'Promoted after 9 years of stagnation', 'Pastor''s word in July prophetic service: Your delay ends this month. Three weeks later, the appointment letter came.', 902, 'approved', ${branches[2].id}),
    ('Sis. Hannah P.', 'Pregnant after 7 years', 'We held the prayer cloth from the convocation. By Christmas, the test was positive. Baby Joshua is now 4 months!', 2104, 'approved', ${branches[3].id})
  `;
  console.log(`  ✓ 3 testimonies`);

  // Courses
  const courses = await sql`
    INSERT INTO courses (title, code, instructor, description, duration_weeks, total_lessons, color, badge, is_locked, ordering) VALUES
    ('New Convert Foundation', 'NC-101', 'Pst. E. Adekunle', 'Foundational teachings for every new believer. Covers salvation, Holy Spirit, water baptism, prayer, tithing, and holiness.', 4, 12, '#800000', 'MANDATORY', false, 1),
    ('Holiness as a Lifestyle', 'HL-201', 'Apostle J. Adekunle', 'Deep dive into the doctrine of holiness and practical daily living set apart for God.', 6, 18, '#a32020', NULL, false, 2),
    ('Worker''s Discipleship Track', 'WD-301', 'Dn. M. Ojo', 'Advanced training for church workers and ministry leaders.', 8, 24, '#006400', NULL, true, 3),
    ('Marriage by Fire', 'MF-310', 'Pst. & Mrs. Adekunle', 'Biblical foundations for a fireproof marriage. For engaged and married couples.', 5, 10, '#d4af37', NULL, false, 4),
    ('Evangelism & Soul Winning', 'ES-220', 'Evang. R. Daniels', 'Practical training on personal evangelism, street ministry, and follow-up.', 5, 14, '#9a7d22', NULL, false, 5),
    ('Leadership in the Spirit', 'LS-401', 'Pst. M. Williams', 'Spiritual leadership principles for pastors, deacons, and ministry heads.', 10, 20, '#4a0000', NULL, true, 6)
  RETURNING *`;
  console.log(`  ✓ ${courses.length} courses`);

  // Course modules for NC-101
  await sql`
    INSERT INTO course_modules (course_id, name, ordering) VALUES
    (${courses[0].id}, 'Welcome & Salvation', 1),
    (${courses[0].id}, 'The Holy Spirit Baptism', 2),
    (${courses[0].id}, 'Water Baptism Explained', 3),
    (${courses[0].id}, 'Prayer & Fasting', 4),
    (${courses[0].id}, 'Tithing & Stewardship', 5),
    (${courses[0].id}, 'Holiness as Lifestyle', 6)
  `;
  console.log(`  ✓ Course modules`);

  // Giving records
  await sql`
    INSERT INTO giving_records (member_id, full_name, branch_id, amount, currency, purpose, status) VALUES
    (${members[0].id}, 'Grace Oluwaseun', ${branches[0].id}, 250000, 'NGN', 'tithe', 'verified'),
    (${members[1].id}, 'Daniel Chukwudi', ${branches[0].id}, 180000, 'NGN', 'tithe', 'verified'),
    (${members[7].id}, 'Peter Smith', ${branches[3].id}, 500, 'GBP', 'missions', 'verified'),
    (${members[8].id}, 'Sarah Williams', ${branches[4].id}, 750, 'USD', 'building', 'pending'),
    (${members[5].id}, 'John Mwangi', ${branches[2].id}, 15000, 'KES', 'offering', 'verified')
  `;
  console.log(`  ✓ Giving records`);

  // Bookstore products
  await sql`
    INSERT INTO bookstore_products (title, author, price, color1, color2, rating, reviews, status) VALUES
    ('The Beauty of Holiness', 'Apostle J. Adekunle', 12.99, '#800000', '#4a0000', 4.9, 1284, 'live'),
    ('Prayer that Moves Mountains', 'Pst. E. Adekunle', 9.99, '#006400', '#003600', 4.8, 902, 'live'),
    ('Marriage by Fire', 'Pst. & Mrs. Adekunle', 14.99, '#d4af37', '#9a7d22', 5.0, 488, 'live'),
    ('The New Convert''s Companion', 'HEC Discipleship', 6.99, '#a32020', '#800000', 4.7, 2104, 'live'),
    ('Walking in Dominion', 'Apostle J. Adekunle', 11.99, '#2a8c2a', '#006400', 4.9, 712, 'live'),
    ('Daily Manna · Vol. III', 'HEC Devotional Press', 8.99, '#9a7d22', '#4a0000', 4.8, 1670, 'live')
  `;
  console.log(`  ✓ Bookstore products`);

  console.log('\n✅ Seed complete!');
  console.log('\nDemo Accounts:');
  console.log('  HQ Admin:   hq@holinessec.org / password123');
  console.log('  Pastor:     pastor.lagos@holinessec.org / password123');
  console.log('  Treasurer:  treasurer.lagos@holinessec.org / password123');
  console.log('  Ushers:     ushers.lagos@holinessec.org / password123');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
