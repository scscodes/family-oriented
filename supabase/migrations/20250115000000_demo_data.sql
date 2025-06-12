-- Demo data for development and testing
-- This migration creates a demo user and avatars in the database
-- to support analytics testing without auth dependency

-- Insert demo user into auth.users (if not exists)
-- Note: This bypasses normal Supabase auth flow for testing purposes
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'demo@example.com',
  crypt('demo-password-123', gen_salt('bf')),
  NOW(),
  NULL,
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "Demo", "last_name": "User"}',
  false,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Insert demo user profile into users table
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
) ON CONFLICT (id) DO NOTHING;

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
ON CONFLICT (id) DO NOTHING; 