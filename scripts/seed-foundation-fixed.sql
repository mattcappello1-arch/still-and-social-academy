-- ============================================================
-- Foundation Training Path + 5 Modules + Quizzes + Role Assignments
-- ============================================================

-- The foundation path was already created via REST API with ID: 16a9856a-203d-405b-bb84-e98d676a7f75
-- If re-running, this ensures it exists:
INSERT INTO academy_training_paths (id, slug, title, description, department, sort_order, is_active)
VALUES (
  '16a9856a-203d-405b-bb84-e98d676a7f75',
  'foundation',
  'Foundation Training',
  'Before we teach you how, we teach you why. The essential foundation every team member completes first.',
  'universal',
  -1,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order;

-- ============================================================
-- Module 1: Welcome to Still & Social
-- ============================================================
INSERT INTO academy_training_modules (path_id, slug, title, description, content_type, content, estimated_minutes, sort_order, is_active, read_aloud_enabled)
VALUES (
  '16a9856a-203d-405b-bb84-e98d676a7f75',
  'welcome',
  'Welcome to Still & Social',
  'Your introduction to our dining sanctuary and what we stand for.',
  'mixed',
  '{
    "blocks": [
      {"type": "heading", "data": {"text": "Welcome to Still & Social", "level": 2}},
      {"type": "text", "data": {"html": "<p>Still & Social is a dining sanctuary nestled in the Dandenong Ranges. A space built for people who need to slow down, reconnect, and feel present. Everything — the way we greet, the way we pour, the way we place a dish — is guided by a single intention:</p>"}},
      {"type": "quote", "data": {"text": "To leave people feeling a little more whole than when they arrived."}},
      {"type": "text", "data": {"html": "<p>Every guest who walks through our doors should feel three things:</p>"}},
      {"type": "steps", "data": {"items": [
        {"title": "Calm", "description": "From the moment they arrive, the pace slows. The atmosphere, the lighting, the way we speak — everything signals safety and stillness."},
        {"title": "Cared For", "description": "Every detail is considered. Water is full. Tables are clean. Service is warm and attentive. Guests feel seen, not processed."},
        {"title": "Grounded", "description": "Guests leave feeling reconnected — to themselves, to the people they came with, and to the simple joy of a beautifully shared meal."}
      ]}},
      {"type": "divider", "data": {}},
      {"type": "text", "data": {"html": "<p>Still & Social is not just a place to eat or drink — it is a sanctuary for the mind, body, and soul. Everything we create, from our food and drinks to the way we serve and interact, is guided by elegance, calm, and authenticity.</p>"}},
      {"type": "text", "data": {"html": "<p>We are a small, intentional team. Every person on our floor and in our kitchen plays a vital role in creating the experience our guests come here for. You are not just filling a position — you are becoming part of a living, breathing philosophy.</p>"}},
      {"type": "tip", "data": {"title": "Meet the Founders", "text": "Still & Social was co-founded by Matthew Cappello and Meli Hellier. Their vision was born from a shared belief that hospitality should nourish not just the body, but the mind and soul. Everything you will learn here flows from that intention."}},
      {"type": "callout", "data": {"text": "By joining our team, you are becoming part of something meaningful. This is not just a job — it is an invitation to be part of a space that genuinely cares about how people feel.", "type": "info"}}
    ]
  }'::jsonb,
  6, 1, true, true
)
ON CONFLICT (path_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  estimated_minutes = EXCLUDED.estimated_minutes,
  read_aloud_enabled = EXCLUDED.read_aloud_enabled;

-- ============================================================
-- Module 2: Brand Story
-- ============================================================
INSERT INTO academy_training_modules (path_id, slug, title, description, content_type, content, estimated_minutes, sort_order, is_active, read_aloud_enabled)
VALUES (
  '16a9856a-203d-405b-bb84-e98d676a7f75',
  'brand-story',
  'Brand Story',
  'Our story, our essence, our personality, and the tone we carry in everything we do.',
  'mixed',
  '{
    "blocks": [
      {"type": "heading", "data": {"text": "Our Story", "level": 2}},
      {"type": "text", "data": {"html": "<p>There it is... That pause. That half-second between silence and sensation. The moment the world exhales, and something deeper enters. A kind of presence. A kind of beauty. A kind of knowing that you are right where you are meant to be.</p>"}},
      {"type": "text", "data": {"html": "<p>Still & Social was born from that moment. From the space between stillness and connection. From the warmth of being seen. From a love of flavours that nourish and memories that linger.</p>"}},
      {"type": "text", "data": {"html": "<p>It is a place for gathering and grounding, where soul food meets soul work. Where the rhythm of a mortar and pestle can slow a racing heart. Where the kitchen and the table become ceremony. Not performance, but presence. Not pretension, but depth. Not just healthy, but healing.</p>"}},
      {"type": "text", "data": {"html": "<p>Here, you will find dishes that carry meaning. Food that is thoughtful, not fussy. Grounded, not rigid. Bright, seasonal, balanced — like the way you feel when your body, mind, and spirit are finally on speaking terms.</p>"}},
      {"type": "text", "data": {"html": "<p>Still & Social is for those who seek the beauty in the pause. The grace in the gathering. The quiet strength of a meal made with intention. We believe nourishment does not start in the kitchen — it starts in the heart. And it grows when it is shared.</p>"}},
      {"type": "text", "data": {"html": "<p>So come sit. Come slow down.</p>"}},
      {"type": "quote", "data": {"text": "Come as you are. And leave a little more whole than when you arrived."}},
      {"type": "divider", "data": {}},
      {"type": "heading", "data": {"text": "Brand Essence", "level": 2}},
      {"type": "text", "data": {"html": "<p>Still & Social is a soulful sanctuary in a fast-paced world, a mindful pause where guests nourish mind, body, and soul. It is not just a place to eat or unwind; it is an intentional experience of presence, connection, and timeless warmth. We offer affordable elegance with depth, a human-first hospitality that celebrates meaningful moments, thoughtful details, and emotional well-being. Still & Social is where purposeful slowness meets social connection — a modern ritual of calm, joy, and regeneration.</p>"}},
      {"type": "heading", "data": {"text": "Our Personality", "level": 2}},
      {"type": "flipcards", "data": {"items": [
        {"front": "Soulful Host", "back": "Confident, warm, quietly assured — like a gracious friend who makes everyone feel at home. We lead with heart, not ego."},
        {"front": "Elegant Yet Approachable", "back": "Class without flash. Thoughtful without fuss. Timeless sophistication with heart. We are refined but never stiff."},
        {"front": "Intentional & Grounded", "back": "Present, purposeful, and mindful in every interaction. Nothing is accidental — every detail carries meaning."},
        {"front": "Balanced Energy", "back": "A harmonious blend of masculine structure and feminine warmth. Strong foundations with soft, welcoming expression."}
      ]}},
      {"type": "heading", "data": {"text": "Our Tone of Voice", "level": 2}},
      {"type": "steps", "data": {"items": [
        {"title": "Warm and Inviting", "description": "Every word should feel like an outstretched hand. We speak with genuine care and openness."},
        {"title": "Elegant Yet Accessible", "description": "We use beautiful language without being pretentious. Clear, graceful, and easy to understand."},
        {"title": "Balanced Formality", "description": "Professional but never cold. Relaxed but never sloppy. We find the middle ground that feels right."},
        {"title": "Subtle Energy", "description": "There is a quiet confidence in how we communicate. We do not shout — we draw people in."},
        {"title": "Authentic and Clear", "description": "We say what we mean with honesty and simplicity. No jargon, no pretence — just genuine expression."}
      ]}}
    ]
  }'::jsonb,
  8, 2, true, true
)
ON CONFLICT (path_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  estimated_minutes = EXCLUDED.estimated_minutes,
  read_aloud_enabled = EXCLUDED.read_aloud_enabled;

-- ============================================================
-- Module 3: The Still & Social Way
-- ============================================================
INSERT INTO academy_training_modules (path_id, slug, title, description, content_type, content, estimated_minutes, sort_order, is_active, read_aloud_enabled)
VALUES (
  '16a9856a-203d-405b-bb84-e98d676a7f75',
  'the-still-and-social-way',
  'The Still & Social Way',
  'Our philosophy, framework, values, and the language we use to create meaningful experiences.',
  'mixed',
  '{
    "blocks": [
      {"type": "heading", "data": {"text": "Our Philosophy", "level": 2}},
      {"type": "quote", "data": {"text": "A gentle rebellion against the rush."}},
      {"type": "text", "data": {"html": "<p>Most hospitality is efficient. Ours is intentional. Still & Social exists as a counterpoint to the pace of modern life — a place where slowing down is the whole point.</p>"}},
      {"type": "text", "data": {"html": "<p>We do not measure success by how fast we turn tables. We measure it by how guests feel when they leave. Our philosophy rests on three core beliefs:</p>"}},
      {"type": "steps", "data": {"items": [
        {"title": "Hospitality is how people feel", "description": "It is not what we do — it is the emotional imprint we leave. Every interaction either adds to or takes away from that feeling."},
        {"title": "Small details create memories", "description": "The perfectly timed water refill. The warm towel. The genuine farewell. These are the moments guests remember and talk about."},
        {"title": "Calm is the highest form of service", "description": "When we are calm, guests feel safe. When we rush, they feel anxious. Our internal state becomes the room''s atmosphere."}
      ]}},
      {"type": "divider", "data": {}},
      {"type": "heading", "data": {"text": "The Framework: Energy, Flow, Detail", "level": 2}},
      {"type": "text", "data": {"html": "<p>Three dimensions define how every shift should feel. Master these three and you will deliver the Still & Social experience consistently.</p>"}},
      {"type": "accordion", "data": {"items": [
        {"title": "Energy — How You Show Up", "content": "Guests feel your energy before you speak a word. Arrive calm, stay grounded, project quiet confidence. Your internal state becomes the room''s atmosphere. If you are rushed, stressed, or distracted, guests will feel it. If you are present, warm, and composed, the whole room shifts. Energy is contagious — choose yours consciously."},
        {"title": "Flow — How the Experience Moves", "content": "Smooth, guided, unrushed. The guest journey should feel effortless — like a river finding its natural path. From greeting to farewell, every transition should be seamless. Anticipate the next step before the guest needs to ask. When flow is right, guests lose track of time in the best possible way."},
        {"title": "Detail — What Guests Actually Feel", "content": "Water is full. Tables are clean. Service is refined. Luxury lives in the small things done consistently and beautifully. Detail is not about perfection — it is about care made visible. When a guest notices that their glass was refilled without asking, or that the table was reset while they stepped away, they feel valued."}
      ]}},
      {"type": "callout", "data": {"text": "Guests feel what you feel. Your calm becomes their calm. Your rush becomes their discomfort. Choose your energy consciously.", "type": "warning"}},
      {"type": "divider", "data": {}},
      {"type": "heading", "data": {"text": "Our Values", "level": 2}},
      {"type": "steps", "data": {"items": [
        {"title": "Nourishment", "description": "We nourish mind, body, and soul through every experience. From the food we serve to the energy we bring, everything is designed to leave people feeling better than when they arrived."},
        {"title": "Intentionality", "description": "Everything we do is purposeful, designed to foster calm and timeless elegance. Nothing happens by accident — every detail is considered and meaningful."},
        {"title": "Warmth & Hospitality", "description": "We create welcoming spaces where all guests feel seen, celebrated, and comfortable. Warmth is not a technique — it is who we are."},
        {"title": "Community & Regeneration", "description": "We honour and uplift our community. We believe in giving back, in building something sustainable, and in leaving things better than we found them."},
        {"title": "Authenticity", "description": "We stay true to who we are, free from pretence. We do not perform hospitality — we live it. Genuine care cannot be faked."}
      ]}},
      {"type": "divider", "data": {}},
      {"type": "heading", "data": {"text": "Language & Tone", "level": 2}},
      {"type": "text", "data": {"html": "<p>The words we choose shape the experience. At Still & Social, language is intentional — it should feel warm, calm, and confident. Here is how we speak versus how we never speak:</p>"}},
      {"type": "comparison", "data": {"before": {"label": "Never Say", "text": "\"You guys\" / \"You good?\" / \"What do you want?\" / \"No worries\" / \"Are you guys ready to order?\" / \"Just give me a sec\""}, "after": {"label": "Instead Say", "text": "\"Good evening, welcome\" / \"How is everything feeling for you?\" / \"Take your time — I am here when ready\" / \"Of course, I will take care of that\""}}},
      {"type": "tip", "data": {"title": "Remember", "text": "These are not lines to learn — they are a feeling to carry. When you internalise the warmth and calm behind these words, the right language comes naturally."}}
    ]
  }'::jsonb,
  8, 3, true, true
)
ON CONFLICT (path_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  estimated_minutes = EXCLUDED.estimated_minutes,
  read_aloud_enabled = EXCLUDED.read_aloud_enabled;

-- ============================================================
-- Module 4: Rituals of Hospitality
-- ============================================================
INSERT INTO academy_training_modules (path_id, slug, title, description, content_type, content, estimated_minutes, sort_order, is_active, read_aloud_enabled)
VALUES (
  '16a9856a-203d-405b-bb84-e98d676a7f75',
  'rituals-of-hospitality',
  'Rituals of Hospitality',
  'The five rituals that define how we care for every guest, and the standards we never compromise on.',
  'mixed',
  '{
    "blocks": [
      {"type": "heading", "data": {"text": "Rituals of Hospitality", "level": 2}},
      {"type": "text", "data": {"html": "<p>At Still & Social, hospitality is not a checklist — it is a series of rituals. Each one carries intention, and together they create the feeling that sets us apart. These five rituals guide every interaction with every guest.</p>"}},
      {"type": "heading", "data": {"text": "The Welcome", "level": 3}},
      {"type": "text", "data": {"html": "<p>First impressions are everything. Greet every guest within 5 seconds of arrival. Make eye contact. Smile genuinely. Use their name if you know it. Guide them to their table — do not point. The welcome sets the emotional tone for the entire experience. A guest who feels warmly received will forgive small imperfections later. A guest who feels ignored will notice every flaw.</p>"}},
      {"type": "heading", "data": {"text": "Presence", "level": 3}},
      {"type": "text", "data": {"html": "<p>Guests feel your energy before you speak a word. Arrive calm, stay grounded, project quiet confidence. Your internal state becomes the room''s atmosphere. Being present means giving each table your full attention — not thinking about the next task, but being fully here, right now. When you are present, guests feel safe. They relax. They open up. Presence is the foundation of everything else.</p>"}},
      {"type": "heading", "data": {"text": "Anticipation", "level": 3}},
      {"type": "text", "data": {"html": "<p>The best service is invisible. It happens before the guest needs to ask. Refill water before the glass is empty. Clear plates when the moment is right. Offer a menu suggestion before confusion sets in. Anticipation requires reading the room — watching body language, noticing pace, and staying one step ahead. When done well, guests feel cared for without ever feeling watched.</p>"}},
      {"type": "heading", "data": {"text": "Care", "level": 3}},
      {"type": "text", "data": {"html": "<p>Care is hospitality made personal. It is remembering a regular''s usual order. It is noticing when a guest is cold and offering to adjust the temperature. It is checking in at the right moment — not too early, not too late. Care means treating every guest as an individual, not a table number. It is the difference between good service and an experience that moves people.</p>"}},
      {"type": "heading", "data": {"text": "The Farewell", "level": 3}},
      {"type": "text", "data": {"html": "<p>The last impression is as important as the first. Thank every guest sincerely. Walk them toward the door when possible. Acknowledge every person at the table, not just the one who paid. The farewell is your final opportunity to make someone feel valued. Make it warm, personal, and memorable. Leave them wanting to come back.</p>"}},
      {"type": "divider", "data": {}},
      {"type": "heading", "data": {"text": "Non-Negotiable Standards", "level": 2}},
      {"type": "text", "data": {"html": "<p>These six standards are absolute. They apply to every shift, every table, every team member. No exceptions.</p>"}},
      {"type": "steps", "data": {"items": [
        {"title": "Water is never empty", "description": "Glasses should be refilled proactively, before the guest notices. Still or sparkling, poured at the table, always attentive."},
        {"title": "Tables are always clean", "description": "Crumbs cleared, surfaces wiped, settings aligned. A clean table communicates respect and attention to detail."},
        {"title": "Guests are acknowledged within 5 seconds", "description": "Even if you cannot serve them immediately, eye contact and a warm acknowledgement tells them they are seen and welcome."},
        {"title": "Drinks before food — always", "description": "Drink orders are taken and served before food orders are placed. This sets the pace and gives guests time to settle."},
        {"title": "Hot towel to every table", "description": "The hot towel ritual is a signature Still & Social touch. Present it with care at the end of the meal. It is a small gesture that leaves a lasting impression."},
        {"title": "Ambience is maintained", "description": "Lighting, music, temperature — the sensory environment is as important as the food. If something feels off, fix it immediately."}
      ]}},
      {"type": "callout", "data": {"text": "Small things create the experience. The last 5% is what guests remember most.", "type": "warning"}}
    ]
  }'::jsonb,
  7, 4, true, true
)
ON CONFLICT (path_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  estimated_minutes = EXCLUDED.estimated_minutes,
  read_aloud_enabled = EXCLUDED.read_aloud_enabled;

-- ============================================================
-- Module 5: Sequence of Service
-- ============================================================
INSERT INTO academy_training_modules (path_id, slug, title, description, content_type, content, estimated_minutes, sort_order, is_active, read_aloud_enabled)
VALUES (
  '16a9856a-203d-405b-bb84-e98d676a7f75',
  'sequence-of-service',
  'Sequence of Service',
  'The complete 16-step guest journey, dish introduction, and service recovery.',
  'mixed',
  '{
    "blocks": [
      {"type": "heading", "data": {"text": "The Complete Guest Journey — 16 Steps", "level": 2}},
      {"type": "text", "data": {"html": "<p>This is your guide to the full guest experience at Still & Social. These 16 steps are not a rigid script — they are a framework. Each step has a purpose, and together they create a seamless journey from arrival to farewell. Internalise the intention behind each step, and the execution will follow naturally.</p>"}},
      {"type": "timeline", "data": {"items": [
        {"time": "Step 1", "title": "Arrival", "description": "Greet within 5 seconds. Make eye contact, smile warmly, confirm booking. First impressions set the tone for everything."},
        {"time": "Step 2", "title": "Seating & The Pause", "description": "Guide guests to their table — do not point. Pull out chairs when appropriate. Allow a moment of arrival before speaking again. Let them settle."},
        {"time": "Step 3", "title": "Water Ritual", "description": "Offer still or sparkling water. Pour at the table with care. Refill before the glass is empty throughout the meal."},
        {"time": "Step 4", "title": "Menu Introduction", "description": "Guide guests through the menu structure. Read the table — some want detail, others want space. Highlight seasonal specials and ask about dietary requirements."},
        {"time": "Step 5", "title": "Drinks First", "description": "Always take drink orders before food. This sets the pace and gives guests time to explore the menu while enjoying their first drink."},
        {"time": "Step 6", "title": "Taking the Order", "description": "Listen carefully, confirm allergies, repeat back naturally. Accuracy is a form of care. Every order is a promise to the guest."},
        {"time": "Step 7", "title": "Entree Service", "description": "Present and introduce each dish by name. Place with intention. This is not delivery — it is part of the experience."},
        {"time": "Step 8", "title": "Entree Clear & Plate Refresh", "description": "Clear when all guests are finished. Reset the table for mains — fresh cutlery, clean surface, maintained setting."},
        {"time": "Step 9", "title": "Mains Service", "description": "Present and introduce mains. Ensure correct dishes reach correct guests. Serve with the same intention as the first course."},
        {"time": "Step 10", "title": "Check-in", "description": "After the first few bites of mains, check in genuinely. A simple question shows you care. Listen to feedback and act on it."},
        {"time": "Step 11", "title": "Table Reset After Mains", "description": "Clear plates, refresh the table. Prepare the setting for the final act of the meal."},
        {"time": "Step 12", "title": "Hot Towel Ritual", "description": "Present hot towels with care. This is a signature Still & Social touch — the timing and presentation should feel considered and premium."},
        {"time": "Step 13", "title": "Hot Towel Removal", "description": "Remove towels promptly after use. Ensure the table feels clean and refreshed for the final course."},
        {"time": "Step 14", "title": "Tea Ritual", "description": "Offer complimentary tea. This is not just a drink — it is a ritual that signals the transition from dining to reflection. Present with intention."},
        {"time": "Step 15", "title": "Soft Upsell — Dessert", "description": "Suggest dessert naturally, not forcefully. Share a genuine recommendation. If guests decline, honour that gracefully."},
        {"time": "Step 16", "title": "Farewell", "description": "Thank every guest sincerely. Walk them toward the door. Acknowledge every person at the table. The farewell is the last impression — make it count."}
      ]}},
      {"type": "divider", "data": {}},
      {"type": "heading", "data": {"text": "Dish Introduction", "level": 2}},
      {"type": "text", "data": {"html": "<p>Every dish deserves a proper introduction. Follow these four steps when presenting food to the table:</p>"}},
      {"type": "steps", "data": {"items": [
        {"title": "Approach with confidence", "description": "Carry the dish with care. Know which guest it belongs to. Approach the table calmly and with a warm expression."},
        {"title": "Name the dish", "description": "Introduce the dish by its full name. Speak clearly and warmly — this is a moment of anticipation for the guest."},
        {"title": "Add a personal touch", "description": "Share a brief note about the dish — a seasonal ingredient, the chef''s intention, or a suggested pairing. Keep it genuine, not rehearsed."},
        {"title": "Step back gracefully", "description": "Place the dish, wish them enjoyment, and step back. Give the table space to experience the moment."}
      ]}},
      {"type": "divider", "data": {}},
      {"type": "heading", "data": {"text": "Service Recovery", "level": 2}},
      {"type": "text", "data": {"html": "<p>Things will go wrong. What matters is how you respond. Service recovery is not about fixing a problem — it is about restoring trust. When handled with care, a recovered moment can be more powerful than a perfect one.</p>"}},
      {"type": "steps", "data": {"items": [
        {"title": "Slow down", "description": "Take a breath before responding. Rushing to fix things often makes them worse. A calm response signals competence."},
        {"title": "Acknowledge", "description": "Let the guest know you hear them. Validate their experience without making excuses. A simple acknowledgement goes a long way."},
        {"title": "Take ownership", "description": "Do not blame others or deflect. Own the moment, even if it was not your mistake. The guest does not care whose fault it is — they care that someone cares."},
        {"title": "Fix it", "description": "Act quickly and decisively. Offer a genuine solution. Follow up to ensure the guest feels right. Go slightly beyond what is expected."}
      ]}},
      {"type": "comparison", "data": {"before": {"label": "Avoid Saying", "text": "\"That is not my section\" / \"The kitchen made a mistake\" / \"Sorry, we are really busy tonight\" / \"There is nothing I can do\""}, "after": {"label": "Recovery Language", "text": "\"I am sorry that happened — let me take care of this for you\" / \"Thank you for letting me know, I will fix that right away\" / \"I want to make sure the rest of your evening is perfect\""}}},
      {"type": "callout", "data": {"text": "How you recover defines the experience. A guest who has a problem resolved with grace and care will often become a more loyal guest than one who had no problems at all.", "type": "warning"}}
    ]
  }'::jsonb,
  8, 5, true, true
)
ON CONFLICT (path_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  estimated_minutes = EXCLUDED.estimated_minutes,
  read_aloud_enabled = EXCLUDED.read_aloud_enabled;

-- ============================================================
-- Quizzes for each module
-- ============================================================

-- We need module IDs. Use a CTE-based approach by referencing the path + slug.

-- Quiz 1: Welcome to Still & Social
INSERT INTO academy_quizzes (module_id, title, pass_score, questions)
SELECT m.id, 'Welcome to Still & Social Quiz', 80,
  '[
    {"type": "multiple_choice", "question": "What is the single intention that guides everything at Still & Social?", "options": ["To serve the best food in the Dandenong Ranges", "To leave people feeling a little more whole than when they arrived", "To turn tables as quickly as possible", "To win hospitality awards"], "correct": 1},
    {"type": "multiple_choice", "question": "Which three feelings should every guest experience?", "options": ["Impressed, Satisfied, Full", "Calm, Cared For, Grounded", "Excited, Entertained, Energised", "Welcomed, Fed, Thanked"], "correct": 1},
    {"type": "multiple_choice", "question": "Who co-founded Still & Social?", "options": ["Matthew Cappello and Meli Hellier", "Matthew Cappello and James Oliver", "Meli Hellier and Sarah Chen", "The team collectively"], "correct": 0},
    {"type": "reflection", "question": "In your own words, what does it mean to you to be part of a \"dining sanctuary\"? How does this differ from a regular restaurant?"}
  ]'::jsonb
