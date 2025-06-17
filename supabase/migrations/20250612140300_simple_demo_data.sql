-- Simple demo data migration for analytics testing
-- Only creates demo user profile and avatars without auth.users complexity

-- Insert demo user profile into users table
-- Note: This assumes the demo user ID exists or we'll handle it in the app
INSERT INTO users (
  id,
  email,
  first_name,
  last_name,
  phone,
  timezone,
  locale,
  org_id,
  account_type,
  last_login,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo@example.com',
  'Demo',
  'User',
  NULL,
  'UTC',
  'en-US',
  NULL,
  'personal',
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  updated_at = NOW();

-- Insert demo avatars into avatars table
INSERT INTO avatars (
  id,
  user_id,
  org_id,
  name,
  encrypted_pii,
  theme_settings,
  game_preferences,
  last_active,
  created_at,
  updated_at
) VALUES 
-- Avatar 1: My Child (steady improvement, beginner)
(
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  NULL,
  'My Child',
  NULL,
  '{}',
  '{}',
  NOW(),
  NOW(),
  NOW()
),
-- Avatar 2: Quick Learner (high performer, advanced)
(
  '00000000-0000-0000-0000-000000000012',
  '00000000-0000-0000-0000-000000000001',
  NULL,
  'Quick Learner',
  NULL,
  '{}',
  '{}',
  NOW(),
  NOW(),
  NOW()
),
-- Avatar 3: Struggling Student (needs support, beginner)
(
  '00000000-0000-0000-0000-000000000013',
  '00000000-0000-0000-0000-000000000001',
  NULL,
  'Struggling Student',
  NULL,
  '{}',
  '{}',
  NOW(),
  NOW(),
  NOW()
),
-- Avatar 4: Consistent Player (steady progression, intermediate)
(
  '00000000-0000-0000-0000-000000000014',
  '00000000-0000-0000-0000-000000000001',
  NULL,
  'Consistent Player',
  NULL,
  '{}',
  '{}',
  NOW(),
  NOW(),
  NOW()
),
-- Avatar 5: Math Enthusiast (subject-focused, intermediate)
(
  '00000000-0000-0000-0000-000000000015',
  '00000000-0000-0000-0000-000000000001',
  NULL,
  'Math Enthusiast',
  NULL,
  '{}',
  '{}',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW(); 