-- Add quizzes to key training modules
-- Get module IDs for quiz-worthy modules

-- Quiz: Welcome - What Makes Us Different
INSERT INTO academy_quizzes (module_id, title, pass_score, questions)
SELECT m.id, 'What Makes Us Different', 80,
'[{"question":"What does Still and Social prioritise over pace?","options":["Efficiency","Presence","Speed","Volume"],"correct":1,"explanation":"We prioritise presence over pace, warmth over formality, and connection over transaction."},{"question":"What is the tea ritual designed to create?","options":["A sales opportunity","Calm","Entertainment","Urgency"],"correct":1,"explanation":"The tea ritual is designed to create calm and set the pace for the dining experience."},{"question":"What feeling do we want guests to leave with?","options":["Impressed by the decor","A little more whole","Full and satisfied","Entertained"],"correct":1,"explanation":"We want every guest to leave feeling a little more whole than when they arrived."}]'::jsonb
FROM academy_training_modules m
JOIN academy_training_paths p ON m.path_id = p.id
WHERE p.slug = 'welcome-to-still-and-social' AND m.slug = 'what-makes-us-different'
ON CONFLICT DO NOTHING;

-- Quiz: Values - Hospitality as Care
INSERT INTO academy_quizzes (module_id, title, pass_score, questions)
SELECT m.id, 'Hospitality as Care', 80,
'[{"question":"At Still and Social, hospitality is best described as:","options":["A transaction","An act of care","A performance","A routine"],"correct":1,"explanation":"Hospitality is not a transaction. It is an act of care."},{"question":"Every interaction is an opportunity to make someone feel:","options":["Impressed","Seen, valued, and welcome","Entertained","Rushed"],"correct":1,"explanation":"Every interaction is an opportunity to make someone feel seen, valued, and welcome."},{"question":"What is the foundation of everything we do?","options":["Profit margins","Guest reviews","Hospitality as care","Menu innovation"],"correct":2,"explanation":"Hospitality as care is the foundation of everything we do."}]'::jsonb
FROM academy_training_modules m
JOIN academy_training_paths p ON m.path_id = p.id
WHERE p.slug = 'welcome-to-still-and-social' AND m.slug = 'hospitality-as-care'
ON CONFLICT DO NOTHING;

-- Quiz: Sequence of Service - Step 10 Farewell
INSERT INTO academy_quizzes (module_id, title, pass_score, questions)
SELECT m.id, 'The Farewell', 80,
'[{"question":"The farewell is important because it is:","options":["When we collect payment","The last impression","Optional for regular guests","Only needed for large tables"],"correct":1,"explanation":"The farewell is the last impression. Make it warm, personal, and memorable."},{"question":"When possible, what should you do as guests leave?","options":["Stay at your station","Walk them toward the door","Give them a business card","Clear their table immediately"],"correct":1,"explanation":"Walk them toward the door when possible to create a personal farewell."},{"question":"What should you invite guests to do?","options":["Leave a review","Follow us on social media","Return","Try a different restaurant"],"correct":2,"explanation":"Invite them to return. This creates a sense of belonging and connection."}]'::jsonb
FROM academy_training_modules m
JOIN academy_training_paths p ON m.path_id = p.id
WHERE p.slug = 'foh-sequence-of-service' AND m.slug = 'step-10-farewell'
ON CONFLICT DO NOTHING;

-- Quiz: Food Safety
INSERT INTO academy_quizzes (module_id, title, pass_score, questions)
SELECT m.id, 'Food Handling Safety', 80,
'[{"question":"What does FIFO stand for?","options":["First In, First Out","Food Is For Others","Fresh Ingredients First Only","Final Inspection For Orders"],"correct":0,"explanation":"FIFO means First In, First Out. Always use the oldest stock first."},{"question":"Raw food should be stored:","options":["Above cooked food","Below cooked food","Next to cooked food","It does not matter"],"correct":1,"explanation":"Raw food must always be stored below cooked food to prevent contamination."},{"question":"When should you wash your hands?","options":["Only before your shift","Between tasks and after handling raw food","Only after using the bathroom","Once per hour"],"correct":1,"explanation":"Wash hands between tasks, after handling raw food, and whenever hygiene could be compromised."}]'::jsonb
FROM academy_training_modules m
JOIN academy_training_paths p ON m.path_id = p.id
WHERE p.slug = 'general-kitchen-training' AND m.slug = 'food-handling'
ON CONFLICT DO NOTHING;

-- Quiz: RSA
INSERT INTO academy_quizzes (module_id, title, pass_score, questions)
SELECT m.id, 'Responsible Service of Alcohol', 80,
'[{"question":"Responsible service of alcohol is:","options":["Optional for experienced bartenders","A legal and ethical obligation","Only required on weekends","Only for managers to worry about"],"correct":1,"explanation":"RSA is a legal and ethical obligation for everyone who serves alcohol."},{"question":"When you identify signs of intoxication, you should:","options":["Continue serving but slower","Refuse service with dignity and respect","Ignore it if they seem fine","Ask a colleague to serve them instead"],"correct":1,"explanation":"Refuse service when necessary, with dignity and respect."},{"question":"What is always the priority?","options":["Sales targets","Guest satisfaction","The safety of our guests","Keeping the bar busy"],"correct":2,"explanation":"The safety of our guests is always the priority."}]'::jsonb
FROM academy_training_modules m
JOIN academy_training_paths p ON m.path_id = p.id
WHERE p.slug = 'bartender-training' AND m.slug = 'responsible-service'
ON CONFLICT DO NOTHING;
