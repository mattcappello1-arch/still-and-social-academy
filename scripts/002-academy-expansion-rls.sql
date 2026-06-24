-- Academy Expansion: Enable RLS and create policies
-- Run order: 2
-- Pattern: staff_id references academy_staff.id, and academy_staff.id = auth.uid()
-- Uses academy_is_admin() helper function for admin checks

-- Enable RLS on all tables
ALTER TABLE academy_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_growth_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_skill_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_wellbeing_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_recognition ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_shift_readiness ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_handbook_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_talent_tracking ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- CERTIFICATIONS
-- ============================================================
CREATE POLICY "Staff can view own certifications"
  ON academy_certifications FOR SELECT
  USING (staff_id = auth.uid());

CREATE POLICY "Admins can manage all certifications"
  ON academy_certifications FOR ALL
  USING (academy_is_admin());

-- ============================================================
-- PERFORMANCE REVIEWS
-- ============================================================
CREATE POLICY "Staff can view own reviews"
  ON academy_performance_reviews FOR SELECT
  USING (staff_id = auth.uid());

CREATE POLICY "Admins can manage all reviews"
  ON academy_performance_reviews FOR ALL
  USING (academy_is_admin());

-- ============================================================
-- GROWTH GOALS
-- ============================================================
CREATE POLICY "Staff can view own goals"
  ON academy_growth_goals FOR SELECT
  USING (staff_id = auth.uid());

CREATE POLICY "Staff can insert own goals"
  ON academy_growth_goals FOR INSERT
  WITH CHECK (staff_id = auth.uid());

CREATE POLICY "Staff can update own goals"
  ON academy_growth_goals FOR UPDATE
  USING (staff_id = auth.uid());

CREATE POLICY "Admins can manage all goals"
  ON academy_growth_goals FOR ALL
  USING (academy_is_admin());

-- ============================================================
-- SKILL LEVELS
-- ============================================================
CREATE POLICY "Staff can view own skills"
  ON academy_skill_levels FOR SELECT
  USING (staff_id = auth.uid());

CREATE POLICY "Admins can manage all skills"
  ON academy_skill_levels FOR ALL
  USING (academy_is_admin());

-- ============================================================
-- WELLBEING CHECK-INS
-- ============================================================
CREATE POLICY "Staff can view own checkins"
  ON academy_wellbeing_checkins FOR SELECT
  USING (staff_id = auth.uid());

CREATE POLICY "Staff can insert own checkins"
  ON academy_wellbeing_checkins FOR INSERT
  WITH CHECK (staff_id = auth.uid());

CREATE POLICY "Admins can manage all checkins"
  ON academy_wellbeing_checkins FOR ALL
  USING (academy_is_admin());

-- ============================================================
-- RECOGNITION
-- ============================================================
CREATE POLICY "Staff can view own recognition"
  ON academy_recognition FOR SELECT
  USING (staff_id = auth.uid());

CREATE POLICY "Admins can manage all recognition"
  ON academy_recognition FOR ALL
  USING (academy_is_admin());

-- ============================================================
-- ACHIEVEMENTS
-- ============================================================
CREATE POLICY "Staff can view own achievements"
  ON academy_achievements FOR SELECT
  USING (staff_id = auth.uid());

CREATE POLICY "Admins can manage all achievements"
  ON academy_achievements FOR ALL
  USING (academy_is_admin());

-- ============================================================
-- RESOURCES (all authenticated can read non-management resources)
-- ============================================================
CREATE POLICY "Authenticated users can view resources"
  ON academy_resources FOR SELECT
  USING (auth.uid() IS NOT NULL AND (
    is_management_only = false
    OR academy_is_admin()
  ));

CREATE POLICY "Admins can manage resources"
  ON academy_resources FOR ALL
  USING (academy_is_admin());

-- ============================================================
-- SHIFT READINESS
-- ============================================================
CREATE POLICY "Staff can view own shift readiness"
  ON academy_shift_readiness FOR SELECT
  USING (staff_id = auth.uid());

CREATE POLICY "Admins can manage all shift readiness"
  ON academy_shift_readiness FOR ALL
  USING (academy_is_admin());

-- ============================================================
-- HANDBOOK SECTIONS (all authenticated can read active sections)
-- ============================================================
CREATE POLICY "Authenticated users can view handbook"
  ON academy_handbook_sections FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "Admins can manage handbook"
  ON academy_handbook_sections FOR ALL
  USING (academy_is_admin());

-- ============================================================
-- TALENT TRACKING (admin/manager only)
-- ============================================================
CREATE POLICY "Admins can manage talent tracking"
  ON academy_talent_tracking FOR ALL
  USING (academy_is_admin());