FROM academy_training_modules m
WHERE m.path_id = '16a9856a-203d-405b-bb84-e98d676a7f75'' AND m.slug = 'welcome''
ON CONFLICT DO NOTHING;

-- Quiz 2: Brand Story
INSERT INTO academy_quizzes (module_id, title, pass_score, questions)
SELECT m.id, 'Brand Story Quiz', 80,
  '[
    {"type": "multiple_choice", "question": "Which of these is NOT one of Still & Social''s five brand values?", "options": ["Nourishment", "Efficiency", "Intentionality", "Authenticity"], "correct": 1},
    {"type": "multiple_choice", "question": "How is the Brand Essence best described?", "options": ["A fast-casual dining concept with premium ingredients", "A soulful sanctuary where purposeful slowness meets social connection", "An exclusive fine-dining experience for special occasions", "A healthy eating chain focused on organic produce"], "correct": 1},
    {"type": "multiple_choice", "question": "The personality trait \"Elegant Yet Approachable\" means:", "options": ["Being formal and reserved at all times", "Class without flash — thoughtful without fuss, timeless sophistication with heart", "Dressing in designer uniforms", "Speaking in formal English only"], "correct": 1},
    {"type": "multiple_choice", "question": "Which phrase best captures the Brand Story?", "options": ["Come sit. Come slow down. Come as you are.", "Eat fast, live well.", "Where every meal is a celebration.", "Fine dining for everyone."], "correct": 0},
    {"type": "reflection", "question": "Which of the four personality traits (Soulful Host, Elegant Yet Approachable, Intentional & Grounded, Balanced Energy) resonates most with you? How might you express it in your role?"}
  ]'::jsonb
