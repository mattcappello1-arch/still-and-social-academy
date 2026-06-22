-- Still & Social Academy - Database Schema
-- All tables prefixed with "academy_" for shared Supabase project
-- Run this in the Supabase SQL Editor

-- ============================================================
-- 1. academy_staff - extends auth.users
-- ============================================================
CREATE TABLE IF NOT EXISTS academy_staff (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  role text NOT NULL CHECK (role IN (
    'waiter', 'restaurant_all_rounder', 'bartender',
    'kitchen_hand', 'entree_chef', 'wok_chef', 'curries_chef', 'expo_chef',
    'supervisor', 'manager'
  )),
  department text GENERATED ALWAYS AS (
    CASE
      WHEN role IN ('waiter', 'restaurant_all_rounder', 'bartender') THEN 'foh'
      WHEN role IN ('kitchen_hand', 'entree_chef', 'wok_chef', 'curries_chef', 'expo_chef') THEN 'kitchen'
      ELSE 'leadership'
    END
  ) STORED,
  employment_type text CHECK (employment_type IN ('casual', 'part_time', 'full_time')),
  start_date date,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
  is_admin boolean NOT NULL DEFAULT false,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. academy_staff_personal_details
-- ============================================================
CREATE TABLE IF NOT EXISTS academy_staff_personal_details (
  staff_id uuid PRIMARY KEY REFERENCES academy_staff(id) ON DELETE CASCADE,
  date_of_birth date,
  address_line_1 text,
  address_line_2 text,
  suburb text,
  state text,
  postcode text,
  country text DEFAULT 'Australia',
  tax_file_number text,
  bank_bsb text,
  bank_account_number text,
  bank_account_name text,
  super_fund_name text,
  super_member_number text,
  super_usi text,
  emergency_contact_name text,
  emergency_contact_phone text,
  emergency_contact_relationship text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. academy_training_paths
-- ============================================================
CREATE TABLE IF NOT EXISTS academy_training_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  department text NOT NULL CHECK (department IN ('foh', 'kitchen', 'leadership', 'universal')),
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. academy_training_modules
-- ============================================================
CREATE TABLE IF NOT EXISTS academy_training_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id uuid NOT NULL REFERENCES academy_training_paths(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  description text,
  content_type text NOT NULL CHECK (content_type IN ('text', 'video', 'pdf', 'checklist', 'quiz', 'mixed')),
  content jsonb,
  estimated_minutes integer,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(path_id, slug)
);

-- ============================================================
-- 5. academy_role_training_paths
-- ============================================================
CREATE TABLE IF NOT EXISTS academy_role_training_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL CHECK (role IN (
    'waiter', 'restaurant_all_rounder', 'bartender',
    'kitchen_hand', 'entree_chef', 'wok_chef', 'curries_chef', 'expo_chef',
    'supervisor', 'manager'
  )),
  path_id uuid NOT NULL REFERENCES academy_training_paths(id) ON DELETE CASCADE,
  is_required boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  UNIQUE(role, path_id)
);

-- ============================================================
-- 6. academy_staff_module_progress
-- ============================================================
CREATE TABLE IF NOT EXISTS academy_staff_module_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES academy_staff(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES academy_training_modules(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  quiz_score numeric,
  quiz_attempts integer NOT NULL DEFAULT 0,
  checklist_items jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  UNIQUE(staff_id, module_id)
);

-- ============================================================
-- 7. academy_quizzes
-- ============================================================
CREATE TABLE IF NOT EXISTS academy_quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES academy_training_modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  pass_score numeric NOT NULL DEFAULT 80,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 8. academy_document_templates
-- ============================================================
CREATE TABLE IF NOT EXISTS academy_document_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('personal_info', 'employment', 'policy', 'certification')),
  template_content jsonb,
  file_url text,
  requires_signature boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 9. academy_staff_documents
-- ============================================================
CREATE TABLE IF NOT EXISTS academy_staff_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES academy_staff(id) ON DELETE CASCADE,
  template_id uuid NOT NULL REFERENCES academy_document_templates(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'signed', 'expired')),
  form_data jsonb,
  signature_image_url text,
  signed_at timestamptz,
  signed_ip text,
  signed_user_agent text,
  signed_pdf_url text,
  email_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 10. academy_invitations
-- ============================================================
CREATE TABLE IF NOT EXISTS academy_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  role text NOT NULL CHECK (role IN (
    'waiter', 'restaurant_all_rounder', 'bartender',
    'kitchen_hand', 'entree_chef', 'wok_chef', 'curries_chef', 'expo_chef',
    'supervisor', 'manager'
  )),
  employment_type text CHECK (employment_type IN ('casual', 'part_time', 'full_time')),
  invited_by uuid REFERENCES academy_staff(id) ON DELETE SET NULL,
  accepted_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Updated_at trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION academy_set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER academy_staff_updated_at
  BEFORE UPDATE ON academy_staff
  FOR EACH ROW EXECUTE FUNCTION academy_set_updated_at();

CREATE TRIGGER academy_staff_personal_details_updated_at
  BEFORE UPDATE ON academy_staff_personal_details
  FOR EACH ROW EXECUTE FUNCTION academy_set_updated_at();

-- ============================================================
-- Enable RLS on all tables
-- ============================================================
ALTER TABLE academy_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_staff_personal_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_training_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_role_training_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_staff_module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_staff_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_invitations ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies - Admin helper function
-- ============================================================
CREATE OR REPLACE FUNCTION academy_is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM academy_staff
    WHERE id = auth.uid() AND is_admin = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- RLS Policies: academy_staff
-- ============================================================
CREATE POLICY "Staff can read own profile"
  ON academy_staff FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Admins can read all staff"
  ON academy_staff FOR SELECT
  USING (academy_is_admin());

