-- HEC ERP Schema Additions v2
-- Run this after the base schema

-- 1. Add tithing_code to members
ALTER TABLE members ADD COLUMN IF NOT EXISTS tithing_code VARCHAR(20) UNIQUE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS baptism_date DATE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS zone VARCHAR(100);

-- 2. ATTENDANCE RECORDS (member check-in per service)
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id),
  service_date DATE DEFAULT CURRENT_DATE,
  service_type VARCHAR(50) DEFAULT 'Sunday',
  checked_in_by UUID REFERENCES users(id),
  check_in_time TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, service_date, service_type)
);

-- 3. COUNSELLING / VISITATION LOGS
CREATE TABLE IF NOT EXISTS counselling_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  counsellor_id UUID REFERENCES users(id),
  branch_id UUID REFERENCES branches(id),
  visit_date DATE DEFAULT CURRENT_DATE,
  visit_type VARCHAR(50), -- counselling, visitation, follow_up, hospital, home
  notes TEXT,
  follow_up_date DATE,
  status VARCHAR(20) DEFAULT 'open', -- open, closed, follow_up_scheduled
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SOUL WINNING TRACKER
CREATE TABLE IF NOT EXISTS soul_winning (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id),
  soul_name VARCHAR(255) NOT NULL,
  soul_phone VARCHAR(50),
  soul_address TEXT,
  date_won DATE DEFAULT CURRENT_DATE,
  service_attended DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MONTHLY TARGETS (per branch or per member)
CREATE TABLE IF NOT EXISTS soul_winning_targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id),
  member_id UUID REFERENCES members(id),
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  target INTEGER NOT NULL DEFAULT 5,
  UNIQUE(member_id, month, year)
);

-- 6. PRAYER CHAIN / ASSIGNMENTS
CREATE TABLE IF NOT EXISTS intercessors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id),
  categories TEXT[], -- healing, finance, family, etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id)
);

CREATE TABLE IF NOT EXISTS prayer_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prayer_id UUID REFERENCES prayer_requests(id) ON DELETE CASCADE,
  intercessor_id UUID REFERENCES intercessors(id),
  assigned_by UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'assigned', -- assigned, prayed, acknowledged
  prayed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. AUDIT LOG
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  user_name VARCHAR(255),
  user_role VARCHAR(20),
  action VARCHAR(20) NOT NULL, -- CREATE, UPDATE, DELETE
  entity_type VARCHAR(50) NOT NULL, -- member, event, course, etc.
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. MEMBER ANNIVERSARY LOG (to track sent notifications)
CREATE TABLE IF NOT EXISTS anniversary_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id),
  anniversary_type VARCHAR(50), -- membership, baptism
  year INTEGER,
  notified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, anniversary_type, year)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_attendance_member ON attendance_records(member_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(service_date);
CREATE INDEX IF NOT EXISTS idx_counselling_member ON counselling_logs(member_id);
CREATE INDEX IF NOT EXISTS idx_counselling_date ON counselling_logs(visit_date);
CREATE INDEX IF NOT EXISTS idx_soul_winning_member ON soul_winning(member_id);
CREATE INDEX IF NOT EXISTS idx_soul_winning_date ON soul_winning(date_won);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_prayer_assignments_prayer ON prayer_assignments(prayer_id);