FROM academy_training_modules m
WHERE m.path_id = '16a9856a-203d-405b-bb84-e98d676a7f75'' AND m.slug = 'brand-story''
ON CONFLICT DO NOTHING;

-- Quiz 3: The Still & Social Way
INSERT INTO academy_quizzes (module_id, title, pass_score, questions)
SELECT m.id, 'The Still & Social Way Quiz', 80,
  '[
    {"type": "multiple_choice", "question": "What are the three dimensions of the Still & Social framework?", "options": ["Speed, Quality, Value", "Energy, Flow, Detail", "Welcome, Serve, Farewell", "Food, Drink, Ambience"], "correct": 1},
    {"type": "multiple_choice", "question": "Which of these is one of the three core beliefs?", "options": ["Speed is the highest form of service", "Calm is the highest form of service", "Efficiency is the highest form of service", "Precision is the highest form of service"], "correct": 1},
    {"type": "multiple_choice", "question": "Which phrase should you NEVER say to a guest?", "options": ["Take your time — I am here when ready", "Good evening, welcome", "You guys ready to order?", "How is everything feeling for you?"], "correct": 2},
    {"type": "multiple_choice", "question": "The Energy Principle states that:", "options": ["Guests only care about the food", "Guests feel what you feel — your calm becomes their calm", "Energy drinks should be available for staff", "High energy means loud and enthusiastic service"], "correct": 1},
    {"type": "reflection", "question": "Think about a time you experienced truly calm, intentional service somewhere. What made it stand out? How can you bring that same feeling to your shifts at Still & Social?"}
  ]'::jsonb