CREATE POLICY "Admins can insert staff"
  ON academy_staff FOR INSERT
  WITH CHECK (academy_is_admin());

CREATE POLICY "Admins can update all staff"
  ON academy_staff FOR UPDATE
  USING (academy_is_admin());

CREATE POLICY "Staff can update own profile"
  ON academy_staff FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can delete staff"
  ON academy_staff FOR DELETE
  USING (academy_is_admin());

-- ============================================================
-- RLS Policies: academy_staff_personal_details
-- ============================================================
CREATE POLICY "Staff can read own personal details"
  ON academy_staff_personal_details FOR SELECT
  USING (staff_id = auth.uid());

CREATE POLICY "Admins can read all personal details"
  ON academy_staff_personal_details FOR SELECT
  USING (academy_is_admin());

CREATE POLICY "Staff can upsert own personal details"
  ON academy_staff_personal_details FOR INSERT
  WITH CHECK (staff_id = auth.uid() OR academy_is_admin());

CREATE POLICY "Staff can update own personal details"
  ON academy_staff_personal_details FOR UPDATE
  USING (staff_id = auth.uid() OR academy_is_admin());

CREATE POLICY "Admins can delete personal details"
  ON academy_staff_personal_details FOR DELETE
  USING (academy_is_admin());

-- ============================================================
-- RLS Policies: academy_training_paths (read by all authenticated)
-- ============================================================
CREATE POLICY "Authenticated users can read training paths"
  ON academy_training_paths FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage training paths"
  ON academy_training_paths FOR ALL
  USING (academy_is_admin())
  WITH CHECK (academy_is_admin());

-- ============================================================
-- RLS Policies: academy_training_modules (read by all authenticated)
-- ============================================================
CREATE POLICY "Authenticated users can read training modules"
  ON academy_training_modules FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage training modules"
  ON academy_training_modules FOR ALL
  USING (academy_is_admin())
  WITH CHECK (academy_is_admin());

-- ============================================================
-- RLS Policies: academy_role_training_paths (read by all authenticated)
-- ============================================================
CREATE POLICY "Authenticated users can read role training paths"
  ON academy_role_training_paths FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage role training paths"
  ON academy_role_training_paths FOR ALL
  USING (academy_is_admin())
  WITH CHECK (academy_is_admin());

-- ============================================================
-- RLS Policies: academy_staff_module_progress
-- ============================================================
CREATE POLICY "Staff can read own progress"
  ON academy_staff_module_progress FOR SELECT
  USING (staff_id = auth.uid());

CREATE POLICY "Admins can read all progress"
  ON academy_staff_module_progress FOR SELECT
  USING (academy_is_admin());

CREATE POLICY "Staff can upsert own progress"
  ON academy_staff_module_progress FOR INSERT
  WITH CHECK (staff_id = auth.uid());

CREATE POLICY "Staff can update own progress"
  ON academy_staff_module_progress FOR UPDATE
  USING (staff_id = auth.uid());

CREATE POLICY "Admins can manage all progress"
  ON academy_staff_module_progress FOR ALL
  USING (academy_is_admin())
  WITH CHECK (academy_is_admin());

-- ============================================================
-- RLS Policies: academy_quizzes (read by all authenticated)
-- ============================================================
CREATE POLICY "Authenticated users can read quizzes"
  ON academy_quizzes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage quizzes"
  ON academy_quizzes FOR ALL
  USING (academy_is_admin())
  WITH CHECK (academy_is_admin());

-- ============================================================
-- RLS Policies: academy_document_templates (read by all authenticated)
-- ============================================================
CREATE POLICY "Authenticated users can read document templates"
  ON academy_document_templates FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage document templates"
  ON academy_document_templates FOR ALL
  USING (academy_is_admin())
  WITH CHECK (academy_is_admin());

-- ============================================================
-- RLS Policies: academy_staff_documents
-- ============================================================
CREATE POLICY "Staff can read own documents"
  ON academy_staff_documents FOR SELECT
  USING (staff_id = auth.uid());

CREATE POLICY "Staff can update own documents"
  ON academy_staff_documents FOR UPDATE
  USING (staff_id = auth.uid());

CREATE POLICY "Admins can manage all documents"
  ON academy_staff_documents FOR ALL
  USING (academy_is_admin())
  WITH CHECK (academy_is_admin());

-- ============================================================
-- RLS Policies: academy_invitations
-- ============================================================
CREATE POLICY "Admins can manage invitations"
  ON academy_invitations FOR ALL
  USING (academy_is_admin())
  WITH CHECK (academy_is_admin());

-- Allow anonymous read for invitation acceptance (by email match)
CREATE POLICY "Anyone can read own invitation by email"
  ON academy_invitations FOR SELECT
  USING (true);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_academy_staff_email ON academy_staff(email);
CREATE INDEX idx_academy_staff_role ON academy_staff(role);
CREATE INDEX idx_academy_staff_department ON academy_staff(department);
CREATE INDEX idx_academy_staff_status ON academy_staff(status);
CREATE INDEX idx_academy_training_modules_path_id ON academy_training_modules(path_id);
CREATE INDEX idx_academy_staff_module_progress_staff_id ON academy_staff_module_progress(staff_id);
CREATE INDEX idx_academy_staff_module_progress_module_id ON academy_staff_module_progress(module_id);
CREATE INDEX idx_academy_staff_documents_staff_id ON academy_staff_documents(staff_id);
CREATE INDEX idx_academy_staff_documents_template_id ON academy_staff_documents(template_id);
CREATE INDEX idx_academy_invitations_email ON academy_invitations(email);
CREATE INDEX idx_academy_role_training_paths_role ON academy_role_training_paths(role);
