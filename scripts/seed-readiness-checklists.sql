-- Default shift readiness checklist templates (stored as reference, actual checklists created per staff)
-- These define what items each role needs to complete

-- We'll create a reference table entry for default checklists per role
-- For now, seed the checklist items directly into the existing staff records

-- Seed default readiness items for Matt (manager) as an example
INSERT INTO academy_shift_readiness (staff_id, role, checklist_items, is_shift_ready)
SELECT s.id, s.role, 
  CASE 
    WHEN s.role IN ('waiter', 'restaurant_all_rounder') THEN 
      '[{"item":"Sequence of Service","done":false},{"item":"Menu Knowledge","done":false},{"item":"POS Training","done":false},{"item":"Shadow Shift","done":false},{"item":"Practical Assessment","done":false},{"item":"Manager Sign Off","done":false}]'::jsonb
    WHEN s.role = 'bartender' THEN
      '[{"item":"Bar Setup & Closing","done":false},{"item":"Cocktail Menu Knowledge","done":false},{"item":"Wine List Knowledge","done":false},{"item":"RSA Certification","done":false},{"item":"POS Training","done":false},{"item":"Shadow Shift","done":false},{"item":"Practical Assessment","done":false},{"item":"Manager Sign Off","done":false}]'::jsonb
    WHEN s.role IN ('kitchen_hand', 'entree_chef', 'wok_chef', 'curries_chef', 'expo_chef') THEN
      '[{"item":"Kitchen Safety Induction","done":false},{"item":"Food Safety Training","done":false},{"item":"Station Setup Knowledge","done":false},{"item":"Recipe Familiarity","done":false},{"item":"Shadow Shift","done":false},{"item":"Practical Assessment","done":false},{"item":"Manager Sign Off","done":false}]'::jsonb
    WHEN s.role IN ('supervisor', 'manager') THEN
      '[{"item":"All FOH Training Complete","done":false},{"item":"Opening Procedures","done":false},{"item":"Closing Procedures","done":false},{"item":"Cash Up Procedures","done":false},{"item":"Emergency Procedures","done":false},{"item":"Team Management Training","done":false},{"item":"Manager Sign Off","done":false}]'::jsonb
    ELSE '[]'::jsonb
  END,
  false
FROM academy_staff s
WHERE s.status = 'active'
ON CONFLICT (staff_id, role) DO NOTHING;