FROM academy_training_modules m
WHERE m.path_id = '16a9856a-203d-405b-bb84-e98d676a7f75'' AND m.slug = 'the-still-and-social-way''
ON CONFLICT DO NOTHING;

-- Quiz 4: Rituals of Hospitality
INSERT INTO academy_quizzes (module_id, title, pass_score, questions)
SELECT m.id, 'Rituals of Hospitality Quiz', 80,
  '[
    {"type": "multiple_choice", "question": "Within how many seconds should a guest be acknowledged upon arrival?", "options": ["10 seconds", "30 seconds", "5 seconds", "15 seconds"], "correct": 2},
    {"type": "multiple_choice", "question": "Which of these is NOT one of the six non-negotiable standards?", "options": ["Water is never empty", "Tables are always clean", "Music volume is always at maximum", "Drinks before food — always"], "correct": 2},
    {"type": "multiple_choice", "question": "What is the Still & Social signature touch at the end of a meal?", "options": ["A complimentary dessert", "A hot towel ritual", "A feedback form", "A gift voucher"], "correct": 1},
    {"type": "multiple_choice", "question": "Why is the farewell as important as the welcome?", "options": ["Because it is the last impression and final opportunity to make someone feel valued", "Because it is when you collect payment", "Because it is required by management", "Because it is when you clear the table"], "correct": 0},
    {"type": "reflection", "question": "Of the six non-negotiable standards, which one do you think would be easiest to accidentally let slip during a busy shift? What strategies could you use to maintain it?"}
  ]'::jsonb
