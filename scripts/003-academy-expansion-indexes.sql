-- Academy Expansion: Create indexes
-- Run order: 3

CREATE INDEX IF NOT EXISTS idx_academy_certifications_staff_id ON academy_certifications(staff_id);
CREATE INDEX IF NOT EXISTS idx_academy_certifications_expiry ON academy_certifications(expiry_date);
CREATE INDEX IF NOT EXISTS idx_academy_certifications_status ON academy_certifications(status);

CREATE INDEX IF NOT EXISTS idx_academy_performance_reviews_staff_id ON academy_performance_reviews(staff_id);
CREATE INDEX IF NOT EXISTS idx_academy_performance_reviews_reviewer_id ON academy_performance_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_academy_performance_reviews_status ON academy_performance_reviews(status);

CREATE INDEX IF NOT EXISTS idx_academy_growth_goals_staff_id ON academy_growth_goals(staff_id);
CREATE INDEX IF NOT EXISTS idx_academy_growth_goals_status ON academy_growth_goals(status);

CREATE INDEX IF NOT EXISTS idx_academy_skill_levels_staff_id ON academy_skill_levels(staff_id);

CREATE INDEX IF NOT EXISTS idx_academy_wellbeing_checkins_staff_id ON academy_wellbeing_checkins(staff_id);
CREATE INDEX IF NOT EXISTS idx_academy_wellbeing_checkins_flagged ON academy_wellbeing_checkins(flagged) WHERE flagged = true;

CREATE INDEX IF NOT EXISTS idx_academy_recognition_staff_id ON academy_recognition(staff_id);
CREATE INDEX IF NOT EXISTS idx_academy_recognition_awarded_by ON academy_recognition(awarded_by);

CREATE INDEX IF NOT EXISTS idx_academy_achievements_staff_id ON academy_achievements(staff_id);

CREATE INDEX IF NOT EXISTS idx_academy_shift_readiness_staff_id ON academy_shift_readiness(staff_id);

CREATE INDEX IF NOT EXISTS idx_academy_handbook_sections_category ON academy_handbook_sections(category);
CREATE INDEX IF NOT EXISTS idx_academy_handbook_sections_slug ON academy_handbook_sections(slug);

CREATE INDEX IF NOT EXISTS idx_academy_talent_tracking_staff_id ON academy_talent_tracking(staff_id);
CREATE INDEX IF NOT EXISTS idx_academy_talent_tracking_category ON academy_talent_tracking(talent_category);
