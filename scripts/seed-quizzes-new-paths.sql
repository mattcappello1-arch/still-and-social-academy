-- Quizzes for The Still & Social Way
INSERT INTO academy_quizzes (module_id, title, pass_score, questions)
SELECT m.id, 'The Ritual of Good Living', 80,
'[{"question":"The Ritual of Good Living is best described as:","options":["A menu item","A way of being","A marketing slogan","A staff meeting"],"correct":1,"explanation":"The Ritual of Good Living is not a destination to reach. It is a way of being."},{"question":"What should every shift be an opportunity for?","options":["Earning tips","Embodying our philosophy","Finishing early","Avoiding mistakes"],"correct":1,"explanation":"Every shift is an opportunity to embody this philosophy in how you greet, serve, and connect."},{"question":"We find beauty in:","options":["Expensive decor","The ordinary","Complicated processes","Being the busiest restaurant"],"correct":1,"explanation":"We find beauty in the ordinary and create space for what matters most."}]'::jsonb
FROM academy_training_modules m JOIN academy_training_paths p ON m.path_id = p.id
WHERE p.slug = 'the-still-and-social-way' AND m.slug = 'ritual-of-good-living'
ON CONFLICT DO NOTHING;

-- Quiz for Rituals of Hospitality - The Welcome
INSERT INTO academy_quizzes (module_id, title, pass_score, questions)
SELECT m.id, 'The Welcome Ritual', 80,
'[{"question":"The first 30 seconds of a guest experience:","options":["Do not matter much","Shape everything that follows","Are only important for new guests","Should be scripted"],"correct":1,"explanation":"The first 30 seconds shape everything that follows."},{"question":"When a guest arrives, you should:","options":["Wait for them to approach","Walk toward them with warmth","Point to the host stand","Continue what you are doing"],"correct":1,"explanation":"Walk toward them with warmth. Do not wait for them to come to you."},{"question":"The welcome is not a task to complete. It is:","options":["A formality","A feeling to create","Optional during busy periods","Only for the host"],"correct":1,"explanation":"The welcome is a feeling to create. Every guest should feel their arrival was the best part of your day."}]'::jsonb
FROM academy_training_modules m JOIN academy_training_paths p ON m.path_id = p.id
WHERE p.slug = 'rituals-of-hospitality' AND m.slug = 'ritual-1-the-welcome'
ON CONFLICT DO NOTHING;

-- Quiz for Rituals of Hospitality - Anticipation
INSERT INTO academy_quizzes (module_id, title, pass_score, questions)
SELECT m.id, 'The Art of Anticipation', 80,
'[{"question":"The highest level of hospitality is:","options":["Fast service","Anticipating needs before they are expressed","Memorising the menu","Following a checklist"],"correct":1,"explanation":"Anticipating what a guest needs before they know they need it is the highest level of hospitality."},{"question":"A water refill should happen:","options":["When the guest asks","Before the glass is empty","At set intervals","Only once per meal"],"correct":1,"explanation":"Refill before the glass is empty. Anticipation means acting before being asked."},{"question":"If a guest has been looking at the menu for several minutes, you should:","options":["Give them more time indefinitely","Approach and ask if they have questions","Send someone else","Assume they are happy"],"correct":1,"explanation":"A gentle offer of help shows you are paying attention without being pushy."}]'::jsonb
FROM academy_training_modules m JOIN academy_training_paths p ON m.path_id = p.id
WHERE p.slug = 'rituals-of-hospitality' AND m.slug = 'ritual-3-anticipation'
ON CONFLICT DO NOTHING;

-- Quiz for Leadership Academy - Coaching
INSERT INTO academy_quizzes (module_id, title, pass_score, questions)
SELECT m.id, 'Coaching and Feedback', 80,
'[{"question":"Great coaching is about:","options":["Telling people what to do","Asking the right questions and listening deeply","Giving orders efficiently","Correcting mistakes publicly"],"correct":1,"explanation":"Coaching is about asking the right questions, listening deeply, and helping people find their own answers."},{"question":"Feedback should be:","options":["Saved for annual reviews","Specific, timely, and delivered with care","Only positive","Given in front of the team"],"correct":1,"explanation":"Feedback should be specific, timely, and always delivered with care."},{"question":"A great leader creates an environment where people:","options":["Follow instructions without question","Want to do their best work","Are afraid of making mistakes","Compete against each other"],"correct":1,"explanation":"The best leaders create environments where people want to do their best work."}]'::jsonb
FROM academy_training_modules m JOIN academy_training_paths p ON m.path_id = p.id
WHERE p.slug = 'leadership-academy' AND m.slug = 'coaching-and-feedback'
ON CONFLICT DO NOTHING;

-- Quiz for Leadership Academy - Difficult Conversations
INSERT INTO academy_quizzes (module_id, title, pass_score, questions)
SELECT m.id, 'Difficult Conversations', 80,
'[{"question":"When a difficult conversation is needed, you should:","options":["Avoid it until it becomes urgent","Approach with empathy, clarity, and respect","Have it via text message","Let HR handle it"],"correct":1,"explanation":"Approach difficult conversations with empathy, clarity, and respect."},{"question":"If you avoid difficult conversations:","options":["The problem usually resolves itself","Small issues become big ones","Staff will respect you more","It shows good leadership"],"correct":1,"explanation":"Avoid them and small issues become big ones."},{"question":"The key to a difficult conversation is:","options":["Being confrontational","Winning the argument","Approaching with empathy and clarity","Having witnesses present"],"correct":2,"explanation":"The key is to approach with empathy, clarity, and respect."}]'::jsonb
FROM academy_training_modules m JOIN academy_training_paths p ON m.path_id = p.id
WHERE p.slug = 'leadership-academy' AND m.slug = 'difficult-conversations'
ON CONFLICT DO NOTHING;

-- Quiz for Event Training - Event Setup
INSERT INTO academy_quizzes (module_id, title, pass_score, questions)
SELECT m.id, 'Event Setup and Pack Down', 80,
'[{"question":"A well-executed event starts with:","options":["Arriving on time","Thorough setup","Good weather","Many staff"],"correct":1,"explanation":"A well-executed event starts with thorough setup."},{"question":"After an event, you should leave the venue:","options":["For the morning team to clean","In perfect condition","Mostly tidy","As it was during the event"],"correct":1,"explanation":"Leave the venue in perfect condition after pack down."},{"question":"Before an event, staff should be:","options":["Left to figure it out","Briefed on the running order","Given only their own tasks","Told to improvise"],"correct":1,"explanation":"All staff should be briefed on the running order before the event begins."}]'::jsonb
FROM academy_training_modules m JOIN academy_training_paths p ON m.path_id = p.id
WHERE p.slug = 'event-training' AND m.slug = 'event-setup-packdown'
ON CONFLICT DO NOTHING;
