-- More quizzes across training paths

-- Quiz: Welcome - Team Expectations
INSERT INTO academy_quizzes (module_id, title, pass_score, questions)
SELECT m.id, 'Team Expectations', 80,
'[{"question":"What is expected of every team member at the start of their shift?","options":["Arrive whenever convenient","Show up on time, in full uniform, ready to work","Check phone first","Wait for instructions"],"correct":1,"explanation":"We show up on time, in full uniform, ready to work."},{"question":"How should team members communicate?","options":["Only when spoken to","Through text messages","Openly and supportively","Only with managers"],"correct":2,"explanation":"We communicate openly and support each other during service."},{"question":"What attitude should every team member have toward learning?","options":["Learning stops after training","We are always learning and growing","Only new staff need to learn","Learning is optional"],"correct":1,"explanation":"We are always learning and growing at Still and Social."}]'::jsonb
FROM academy_training_modules m JOIN academy_training_paths p ON m.path_id = p.id
WHERE p.slug = 'welcome-to-still-and-social' AND m.slug = 'team-expectations'
ON CONFLICT DO NOTHING;

-- Quiz: Sequence of Service - Tea Ritual
INSERT INTO academy_quizzes (module_id, title, pass_score, questions)
SELECT m.id, 'The Tea Ritual', 80,
'[{"question":"The tea offering at Still and Social is:","options":["Charged at a premium","Complimentary for every guest","Only for VIP guests","Available on request only"],"correct":1,"explanation":"We offer every guest a complimentary tea as they settle in."},{"question":"The tea ritual should be presented with:","options":["Speed and efficiency","Intention and care","A sales pitch","Minimal interaction"],"correct":1,"explanation":"Present it with intention, explain the offering, and allow the moment to create calm."},{"question":"What does the tea ritual set for the dining experience?","options":["The menu expectations","The price point","The pace","The dress code"],"correct":2,"explanation":"The tea ritual sets the pace for the entire dining experience."}]'::jsonb
FROM academy_training_modules m JOIN academy_training_paths p ON m.path_id = p.id
WHERE p.slug = 'foh-sequence-of-service' AND m.slug = 'step-2-tea-ritual'
ON CONFLICT DO NOTHING;

-- Quiz: Sequence of Service - Menu Introduction
INSERT INTO academy_quizzes (module_id, title, pass_score, questions)
SELECT m.id, 'Menu Introduction', 80,
'[{"question":"When introducing the menu, you should ask about:","options":["Budget","Dietary requirements","How hungry they are","What they had last time"],"correct":1,"explanation":"Always ask about dietary requirements when walking guests through the menu."},{"question":"The menu should be explained:","options":["Quickly to save time","Clearly and warmly","Only if asked","Using technical terms"],"correct":1,"explanation":"Explain our dining concept clearly and warmly."},{"question":"Guests should feel:","options":["Overwhelmed by choices","Guided, not overwhelmed","Pressured to order quickly","Left alone to decide"],"correct":1,"explanation":"Make guests feel guided, not overwhelmed."}]'::jsonb
FROM academy_training_modules m JOIN academy_training_paths p ON m.path_id = p.id
WHERE p.slug = 'foh-sequence-of-service' AND m.slug = 'step-4-menu-introduction'
ON CONFLICT DO NOTHING;

-- Quiz: Waiter - Upselling Naturally
INSERT INTO academy_quizzes (module_id, title, pass_score, questions)
SELECT m.id, 'Upselling Naturally', 80,
'[{"question":"Upselling at Still and Social is about:","options":["Pushing the most expensive items","Enhancing the guest experience","Meeting sales targets","Following a script"],"correct":1,"explanation":"Upselling is about enhancing the guest experience, not pushing products."},{"question":"When upselling feels natural, it:","options":["Goes unnoticed","Adds value","Feels pushy","Is unnecessary"],"correct":1,"explanation":"When upselling feels natural, it adds value to the experience."},{"question":"Recommendations should come from:","options":["The menu description","What management tells you","Your genuine experience","Online reviews"],"correct":2,"explanation":"Share recommendations from genuine experience and personal favourites."}]'::jsonb
FROM academy_training_modules m JOIN academy_training_paths p ON m.path_id = p.id
WHERE p.slug = 'waiter-training' AND m.slug = 'upselling-naturally'
ON CONFLICT DO NOTHING;

-- Quiz: Waiter - Dietary Questions
INSERT INTO academy_quizzes (module_id, title, pass_score, questions)
SELECT m.id, 'Dietary Awareness', 80,
'[{"question":"When should you ask about dietary requirements?","options":["After the food arrives","Early in the ordering process","Only if the guest mentions it","At the end of the meal"],"correct":1,"explanation":"Always ask about dietary requirements early in the ordering process."},{"question":"If you are unsure whether a dish can be modified, you should:","options":["Guess based on experience","Tell the guest it cannot be done","Check with the kitchen","Suggest a different restaurant"],"correct":2,"explanation":"When unsure, check with the kitchen. Never guess."},{"question":"Dietary awareness is a matter of:","options":["Personal preference","Guest safety and trust","Menu knowledge","Time management"],"correct":1,"explanation":"Dietary awareness is a matter of guest safety and trust."}]'::jsonb
FROM academy_training_modules m JOIN academy_training_paths p ON m.path_id = p.id
WHERE p.slug = 'waiter-training' AND m.slug = 'dietary-questions'
ON CONFLICT DO NOTHING;

