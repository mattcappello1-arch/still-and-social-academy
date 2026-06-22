INSERT INTO academy_role_training_paths (role, path_id, is_required, sort_order) VALUES
-- Everyone gets Welcome to Still & Social
('waiter', 'c6bbf010-551d-4653-a725-928d5e98f5a9', true, 1),
('restaurant_all_rounder', 'c6bbf010-551d-4653-a725-928d5e98f5a9', true, 1),
('bartender', 'c6bbf010-551d-4653-a725-928d5e98f5a9', true, 1),
('kitchen_hand', 'c6bbf010-551d-4653-a725-928d5e98f5a9', true, 1),
('entree_chef', 'c6bbf010-551d-4653-a725-928d5e98f5a9', true, 1),
('wok_chef', 'c6bbf010-551d-4653-a725-928d5e98f5a9', true, 1),
('curries_chef', 'c6bbf010-551d-4653-a725-928d5e98f5a9', true, 1),
('expo_chef', 'c6bbf010-551d-4653-a725-928d5e98f5a9', true, 1),
('supervisor', 'c6bbf010-551d-4653-a725-928d5e98f5a9', true, 1),
('manager', 'c6bbf010-551d-4653-a725-928d5e98f5a9', true, 1),
-- FOH roles get Sequence of Service
('waiter', '407fbb58-d38c-4f2d-9a33-395b388778f3', true, 2),
('restaurant_all_rounder', '407fbb58-d38c-4f2d-9a33-395b388778f3', true, 2),
('bartender', '407fbb58-d38c-4f2d-9a33-395b388778f3', true, 2),
-- Role-specific FOH
('waiter', 'df650b24-3e74-4148-b2ac-874299a621b9', true, 3),
('restaurant_all_rounder', '5aed9b32-4e84-4ba6-a2af-574972f7c730', true, 3),
('bartender', '6eddec72-3a9d-40ad-8e5c-3f5fe59e12a7', true, 3),
-- Kitchen roles get General Kitchen Training
('kitchen_hand', 'ed1a7e46-afc4-4eba-856b-646c75c1be4c', true, 2),
('entree_chef', 'ed1a7e46-afc4-4eba-856b-646c75c1be4c', true, 2),
('wok_chef', 'ed1a7e46-afc4-4eba-856b-646c75c1be4c', true, 2),
('curries_chef', 'ed1a7e46-afc4-4eba-856b-646c75c1be4c', true, 2),
('expo_chef', 'ed1a7e46-afc4-4eba-856b-646c75c1be4c', true, 2),
-- Role-specific Kitchen
('kitchen_hand', '24990561-b9db-43ff-b94e-1436dec94fa7', true, 3),
('entree_chef', 'addfcc87-e079-43e7-8da3-70aa50aded0e', true, 3),
('wok_chef', '0c4257ec-a61b-4deb-9e1e-b3b5057ac439', true, 3),
('curries_chef', 'a6edca0f-d955-498a-918a-4178c991ab57', true, 3),
('expo_chef', 'ab6f6c70-9b5d-4126-89b9-53807d1957d8', true, 3),
-- Leadership
('supervisor', '7af19cb2-1309-4be8-b475-f7ab6ffa66d2', true, 2),
('manager', '33a8ebd9-f01a-4e18-b4cf-09765ee4f1a5', true, 2),
-- Supervisors also get FOH sequence
('supervisor', '407fbb58-d38c-4f2d-9a33-395b388778f3', true, 3),
-- Managers also get supervisor training
('manager', '7af19cb2-1309-4be8-b475-f7ab6ffa66d2', true, 3)
ON CONFLICT (role, path_id) DO NOTHING;
