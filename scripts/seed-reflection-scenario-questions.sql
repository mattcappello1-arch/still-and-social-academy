-- Add reflection question to "Hospitality as Care" quiz
UPDATE academy_quizzes
SET questions = questions || '[{"type":"reflection","question":"Describe what hospitality as care means to you personally, and how you would demonstrate it during a shift.","minLength":50}]'::jsonb
WHERE id IN (
  SELECT q.id FROM academy_quizzes q
  JOIN academy_training_modules m ON q.module_id = m.id
  JOIN academy_training_paths p ON m.path_id = p.id
  WHERE p.slug = 'welcome-to-still-and-social' AND m.slug = 'hospitality-as-care'
);

-- Add scenario question to "Guest Recovery" quiz (supervisor)
UPDATE academy_quizzes
SET questions = questions || '[{"type":"scenario","question":"A guest tells you their main course was cold and they have been waiting 10 minutes for someone to notice. How do you handle this?","context":"The restaurant is busy. The guest is visibly frustrated but not aggressive. Their dining partner looks uncomfortable.","minLength":40}]'::jsonb
WHERE id IN (
  SELECT q.id FROM academy_quizzes q
  JOIN academy_training_modules m ON q.module_id = m.id
  JOIN academy_training_paths p ON m.path_id = p.id
  WHERE p.slug = 'supervisor-training' AND m.slug = 'guest-recovery'
);
