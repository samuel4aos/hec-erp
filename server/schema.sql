-- HEC ERP Database Schema for Neon Postgres
-- Run this once to initialize the database

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. BRANCHES
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(10) UNIQUE NOT NULL,
  location VARCHAR(255),
  city VARCHAR(100),
  country VARCHAR(100),
  pastor_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  established_date DATE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USERS (staff/volunteer accounts)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(20) NOT NULL CHECK (role IN ('hq_admin', 'pastor', 'treasurer', 'ushers', 'admin_staff')),
  branch_id UUID REFERENCES branches(id),
  avatar_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MEMBERS
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  gender VARCHAR(10),
  date_of_birth DATE,
  marital_status VARCHAR(20),
  occupation VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state_province VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Nigeria',
  branch_id UUID REFERENCES branches(id),
  membership_date DATE DEFAULT CURRENT_DATE,
  membership_status VARCHAR(20) DEFAULT 'active',
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(50),
  spiritual_gifts TEXT[],
  departments TEXT[],
  photo_url VARCHAR(500),
  notes TEXT,
  first_timer_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FAMILY RELATIONSHIPS
CREATE TABLE family_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  related_member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  relationship_type VARCHAR(50) NOT NULL, -- spouse, parent, child, sibling
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EVENTS
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(50), -- service, convocation, fasting, outreach, wedding, etc.
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location VARCHAR(255),
  branch_id UUID REFERENCES branches(id),
  flyer_url VARCHAR(500),
  registration_required BOOLEAN DEFAULT false,
  max_attendees INTEGER,
  created_by UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'upcoming',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. EVENT REGISTRATIONS
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id),
  full_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  checked_in BOOLEAN DEFAULT false,
  registered_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PRAYER REQUESTS
CREATE TABLE prayer_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id),
  full_name VARCHAR(255),
  branch_id UUID REFERENCES branches(id),
  prayer_text TEXT NOT NULL,
  category VARCHAR(50), -- healing, finance, family, career, spiritual, salvation, deliverance, marriage, travel, other
  is_anonymous BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'pending', -- pending, prayed_for, answered
  ai_categorized BOOLEAN DEFAULT false,
  assigned_to UUID REFERENCES users(id), -- intercessor
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TESTIMONIES
CREATE TABLE testimonies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id),
  full_name VARCHAR(255) NOT NULL,
  branch_id UUID REFERENCES branches(id),
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  has_video BOOLEAN DEFAULT false,
  video_url VARCHAR(500),
  likes INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. GIVING / TITHES
CREATE TABLE giving_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id),
  full_name VARCHAR(255),
  branch_id UUID REFERENCES branches(id),
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'NGN',
  purpose VARCHAR(50), -- tithe, offering, missions, building, welfare, seed
  payment_proof_url VARCHAR(500),
  status VARCHAR(20) DEFAULT 'pending', -- pending, verified, reconciled
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  receipt_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. EXPENSES (Treasurer module)
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id),
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'NGN',
  category VARCHAR(50),
  receipt_url VARCHAR(500),
  entered_by UUID REFERENCES users(id),
  expense_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. REMITTANCES (Branch to HQ)
CREATE TABLE remittances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id),
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'NGN',
  teller_url VARCHAR(500),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, reconciled
  reconciled_by UUID REFERENCES users(id),
  reconciled_at TIMESTAMPTZ,
  period VARCHAR(20), -- e.g. '2026-05'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. COURSES (Academy LMS)
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  instructor VARCHAR(255),
  description TEXT,
  duration_weeks INTEGER,
  total_lessons INTEGER,
  color VARCHAR(10),
  badge VARCHAR(50),
  is_locked BOOLEAN DEFAULT false,
  ordering INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. COURSE MODULES
CREATE TABLE course_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  content TEXT,
  ordering INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. MEMBER ENROLLMENTS (Academy)
CREATE TABLE member_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id),
  course_id UUID REFERENCES courses(id),
  current_module INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  certificate_issued BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, course_id)
);

-- 15. SERVICE END-COUNTS (Ushers module)
CREATE TABLE service_counts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id),
  service_date DATE DEFAULT CURRENT_DATE,
  service_type VARCHAR(50) DEFAULT 'Sunday',
  men INTEGER DEFAULT 0,
  women INTEGER DEFAULT 0,
  children INTEGER DEFAULT 0,
  first_timers INTEGER DEFAULT 0,
  total_generated INTEGER GENERATED ALWAYS AS (men + women + children + first_timers) STORED,
  entered_by UUID REFERENCES users(id),
  submitted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. FIRST-TIMER FOLLOW-UPS
CREATE TABLE first_timer_followups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id),
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  invited_by VARCHAR(255),
  service_date DATE DEFAULT CURRENT_DATE,
  welcome_sms_sent BOOLEAN DEFAULT false,
  follow_up_status VARCHAR(20) DEFAULT 'new', -- new, contacted, visited, enrolled
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. BOOKSTORE PRODUCTS
CREATE TABLE bookstore_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255),
  price DECIMAL(10,2) NOT NULL,
  color1 VARCHAR(10),
  color2 VARCHAR(10),
  rating DECIMAL(2,1) DEFAULT 5.0,
  reviews INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft', -- draft, live
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. BOOKSTORE ORDERS
CREATE TABLE bookstore_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id),
  full_name VARCHAR(255),
  email VARCHAR(255),
  total_amount DECIMAL(10,2),
  payment_proof_url VARCHAR(500),
  status VARCHAR(20) DEFAULT 'pending', -- pending, verifying, verified, completed
  verified_by UUID REFERENCES users(id),
  pdf_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. ORDER ITEMS
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES bookstore_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES bookstore_products(id),
  title VARCHAR(255),
  price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. CELL GROUPS
CREATE TABLE cell_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  leader_id UUID REFERENCES members(id),
  branch_id UUID REFERENCES branches(id),
  meeting_day VARCHAR(20),
  meeting_time TIME,
  location VARCHAR(255),
  zone VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. CELL GROUP MEMBERS
CREATE TABLE cell_group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cell_group_id UUID REFERENCES cell_groups(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cell_group_id, member_id)
);

-- 22. SMS LOG
CREATE TABLE sms_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id),
  phone VARCHAR(50),
  message TEXT,
  type VARCHAR(50), -- birthday, prayer_response, event_reminder, welcome, receipt
  status VARCHAR(20), -- sent, failed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. EMAIL LOG
CREATE TABLE email_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id),
  email VARCHAR(255),
  subject VARCHAR(500),
  type VARCHAR(50),
  status VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_members_branch ON members(branch_id);
CREATE INDEX idx_members_phone ON members(phone);
CREATE INDEX idx_members_dob ON members(date_of_birth);
CREATE INDEX idx_prayers_category ON prayer_requests(category);
CREATE INDEX idx_prayers_status ON prayer_requests(status);
CREATE INDEX idx_giving_branch ON giving_records(branch_id);
CREATE INDEX idx_giving_status ON giving_records(status);
CREATE INDEX idx_events_branch ON events(branch_id);
CREATE INDEX idx_events_date ON events(start_date);
CREATE INDEX idx_service_counts_date ON service_counts(service_date);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Enable Row-Level Security (RLS is enforced at the API layer via JWT claims)
-- The branch_id claim in JWT determines data access scope