FROM academy_training_modules m
WHERE m.path_id = '16a9856a-203d-405b-bb84-e98d676a7f75'' AND m.slug = 'rituals-of-hospitality''
ON CONFLICT DO NOTHING;

-- Quiz 5: Sequence of Service
INSERT INTO academy_quizzes (module_id, title, pass_score, questions)
SELECT m.id, 'Sequence of Service Quiz', 80,
  '[
    {"type": "multiple_choice", "question": "In the 16-step sequence, what must ALWAYS come before food orders?", "options": ["Menu introduction", "Drinks", "Dessert menu", "Hot towels"], "correct": 1},
    {"type": "multiple_choice", "question": "What is the first step of service recovery?", "options": ["Apologise immediately", "Blame the kitchen", "Slow down", "Offer a discount"], "correct": 2},
    {"type": "multiple_choice", "question": "When introducing a dish, you should:", "options": ["Place it down quickly and move on", "Name the dish and add a personal touch about ingredients or pairing", "Read the full recipe to the guest", "Ask the guest to guess what it is"], "correct": 1},
    {"type": "multiple_choice", "question": "The complimentary tea ritual signals:", "options": ["That the restaurant is closing soon", "The transition from dining to reflection", "That dessert is not available", "The end of water service"], "correct": 1},
    {"type": "reflection", "question": "The service recovery framework says \"How you recover defines the experience.\" Describe a scenario where something goes wrong during service and walk through how you would handle it using the four steps: Slow down, Acknowledge, Take ownership, Fix it."}
  ]'::jsonb
