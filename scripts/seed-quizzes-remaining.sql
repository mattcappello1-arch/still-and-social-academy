-- Quizzes for paths that don't have any yet

-- Waiter Training -> Guest Experience Standards
INSERT INTO academy_quizzes (module_id, title, pass_score, questions)
SELECT m.id, 'Guest Experience Standards', 80,
'[{"question":"What is the most important thing a guest should feel during their visit?","options":["Impressed by the speed","Welcome, valued, and cared for","That we are the best restaurant","That we are very busy"],"correct":1,"explanation":"Every guest should feel welcome, valued, and cared for throughout their visit."},{"question":"When a guest has a special request, you should:","options":["Say no if it is not on the menu","Do your best to accommodate with a positive attitude","Tell them to come back another time","Refer them to the manager only"],"correct":1,"explanation":"Always try to accommodate special requests with a positive attitude."},{"question":"Consistency in guest experience means:","options":["Every visit feels the same","Every guest receives the same high standard of care","Following a rigid script","Serving the same dishes"],"correct":1,"explanation":"Consistency means every guest receives the same high standard of care, regardless of the day or time."}]'::jsonb
FROM academy_training_modules m
JOIN academy_training_paths p ON m.path_id = p.id
WHERE p.slug = 'waiter-training' AND m.slug = 'guest-experience-standards'
ON CONFLICT DO NOTHING;

-- All-Rounder Training -> Opening Duties
INSERT INTO academy_quizzes (module_id, title, pass_score, questions)
SELECT m.id, 'Opening Duties', 80,
'[{"question":"Opening duties should be completed:","options":["Whenever you get around to it","Before service begins, thoroughly and consistently","Only when the manager reminds you","As fast as possible"],"correct":1,"explanation":"Opening duties must be completed before service begins, thoroughly and consistently."},{"question":"Why is the opening checklist important?","options":["To keep staff busy","To ensure the venue is ready to welcome guests","Only for compliance","It is not important"],"correct":1,"explanation":"The opening checklist ensures the venue is fully prepared to welcome guests."},{"question":"If you notice something is not right during opening:","options":["Ignore it and hope nobody notices","Fix it or report it immediately","Wait until after service","Only tell the manager at the end of the day"],"correct":1,"explanation":"Fix issues or report them immediately during opening. Do not wait."} ]'::jsonb
FROM academy_training_modules m
JOIN academy_training_paths p ON m.path_id = p.id
WHERE p.slug = 'all-rounder-training' AND m.slug = 'opening-duties'
ON CONFLICT DO NOTHING;

-- Kitchen Hand Training -> Dishwashing Standards
INSERT INTO academy_quizzes (module_id, title, pass_score, questions)
SELECT m.id, 'Dishwashing Standards', 80,
'[{"question":"Clean dishes are essential because they:","options":["Look nice","Directly impact food safety and guest experience","Are only important for inspections","Help the kitchen look tidy"],"correct":1,"explanation":"Clean dishes directly impact food safety and guest experience."},{"question":"The correct order for dishwashing is:","options":["Rinse, wash, dry","Scrape, wash, rinse, sanitise, dry","Just put everything in the machine","Wash, scrape, dry"],"correct":1,"explanation":"The correct order is scrape, wash, rinse, sanitise, dry."},{"question":"When should you change the wash water?","options":["At the end of the shift","When it becomes dirty or loses temperature","Only when told to","Every two hours"],"correct":1,"explanation":"Change wash water when it becomes dirty or loses temperature to maintain hygiene standards."}]'::jsonb
FROM academy_training_modules m
JOIN academy_training_paths p ON m.path_id = p.id
WHERE p.slug = 'kitchen-hand-training' AND m.slug = 'dishwashing-standards'
ON CONFLICT DO NOTHING;

-- Wok Chef Training -> Wok Safety
INSERT INTO academy_quizzes (module_id, title, pass_score, questions)
SELECT m.id, 'Wok Safety', 80,
'[{"question":"Before using a wok, you should always:","options":["Fill it with water","Check that the burner and ventilation are working correctly","Season it with butter","Let it cool down"],"correct":1,"explanation":"Always check that the burner and ventilation are working correctly before using a wok."},{"question":"When working with high heat, you should:","options":["Wear loose clothing","Keep water away from hot oil and wear appropriate PPE","Work as fast as possible without safety checks","Use any oil available"],"correct":1,"explanation":"Keep water away from hot oil and always wear appropriate PPE when working with high heat."},{"question":"If a wok fire occurs, you should:","options":["Pour water on it","Cover it to smother the flame and use appropriate extinguisher","Leave the kitchen","Blow on it"],"correct":1,"explanation":"Cover the wok to smother the flame and use the appropriate fire extinguisher. Never use water on an oil fire."}]'::jsonb
FROM academy_training_modules m
JOIN academy_training_paths p ON m.path_id = p.id
WHERE p.slug = 'wok-chef-training' AND m.slug = 'wok-safety'
ON CONFLICT DO NOTHING;

-- Curries Chef Training -> Curry Base Knowledge
INSERT INTO academy_quizzes (module_id, title, pass_score, questions)
SELECT m.id, 'Curry Base Knowledge', 80,
'[{"question":"A great curry base starts with:","options":["Opening a jar","Properly prepared aromatics and fresh spices","Packet seasoning","Whatever is available"],"correct":1,"explanation":"A great curry base starts with properly prepared aromatics and fresh spices."},{"question":"Consistency in curry preparation is achieved by:","options":["Guessing measurements each time","Following standardised recipes and tasting throughout","Using pre-made bases only","Cooking everything on high heat"],"correct":1,"explanation":"Follow standardised recipes and taste throughout the cooking process to maintain consistency."},{"question":"When adjusting seasoning in a curry, you should:","options":["Add a lot at once","Season gradually and taste as you go","Only season at the end","Let someone else decide"],"correct":1,"explanation":"Season gradually and taste as you go. You can always add more but cannot take it away."}]'::jsonb
FROM academy_training_modules m
JOIN academy_training_paths p ON m.path_id = p.id
WHERE p.slug = 'curries-chef-training' AND m.slug = 'curry-base-knowledge'
ON CONFLICT DO NOTHING;
