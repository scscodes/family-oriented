-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Subscription Plans (Your Pricing Model)
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  tier TEXT CHECK (tier IN ('personal', 'professional', 'enterprise')) NOT NULL,
  duration_months INTEGER NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  avatar_limit INTEGER NOT NULL,
  basic_themes_included BOOLEAN DEFAULT true,
  premium_themes_included BOOLEAN DEFAULT false,
  custom_branding_included BOOLEAN DEFAULT false,
  features_included JSONB DEFAULT '{}',
  addon_discount_percent DECIMAL(5,2) DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organizations (Enterprise Support)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subscription_plan_id UUID REFERENCES subscription_plans(id),
  billing_address JSONB,
  tax_id TEXT,
  contact_info JSONB,
  trial_ends_at TIMESTAMPTZ,
  status TEXT CHECK (status IN ('active', 'trial', 'suspended', 'cancelled')) DEFAULT 'trial',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  timezone TEXT DEFAULT 'UTC',
  locale TEXT DEFAULT 'en-US',
  org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  account_type TEXT CHECK (account_type IN ('personal', 'organization_admin', 'organization_member')) DEFAULT 'personal',
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Avatars (Child Profiles)
CREATE TABLE avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  encrypted_pii JSONB,
  theme_settings JSONB DEFAULT '{}',
  game_preferences JSONB DEFAULT '{}',
  last_active TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game Sessions (Analytics - Summary Data)
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  avatar_id UUID NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  session_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_end TIMESTAMPTZ,
  total_duration INTEGER,
  questions_attempted INTEGER DEFAULT 0,
  questions_correct INTEGER DEFAULT 0,
  completion_status TEXT CHECK (completion_status IN ('completed', 'abandoned', 'in_progress')) DEFAULT 'in_progress',
  difficulty_level TEXT NOT NULL DEFAULT 'beginner',
  settings_used JSONB,
  score_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game Events (Analytics - Detailed Tracking)
CREATE TABLE game_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  avatar_id UUID NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'game_start', 'game_complete', 'game_abandon', 'game_pause', 'game_resume',
    'question_start', 'question_answer', 'hint_used', 'difficulty_change'
  )),
  event_data JSONB NOT NULL DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sequence_number INTEGER NOT NULL
);

-- Learning Progress (Tier-aware Processing)
CREATE TABLE learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  avatar_id UUID NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  skill_level TEXT NOT NULL DEFAULT 'beginner',
  mastery_score NUMERIC(5,2) DEFAULT 0,
  learning_objectives_met TEXT[] DEFAULT '{}',
  prerequisite_completion JSONB DEFAULT '{}',
  last_played TIMESTAMPTZ NOT NULL,
  total_sessions INTEGER DEFAULT 0,
  average_performance NUMERIC(5,2) DEFAULT 0,
  improvement_trend TEXT CHECK (improvement_trend IN ('improving', 'stable', 'declining')) DEFAULT 'stable',
  needs_realtime_update BOOLEAN DEFAULT true,
  last_processed TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(avatar_id, game_type)
);

-- Theme Catalog (Commerce Integration)
CREATE TABLE theme_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  preview_image_url TEXT,
  tier_required TEXT CHECK (tier_required IN ('personal', 'professional', 'enterprise')) DEFAULT 'personal',
  is_premium BOOLEAN DEFAULT false,
  is_custom_brandable BOOLEAN DEFAULT false,
  color_config JSONB NOT NULL,
  asset_urls JSONB DEFAULT '{}',
  base_price_monthly DECIMAL(10,2) DEFAULT 0,
  base_price_yearly DECIMAL(10,2) DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permission Policies (Hierarchical Control System)
CREATE TABLE permission_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  permission_scope TEXT CHECK (permission_scope IN (
    'avatar_preferences', 'game_collections', 'theme_selection', 
    'game_settings', 'data_sharing', 'social_features'
  )) NOT NULL,
  default_value JSONB DEFAULT '{}',
  allowed_values JSONB DEFAULT '{}',
  is_restrictive BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization Policies (Microsoft-style Management)
CREATE TABLE organization_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  policy_id UUID NOT NULL REFERENCES permission_policies(id) ON DELETE CASCADE,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  override_value JSONB DEFAULT '{}',
  enforcement_level TEXT CHECK (enforcement_level IN ('advisory', 'enforced', 'locked')) DEFAULT 'enforced',
  restriction_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, policy_id)
);

-- User Policies (Account-level Controls)
CREATE TABLE user_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  policy_id UUID NOT NULL REFERENCES permission_policies(id) ON DELETE CASCADE,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  user_value JSONB DEFAULT '{}',
  allow_avatar_override BOOLEAN DEFAULT true,
  restriction_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, policy_id)
);

