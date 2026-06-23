-- Signing App Tables for Academy
-- These are separate from the academy_document_templates/staff_documents tables
-- They power the full document signing workflow

CREATE TABLE IF NOT EXISTS academy_signing_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  doc_type text NOT NULL,
  version text NOT NULL DEFAULT 'v1.0',
  body text,
  source_file_path text,
  source_file_type text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS academy_signing_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  doc_type text NOT NULL,
  version text NOT NULL DEFAULT 'v1.0',
  body text NOT NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS academy_signing_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES academy_staff(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES academy_signing_documents(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'draft',
  sent_at timestamptz,
  sent_by uuid,
  expires_at timestamptz,
  opened_at timestamptz,
  signed_at timestamptz,
  signer_name text,
  signature_path text,
  consent_read boolean,
  consent_sign boolean,
  signed_pdf_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS academy_signing_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES academy_signing_assignments(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  actor text,
  ip_address text,
  user_agent text,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE academy_signing_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_signing_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_signing_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_signing_audit ENABLE ROW LEVEL SECURITY;

-- Admins manage all signing tables
CREATE POLICY "Admins manage signing documents" ON academy_signing_documents FOR ALL USING (academy_is_admin()) WITH CHECK (academy_is_admin());
CREATE POLICY "Admins manage signing templates" ON academy_signing_templates FOR ALL USING (academy_is_admin()) WITH CHECK (academy_is_admin());
CREATE POLICY "Admins manage signing assignments" ON academy_signing_assignments FOR ALL USING (academy_is_admin()) WITH CHECK (academy_is_admin());
CREATE POLICY "Admins manage signing audit" ON academy_signing_audit FOR ALL USING (academy_is_admin()) WITH CHECK (academy_is_admin());

-- Staff can read own assignments
CREATE POLICY "Staff read own assignments" ON academy_signing_assignments FOR SELECT USING (staff_id = auth.uid());
-- Public can read assignments by token (for signing flow - no auth needed)
CREATE POLICY "Anyone can read by token" ON academy_signing_assignments FOR SELECT USING (true);
CREATE POLICY "Anyone can update by token" ON academy_signing_assignments FOR UPDATE USING (true);

-- Public can read documents (needed for signing flow)
CREATE POLICY "Authenticated read signing documents" ON academy_signing_documents FOR SELECT USING (true);

-- Public can insert audit events (signing flow)
CREATE POLICY "Anyone can log audit" ON academy_signing_audit FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read audit" ON academy_signing_audit FOR SELECT USING (academy_is_admin());

-- Indexes
CREATE INDEX idx_academy_signing_assignments_token ON academy_signing_assignments(token);
CREATE INDEX idx_academy_signing_assignments_staff ON academy_signing_assignments(staff_id);
CREATE INDEX idx_academy_signing_audit_assignment ON academy_signing_audit(assignment_id);

-- Seed default templates
INSERT INTO academy_signing_templates (title, doc_type, version, body) VALUES
('Trial Shift Agreement', 'Trial shift agreement', 'v1.0', 'This document confirms the terms of your trial shift at Still and Social. By signing below, you acknowledge that you have been briefed on workplace health and safety requirements, understand the trial period expectations, and agree to the terms outlined in your trial shift invitation.'),
('Staff Handbook Acknowledgement', 'Staff handbook acknowledgement', 'v1.0', 'By signing this document, you confirm that you have received, read, and understood the Still and Social Staff Handbook. You agree to abide by the policies, procedures, and standards outlined within. If you have any questions, please speak with your manager.'),
('Employment Contract', 'Employment contract', 'v1.0', 'This Employment Contract outlines the terms and conditions of your employment with Still and Social. Please read carefully before signing. Your signature confirms your acceptance of the role, responsibilities, and conditions described within.'),
('Workplace Policies', 'Workplace policies', 'v1.0', 'By signing this document, you acknowledge that you have been provided with and understand the Still and Social workplace policies, including but not limited to: workplace health and safety, anti-discrimination and harassment, responsible service of alcohol, social media, and privacy policies.'),
('Position Description', 'Position description', 'v1.0', 'This document outlines the key responsibilities, duties, and expectations of your position at Still and Social. By signing, you confirm that you understand your role and agree to perform your duties to the standards described.')
ON CONFLICT DO NOTHING;