FROM academy_training_modules m
WHERE m.path_id = '16a9856a-203d-405b-bb84-e98d676a7f75'' AND m.slug = 'sequence-of-service''
ON CONFLICT DO NOTHING;

-- ============================================================
-- Assign Foundation path to ALL 10 roles (sort_order 0, required)
-- ============================================================
INSERT INTO academy_role_training_paths (role, path_id, is_required, sort_order) VALUES
  ('waiter', '16a9856a-203d-405b-bb84-e98d676a7f75', true, 0),
  ('restaurant_all_rounder', '16a9856a-203d-405b-bb84-e98d676a7f75', true, 0),
  ('bartender', '16a9856a-203d-405b-bb84-e98d676a7f75', true, 0),
  ('kitchen_hand', '16a9856a-203d-405b-bb84-e98d676a7f75', true, 0),
  ('entree_chef', '16a9856a-203d-405b-bb84-e98d676a7f75', true, 0),
  ('wok_chef', '16a9856a-203d-405b-bb84-e98d676a7f75', true, 0),
  ('curries_chef', '16a9856a-203d-405b-bb84-e98d676a7f75', true, 0),
  ('expo_chef', '16a9856a-203d-405b-bb84-e98d676a7f75', true, 0),
  ('supervisor', '16a9856a-203d-405b-bb84-e98d676a7f75', true, 0),
  ('manager', '16a9856a-203d-405b-bb84-e98d676a7f75', true, 0)
ON CONFLICT (role, path_id) DO NOTHING;