-- Avatar Permissions (Final Effective Settings)
CREATE TABLE avatar_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  avatar_id UUID NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
  policy_id UUID NOT NULL REFERENCES permission_policies(id) ON DELETE CASCADE,
  avatar_value JSONB DEFAULT '{}',
  effective_value JSONB DEFAULT '{}',
  is_restricted BOOLEAN DEFAULT false,
  restriction_source TEXT CHECK (restriction_source IN ('organization', 'user', 'none')) DEFAULT 'none',
  restriction_message TEXT,
  last_computed TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(avatar_id, policy_id)
);

-- Game Collections (with Permission Integration)
CREATE TABLE game_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  avatar_id UUID NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  game_ids TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  collection_type TEXT CHECK (collection_type IN ('personal', 'shared', 'template', 'classroom')) DEFAULT 'personal',
  share_scope TEXT CHECK (share_scope IN ('private', 'organization', 'public')) DEFAULT 'private',
  is_editable BOOLEAN DEFAULT true,
  is_deletable BOOLEAN DEFAULT true,
  can_be_copied BOOLEAN DEFAULT true,
  shared_at TIMESTAMPTZ,
  shared_by_user_id UUID REFERENCES users(id),
  collaborator_user_ids UUID[] DEFAULT '{}',
  play_count INTEGER DEFAULT 0,
  last_played TIMESTAMPTZ,
  scheduled_sessions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX idx_game_sessions_avatar_game ON game_sessions(avatar_id, game_type);
CREATE INDEX idx_game_sessions_org_created ON game_sessions(org_id, created_at);
CREATE INDEX idx_game_events_session_sequence ON game_events(session_id, sequence_number);
CREATE INDEX idx_learning_progress_avatar ON learning_progress(avatar_id);
CREATE INDEX idx_learning_progress_realtime ON learning_progress(needs_realtime_update) WHERE needs_realtime_update = true;
CREATE INDEX idx_avatars_user ON avatars(user_id);
CREATE INDEX idx_game_collections_avatar ON game_collections(avatar_id, collection_type);

-- Seed Data
INSERT INTO subscription_plans (name, tier, duration_months, base_price, avatar_limit, premium_themes_included, custom_branding_included) VALUES
('Personal 1-Month', 'personal', 1, 9.99, 5, false, false),
('Personal 6-Month', 'personal', 6, 49.99, 5, false, false),
('Personal 12-Month', 'personal', 12, 89.99, 5, false, false),
('Professional 12-Month', 'professional', 12, 199.99, 30, true, false),
('Professional 24-Month', 'professional', 24, 349.99, 30, true, false),
('Enterprise 36-Month', 'enterprise', 36, 1499.99, 100, true, true),
('Enterprise 60-Month', 'enterprise', 60, 2199.99, 100, true, true);

INSERT INTO theme_catalog (name, display_name, description, tier_required, is_premium, color_config) VALUES
('purple', 'Purple Dreams', 'Dreamy purple gradient theme', 'personal', false, '{"primary": "#667eea", "secondary": "#764ba2", "accent": "#9c88ff"}'),
('ocean', 'Ocean Breeze', 'Calming ocean blue theme', 'personal', false, '{"primary": "#00b4db", "secondary": "#0083b0", "accent": "#4dd0e1"}'),
('forest', 'Forest Green', 'Natural forest green theme', 'personal', false, '{"primary": "#56ab2f", "secondary": "#a8e6cf", "accent": "#88d8a3"}'),
('sunset', 'Sunset Glow', 'Warm sunset orange theme', 'personal', false, '{"primary": "#ff7e5f", "secondary": "#feb47b", "accent": "#ff9a9e"}'),
('galaxy', 'Galaxy Explorer', 'Space-themed premium theme', 'professional', true, '{"primary": "#4c1d95", "secondary": "#7c3aed", "accent": "#a855f7"}'),
('rainbow', 'Rainbow Magic', 'Colorful rainbow premium theme', 'professional', true, '{"primary": "#ec4899", "secondary": "#f59e0b", "accent": "#10b981"}');

INSERT INTO permission_policies (policy_name, display_name, description, permission_scope, default_value, allowed_values) VALUES
('collection_creation', 'Create Collections', 'Allow avatars to create game collections', 'game_collections', 
 '{"enabled": true, "max_collections": 10}', 
 '{"enabled": [true, false], "max_collections": [5, 10, 25, 50, -1]}'),
('theme_selection', 'Theme Selection', 'Allow avatars to change themes', 'theme_selection',
 '{"enabled": true, "premium_themes": false}',
 '{"enabled": [true, false], "premium_themes": [true, false]}'),
('game_settings', 'Game Settings', 'Allow avatars to modify game settings', 'game_settings',
 '{"enabled": true, "difficulty_override": true, "time_limits": true}',
 '{"enabled": [true, false], "difficulty_override": [true, false], "time_limits": [true, false]}');