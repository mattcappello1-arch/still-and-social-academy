-- Academy Expansion: Create all new tables
-- Run order: 1

-- 1. Certifications
CREATE TABLE IF NOT EXISTS academy_certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES academy_staff(id) ON DELETE CASCADE,
  cert_type text NOT NULL, -- 'rsa', 'food_safety', 'first_aid', 'drivers_licence', 'other'
  title text NOT NULL,
  issuing_body text,
  cert_number text,
  issue_date date,
  expiry_date date,
  file_url text,
  status text NOT NULL DEFAULT 'active', -- 'active', 'expired', 'pending'
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Performance Reviews
CREATE TABLE IF NOT EXISTS academy_performance_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES academy_staff(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES academy_staff(id),
  review_type text NOT NULL DEFAULT 'performance', -- 'performance', 'probation_30', 'probation_60', 'probation_90'
  status text NOT NULL DEFAULT 'draft', -- 'draft', 'employee_pending', 'manager_pending', 'completed'
  proud_of text,
  learned_recently text,
  improve text,
  support_needed text,
  strengths text,
  development_areas text,
  training_recommendations text,
  future_opportunities text,
  manager_notes text,
  probation_outcome text, -- 'pass', 'extend', 'development_plan'
  review_period_start date,
  review_period_end date,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Growth Goals
CREATE TABLE IF NOT EXISTS academy_growth_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES academy_staff(id) ON DELETE CASCADE,
  category text NOT NULL, -- 'personal', 'career', 'still_and_social'
  title text NOT NULL,
  description text,
  target_date date,
  status text NOT NULL DEFAULT 'active', -- 'active', 'completed', 'paused'
  progress_notes text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Skill Levels
CREATE TABLE IF NOT EXISTS academy_skill_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES academy_staff(id) ON DELETE CASCADE,
  skill_name text NOT NULL,
  level integer NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 4),
  assessed_by uuid REFERENCES academy_staff(id),
  assessed_at timestamptz DEFAULT now(),
  notes text,
  UNIQUE(staff_id, skill_name)
);

-- 5. Wellbeing Check-ins
CREATE TABLE IF NOT EXISTS academy_wellbeing_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES academy_staff(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comments text,
  flagged boolean NOT NULL DEFAULT false,
  follow_up_notes text,
  follow_up_by uuid REFERENCES academy_staff(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. Recognition
CREATE TABLE IF NOT EXISTS academy_recognition (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES academy_staff(id) ON DELETE CASCADE,
  awarded_by uuid NOT NULL REFERENCES academy_staff(id),
  badge_type text NOT NULL, -- 'guest_experience', 'team_player', 'leadership_potential', 'growth_mindset', 'hospitality_excellence', 'above_beyond'
  title text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 7. Achievements
CREATE TABLE IF NOT EXISTS academy_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES academy_staff(id) ON DELETE CASCADE,
  badge_slug text NOT NULL, -- 'first_week', 'first_month', 'foh_certified', etc.
  title text NOT NULL,
  description text,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  awarded_by uuid REFERENCES academy_staff(id),
  UNIQUE(staff_id, badge_slug)
);

-- 8. Resources
CREATE TABLE IF NOT EXISTS academy_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL, -- 'hospitality', 'leadership', 'wellness', 'communication', 'food_beverage', 'brand', 'management'
  resource_type text NOT NULL, -- 'pdf', 'video', 'document', 'link', 'template'
  file_url text,
  external_url text,
  is_management_only boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 9. Shift Readiness
CREATE TABLE IF NOT EXISTS academy_shift_readiness (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES academy_staff(id) ON DELETE CASCADE,
  role text NOT NULL,
  checklist_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  manager_signoff_by uuid REFERENCES academy_staff(id),
  manager_signoff_at timestamptz,
  is_shift_ready boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(staff_id, role)
);

-- 10. Handbook Sections
CREATE TABLE IF NOT EXISTS academy_handbook_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content jsonb,
  category text NOT NULL DEFAULT 'general', -- 'policies', 'procedures', 'uniform', 'leave', 'emergency', 'rostering', 'expectations'
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 11. Talent Tracking
CREATE TABLE IF NOT EXISTS academy_talent_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES academy_staff(id) ON DELETE CASCADE,
  talent_category text NOT NULL, -- 'emerging', 'future_supervisor', 'future_leader', 'leadership_pathway'
  notes text,
  tracked_by uuid REFERENCES academy_staff(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(staff_id)
);
