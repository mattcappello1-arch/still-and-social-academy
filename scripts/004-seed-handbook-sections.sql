-- Academy Expansion: Seed handbook sections
-- Run order: 4

INSERT INTO academy_handbook_sections (title, slug, category, sort_order, content) VALUES

('Welcome to Still & Social', 'welcome', 'general', 1,
  '[{"type":"heading","text":"Welcome to the Team"},{"type":"paragraph","text":"Welcome to Still & Social. We are a venue built on genuine hospitality, quality, and community. This handbook is your guide to understanding how we work, what we expect, and how we support you."},{"type":"paragraph","text":"Whether you are front of house, behind the bar, or in the kitchen — you are part of something bigger. We want every team member to feel valued, supported, and set up to succeed."}]'::jsonb),

('Our Values & Culture', 'values-culture', 'expectations', 2,
  '[{"type":"heading","text":"What We Stand For"},{"type":"list","items":["Genuine Hospitality — every guest matters","Quality First — in everything we serve and do","Team Before Ego — we win together","Growth Mindset — always learning, always improving","Community — we are part of something bigger"]},{"type":"paragraph","text":"These values guide every decision we make, from how we greet guests to how we support each other on a tough shift."}]'::jsonb),

('Code of Conduct', 'code-of-conduct', 'policies', 3,
  '[{"type":"heading","text":"Code of Conduct"},{"type":"paragraph","text":"All team members are expected to act professionally, treat others with respect, and represent Still & Social positively at all times."},{"type":"list","items":["Treat all staff, guests, and suppliers with respect","No bullying, harassment, or discrimination of any kind","Maintain confidentiality of business information","Report any concerns to management immediately","Follow all workplace health and safety procedures"]}]'::jsonb),

('Uniform & Presentation', 'uniform', 'uniform', 4,
  '[{"type":"heading","text":"Uniform Standards"},{"type":"paragraph","text":"Your presentation is part of the guest experience. Please adhere to the following standards:"},{"type":"list","items":["Clean, pressed uniform provided by the venue","Closed-toe, non-slip black shoes","Hair tied back if shoulder length or longer","Minimal jewellery — small studs only","Name badge worn at all times","No strong fragrances"]},{"type":"paragraph","text":"If you are unsure about any uniform requirements, ask your manager before your shift."}]'::jsonb),

('Leave & Time Off', 'leave', 'leave', 5,
  '[{"type":"heading","text":"Leave Entitlements"},{"type":"paragraph","text":"We understand the importance of rest and personal time. All leave is managed fairly and in line with Australian workplace law."},{"type":"list","items":["Annual Leave — as per your employment agreement","Personal/Sick Leave — notify your manager as early as possible","Shift Swaps — must be approved by management 48 hours in advance","Unavailability — submit via the rostering system at least 2 weeks ahead"]},{"type":"paragraph","text":"Unnotified absences are taken seriously. If you cannot make a shift, call (do not text) your manager as soon as possible."}]'::jsonb),

('Rostering & Availability', 'rostering', 'rostering', 6,
  '[{"type":"heading","text":"How Rostering Works"},{"type":"paragraph","text":"Rosters are published weekly. Your availability must be kept up to date in the rostering system."},{"type":"list","items":["Rosters published by Wednesday for the following week","Availability changes require 2 weeks notice","Shift swap requests must be submitted through the system","Late changes are at management discretion","Consistent reliability is valued and recognised"]}]'::jsonb),

('Health & Safety', 'health-safety', 'procedures', 7,
  '[{"type":"heading","text":"Workplace Health & Safety"},{"type":"paragraph","text":"Your safety and the safety of our guests is our top priority."},{"type":"list","items":["Report all hazards and incidents immediately","Know your emergency exits and assembly points","Follow all food safety and hygiene procedures","Use correct manual handling techniques","Never work under the influence of drugs or alcohol","First aid kits are located behind the bar and in the kitchen"]},{"type":"paragraph","text":"If you are injured at work, report it immediately and complete an incident report form."}]'::jsonb),

('Emergency Procedures', 'emergency', 'emergency', 8,
  '[{"type":"heading","text":"Emergency Procedures"},{"type":"paragraph","text":"In any emergency, the safety of people always comes first."},{"type":"list","items":["FIRE — Alert others, evacuate via nearest exit, meet at assembly point, call 000","MEDICAL — Call for first aider, do not move injured person, call 000 if serious","AGGRESSIVE GUEST — Do not engage, alert management, remove yourself from danger","ROBBERY — Comply with demands, do not resist, call police after safe to do so"]},{"type":"paragraph","text":"Emergency procedure posters are displayed in the back of house area. Familiarise yourself with them on your first shift."}]'::jsonb),

('Probation Period', 'probation', 'policies', 9,
  '[{"type":"heading","text":"Your Probation Period"},{"type":"paragraph","text":"All new team members complete a probation period (typically 3 months). During this time:"},{"type":"list","items":["You will receive structured training and support","Check-ins at 30, 60, and 90 days with your manager","Feedback is two-way — we want to hear from you too","Probation outcome: confirmed, extended, or development plan"]},{"type":"paragraph","text":"Probation is not something to stress about — it is designed to set you up for success and make sure the role is right for you."}]'::jsonb),

('Responsible Service of Alcohol', 'rsa', 'procedures', 10,
  '[{"type":"heading","text":"RSA Obligations"},{"type":"paragraph","text":"All staff serving or handling alcohol must hold a current RSA certificate."},{"type":"list","items":["Never serve an intoxicated person","Check IDs for anyone who appears under 25","Know the signs of intoxication","Offer water and food alternatives","Follow the house refusal procedure","Report any concerns to the duty manager"]},{"type":"paragraph","text":"Your RSA certificate must be kept current and a copy provided to management."}]'::jsonb),

('Feedback & Grievances', 'feedback-grievances', 'policies', 11,
  '[{"type":"heading","text":"Speaking Up"},{"type":"paragraph","text":"We want Still & Social to be a place where everyone feels heard. If you have feedback, concerns, or a grievance:"},{"type":"list","items":["Speak to your direct manager first","If uncomfortable, speak to any other manager or owner","All concerns are treated confidentially","No retaliation for raising genuine concerns","Formal grievance process available if needed"]},{"type":"paragraph","text":"We would rather know about a problem early than let it grow. Your voice matters."}]'::jsonb),

('Social Media & Confidentiality', 'social-media', 'policies', 12,
  '[{"type":"heading","text":"Social Media & Confidentiality"},{"type":"paragraph","text":"We love it when team members share their pride in working here — but please follow these guidelines:"},{"type":"list","items":["Do not share internal business information publicly","Do not post negative comments about the venue, staff, or guests","Photos of guests require their consent","Do not share rosters, sales figures, or recipes","Tag us positively — we will reshare great content!"]}]'::jsonb);
