-- Interactive quizzes with reflection + scenario questions for new paths

-- The Still & Social Way - How We Care For Guests
INSERT INTO academy_quizzes (module_id, title, pass_score, questions)
SELECT m.id, 'Caring For Guests', 80,
'[
{"question":"What is the first thing you should do when a guest arrives?","options":["Check the booking system","Notice them and acknowledge their presence immediately","Wait for them to approach","Finish what you are doing first"],"correct":0},
{"question":"The four steps of guest care at Still and Social are:","options":["Greet, Serve, Bill, Farewell","See, Welcome, Care, Thank","Seat, Order, Deliver, Clear","Smile, Serve, Sell, Send"],"correct":1},
{"type":"reflection","question":"Think about a time you felt truly cared for as a customer somewhere. What did the staff do that made you feel that way? How could you bring that same feeling to guests at Still and Social?","minLength":60}
]'::jsonb
FROM academy_training_modules m JOIN academy_training_paths p ON m.path_id = p.id
WHERE p.slug = 'the-still-and-social-way' AND m.slug = 'how-we-care-for-guests'
ON CONFLICT DO NOTHING;

-- Rituals of Hospitality - Ritual 4: Care
INSERT INTO academy_quizzes (module_id, title, pass_score, questions)
SELECT m.id, 'The Ritual of Care', 80,
'[
{"question":"Care in hospitality means:","options":["Following a checklist","A genuine desire to make someone experience better","Being efficient","Avoiding mistakes"],"correct":1},
{"type":"scenario","question":"A regular guest arrives and you remember they mentioned last visit that they were celebrating a promotion. How do you use this knowledge to show care?","context":"The guest is with two friends. They seem relaxed and happy. You are their waiter tonight.","minLength":40},
{"question":"When something goes wrong, care means:","options":["Offering a discount immediately","Owning it fully, resolving genuinely, and following up sincerely","Blaming the kitchen","Apologising and moving on quickly"],"correct":1}
]'::jsonb
FROM academy_training_modules m JOIN academy_training_paths p ON m.path_id = p.id
WHERE p.slug = 'rituals-of-hospitality' AND m.slug = 'ritual-4-care'
ON CONFLICT DO NOTHING;

-- Leadership Academy - Leadership Foundations
INSERT INTO academy_quizzes (module_id, title, pass_score, questions)
SELECT m.id, 'Leadership Foundations', 80,
'[
{"question":"Leadership at Still and Social is about:","options":["Authority and control","Influence, care, and accountability","Being the most experienced","Managing the roster"],"correct":1},
{"type":"reflection","question":"What does leadership mean to you personally? Describe a leader you admire and what qualities they demonstrate that you would like to develop.","minLength":60},
{"question":"The best leaders create environments where people:","options":["Follow instructions perfectly","Want to do their best work","Never make mistakes","Work independently without support"],"correct":1}
]'::jsonb
FROM academy_training_modules m JOIN academy_training_paths p ON m.path_id = p.id
WHERE p.slug = 'leadership-academy' AND m.slug = 'leadership-foundations'
ON CONFLICT DO NOTHING;

-- Event Training - Private Functions
INSERT INTO academy_quizzes (module_id, title, pass_score, questions)
SELECT m.id, 'Private Functions', 80,
'[
{"question":"The host of a private function should feel:","options":["Like a regular customer","That their event is the most important thing happening","Grateful for the discount","Impressed by the menu"],"correct":1},
{"type":"scenario","question":"You are managing a private birthday dinner for 20 guests. The host approaches you 30 minutes before the event looking stressed because the cake has not arrived. What do you do?","context":"The guests are starting to arrive. The table is set. The kitchen is ready. The host is a repeat customer.","minLength":50},
{"question":"Every touchpoint during a private function should feel:","options":["Efficient and quick","Considered and personal","The same as regular service","Minimal to avoid interruption"],"correct":1}
]'::jsonb
FROM academy_training_modules m JOIN academy_training_paths p ON m.path_id = p.id
WHERE p.slug = 'event-training' AND m.slug = 'private-functions'
ON CONFLICT DO NOTHING;

-- Bartender Training - Guest Interaction
INSERT INTO academy_quizzes (module_id, title, pass_score, questions)
SELECT m.id, 'Bar Guest Interaction', 80,
'[
{"question":"The bar is a place of:","options":["Transaction","Connection","Speed","Noise"],"correct":1},
{"type":"scenario","question":"A guest sitting alone at the bar looks like they want to chat, but the guest next to them clearly prefers quiet. How do you manage both experiences?","context":"It is a moderately busy evening. You have a few minutes between drink orders.","minLength":40},
{"question":"You should read the room because:","options":["Some guests want conversation, others want quiet","It helps you upsell more","It looks professional","Your manager is watching"],"correct":0}
]'::jsonb
FROM academy_training_modules m JOIN academy_training_paths p ON m.path_id = p.id
WHERE p.slug = 'bartender-training' AND m.slug = 'bar-guest-interaction'
ON CONFLICT DO NOTHING;
