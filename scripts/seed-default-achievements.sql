-- Award initial achievements to existing staff based on their status
-- First Week and First Month for active staff who have been around

INSERT INTO academy_achievements (staff_id, badge_slug, title, description)
SELECT s.id, 'first_week', 'First Week Completed', 'Successfully completed your first week at Still and Social.'
FROM academy_staff s
WHERE s.status = 'active' AND s.start_date IS NOT NULL AND s.start_date <= CURRENT_DATE - INTERVAL '7 days'
ON CONFLICT (staff_id, badge_slug) DO NOTHING;

INSERT INTO academy_achievements (staff_id, badge_slug, title, description)
SELECT s.id, 'first_month', 'First Month Completed', 'One month at Still and Social. Thank you for being part of the team.'
FROM academy_staff s
WHERE s.status = 'active' AND s.start_date IS NOT NULL AND s.start_date <= CURRENT_DATE - INTERVAL '30 days'
ON CONFLICT (staff_id, badge_slug) DO NOTHING;

INSERT INTO academy_achievements (staff_id, badge_slug, title, description)
SELECT s.id, '1_year', '1 Year Service', 'One year of dedication to Still and Social. A milestone worth celebrating.'
FROM academy_staff s
WHERE s.status = 'active' AND s.start_date IS NOT NULL AND s.start_date <= CURRENT_DATE - INTERVAL '1 year'
ON CONFLICT (staff_id, badge_slug) DO NOTHING;
