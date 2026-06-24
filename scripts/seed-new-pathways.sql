-- New Training Pathways: Rituals of Hospitality + Event Training + Leadership Academy

-- Rituals of Hospitality (universal, signature series)
INSERT INTO academy_training_paths (slug, title, description, department, sort_order) VALUES
('rituals-of-hospitality', 'Rituals of Hospitality', 'The heart of the Still and Social guest experience. Five rituals that define how we care for every guest.', 'universal', 14)
ON CONFLICT (slug) DO NOTHING;

-- Event Training
INSERT INTO academy_training_paths (slug, title, description, department, sort_order) VALUES
('event-training', 'Event Training', 'Preparing for Wine and Soul nights, private functions, workshops, community events, and brand activations.', 'universal', 15)
ON CONFLICT (slug) DO NOTHING;

-- Leadership Academy
INSERT INTO academy_training_paths (slug, title, description, department, sort_order) VALUES
('leadership-academy', 'Leadership Academy', 'Advanced leadership training for supervisors and managers. Coaching, feedback, team development, and business operations.', 'leadership', 16)
ON CONFLICT (slug) DO NOTHING;

-- The Still & Social Way (mandatory culture module)
INSERT INTO academy_training_paths (slug, title, description, department, sort_order) VALUES
('the-still-and-social-way', 'The Still & Social Way', 'Our story, our values, and what great hospitality looks like. Every team member completes this before role-specific training.', 'universal', 0)
ON CONFLICT (slug) DO NOTHING;