-- Quiz: General Kitchen - Cross Contamination
INSERT INTO academy_quizzes (module_id, title, pass_score, questions)
SELECT m.id, 'Cross Contamination', 80,
'[{"question":"You should use separate cutting boards for:","options":["Different vegetables","Raw and cooked food","Morning and evening prep","Different chefs"],"correct":1,"explanation":"Use separate cutting boards for raw and cooked food to prevent cross contamination."},{"question":"Allergens should be:","options":["Mixed with regular ingredients","Stored separately","Only tracked on weekends","Ignored if in small amounts"],"correct":1,"explanation":"Store allergens separately to prevent contamination."},{"question":"When should you wash your hands?","options":["At the start of the shift only","Between tasks","Only after using the bathroom","Once per hour"],"correct":1,"explanation":"Wash hands between tasks to prevent cross contamination."}]'::jsonb
FROM academy_training_modules m JOIN academy_training_paths p ON m.path_id = p.id
WHERE p.slug = 'general-kitchen-training' AND m.slug = 'cross-contamination'
ON CONFLICT DO NOTHING;

-- Quiz: General Kitchen - Temperature Control
INSERT INTO academy_quizzes (module_id, title, pass_score, questions)
SELECT m.id, 'Temperature Control', 80,
'[{"question":"Fridge and freezer temperatures should be:","options":["Checked weekly","Recorded daily","Checked monthly","Only checked if food looks wrong"],"correct":1,"explanation":"Record fridge and freezer temperatures daily."},{"question":"Temperature control in the kitchen is:","options":["A suggestion","Non-negotiable","Only for managers","Flexible during busy service"],"correct":1,"explanation":"Temperature control is non-negotiable."},{"question":"Hot food must:","options":["Cool down before serving","Stay hot","Be stored at room temperature","Be reheated multiple times"],"correct":1,"explanation":"Hot food must stay hot, cold food must stay cold."}]'::jsonb
FROM academy_training_modules m JOIN academy_training_paths p ON m.path_id = p.id
WHERE p.slug = 'general-kitchen-training' AND m.slug = 'temperature-control'
ON CONFLICT DO NOTHING;

-- Quiz: Expo Chef - Quality Control
INSERT INTO academy_quizzes (module_id, title, pass_score, questions)
SELECT m.id, 'Quality Control', 80,
'[{"question":"Before a dish leaves the kitchen, the expo should check:","options":["Only the garnish","Temperature, presentation, portion, and garnish","Just the plate rim","Nothing if the chef prepared it"],"correct":1,"explanation":"Check every dish: temperature, presentation, portion, garnish."},{"question":"If something is not right with a dish, you should:","options":["Send it anyway","Send it back","Ignore it during busy service","Let FOH decide"],"correct":1,"explanation":"If something is not right, send it back. Nothing substandard reaches the guest."},{"question":"The expo is the last line of:","options":["Communication","Quality control","Stock management","Cleaning"],"correct":1,"explanation":"The expo is the last line of quality control."}]'::jsonb
FROM academy_training_modules m JOIN academy_training_paths p ON m.path_id = p.id
WHERE p.slug = 'expo-chef-training' AND m.slug = 'quality-control'
ON CONFLICT DO NOTHING;

-- Quiz: Supervisor - Guest Recovery
INSERT INTO academy_quizzes (module_id, title, pass_score, questions)
SELECT m.id, 'Guest Recovery', 80,
'[{"question":"When something goes wrong, the first thing to do is:","options":["Offer a discount","Respond quickly and with empathy","Blame the kitchen","Ignore it and hope they do not notice"],"correct":1,"explanation":"Respond quickly and with empathy when something goes wrong."},{"question":"A well-handled complaint can create:","options":["A negative review","A more loyal guest","An awkward situation","A refund request"],"correct":1,"explanation":"A well-handled complaint can create a more loyal guest than a perfect visit."},{"question":"When listening to a guest complaint, you should:","options":["Interrupt with solutions","Listen fully and apologise sincerely","Defend the team","Redirect to a manager immediately"],"correct":1,"explanation":"Listen to the guest fully, apologise sincerely, and offer a genuine solution."}]'::jsonb
FROM academy_training_modules m JOIN academy_training_paths p ON m.path_id = p.id
WHERE p.slug = 'supervisor-training' AND m.slug = 'guest-recovery'
ON CONFLICT DO NOTHING;

-- Quiz: Management - Protecting the Brand
INSERT INTO academy_quizzes (module_id, title, pass_score, questions)
SELECT m.id, 'Protecting The Brand', 80,
'[{"question":"As a manager, you are a guardian of:","options":["The budget","The Still and Social brand","The roster","The stock room"],"correct":1,"explanation":"As a manager, you are a guardian of the Still and Social brand."},{"question":"Every decision should align with our:","options":["Profit targets","Values: presence, warmth, thoughtfulness, and care","Personal preferences","Industry trends"],"correct":1,"explanation":"Every decision should align with our values."},{"question":"You protect the brand through:","options":["Marketing campaigns","How you lead, serve, and represent us","Social media posts","Discounts and promotions"],"correct":1,"explanation":"Protect the brand in how you lead, how you serve, and how you represent us."}]'::jsonb
FROM academy_training_modules m JOIN academy_training_paths p ON m.path_id = p.id
WHERE p.slug = 'management-training' AND m.slug = 'protecting-the-brand'
ON CONFLICT DO NOTHING;
