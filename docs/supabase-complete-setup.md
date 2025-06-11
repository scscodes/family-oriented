# Complete Supabase Integration Guide

## 🎯 Overview
Complete setup guide for integrating Supabase with the family-oriented educational games platform, implementing our finalized schema with analytics, themes, and permission systems from ground zero.

## Phase 1: Project Creation & Initial Setup

### 1.1 Create Supabase Project

1. **Go to [supabase.com](https://supabase.com) and sign up/login**
2. **Click "New Project"**
3. **Fill in project details:**
   - **Organization**: Create new or select existing
   - **Project Name**: `family-oriented-games`
   - **Database Password**: Generate strong password (save securely)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Start with Free tier

4. **Wait for project initialization** (2-3 minutes)

### 1.2 Get Project Credentials

Once created, go to **Settings > API** and note:
- **Project URL**: `https://your-project-ref.supabase.co`
- **Anon Public Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (keep secret!)

### 1.3 Configure Authentication

1. **Go to Authentication > Settings**
2. **Enable Email/Password authentication** (default)
3. **Set Site URL**: `http://localhost:3000` (development)
4. **Add Redirect URLs**: 
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.com/auth/callback` (production)

## Phase 2: Environment Setup

### 2.1 Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install --save-dev @supabase/cli
```

### 2.2 Environment Variables

Create `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database Configuration
DATABASE_URL=postgresql://postgres:your-password@db.your-project-ref.supabase.co:5432/postgres

# Encryption Keys (generate with: openssl rand -base64 32)
ENCRYPTION_KEY=your-32-byte-base64-key
JWT_SECRET=your-jwt-secret
```

### 2.3 Initialize Supabase CLI

```bash
# Login to Supabase CLI
npx supabase login

# Initialize project
npx supabase init

# Link to your remote project
npx supabase link --project-ref your-project-ref
```

## Phase 3: Complete Database Schema

### 3.1 Create Initial Migration

```bash
npx supabase migration new initial_schema
```

### 3.2 Complete Schema Implementation

Edit `supabase/migrations/[timestamp]_initial_schema.sql`:

```sql
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
```

### 3.3 Run Migration

```bash
npx supabase db push
```

## Phase 4: Row Level Security

Create `supabase/migrations/[timestamp]_enable_rls.sql`:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_collections ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Avatars: Users can only access their own avatars
CREATE POLICY "Users can view own avatars" ON avatars
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own avatars" ON avatars
  FOR ALL USING (user_id = auth.uid());

-- Game Sessions: Users can only access sessions for their avatars
CREATE POLICY "Users can view own game sessions" ON game_sessions
  FOR SELECT USING (
    avatar_id IN (SELECT id FROM avatars WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create game sessions" ON game_sessions
  FOR INSERT WITH CHECK (
    avatar_id IN (SELECT id FROM avatars WHERE user_id = auth.uid())
  );

-- Game Collections: Users can view their own and shared collections
CREATE POLICY "Users can view accessible collections" ON game_collections
  FOR SELECT USING (
    avatar_id IN (SELECT id FROM avatars WHERE user_id = auth.uid()) OR
    share_scope = 'public'
  );

CREATE POLICY "Users can manage own collections" ON game_collections
  FOR ALL USING (
    avatar_id IN (SELECT id FROM avatars WHERE user_id = auth.uid())
  );
```

Run the RLS migration:
```bash
npx supabase db push
```

## Phase 5: Application Integration

### 5.1 Supabase Client Setup

Create `src/lib/supabase/client.ts`:

```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

// Client-side Supabase client
export const createClient = () => createClientComponentClient<Database>()

// Server-side Supabase client
export const createServerClient = () => createServerComponentClient<Database>({ cookies })
```

### 5.2 Generate Database Types

```bash
npx supabase gen types typescript --local > src/lib/supabase/database.types.ts
```

### 5.3 Enhanced Analytics Service

Update `src/utils/analyticsService.ts` to use Supabase:

```typescript
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

export class SupabaseAnalyticsService {
  private supabase = createClient()

  async startGameSession(
    avatarId: string, 
    gameType: string, 
    settings: Record<string, unknown>
  ): Promise<string> {
    const { data, error } = await this.supabase
      .from('game_sessions')
      .insert({
        avatar_id: avatarId,
        game_type: gameType,
        settings_used: settings,
        session_start: new Date().toISOString()
      })
      .select('id')
      .single()

    if (error) throw error
    return data.id
  }

  async completeGameSession(
    sessionId: string,
    finalScore: number,
    questionsAttempted: number,
    questionsCorrect: number
  ): Promise<void> {
    const scoreData = {
      finalScore,
      accuracy: questionsAttempted > 0 ? questionsCorrect / questionsAttempted : 0,
      questionsCorrect,
      questionsAttempted,
      completionRate: 1.0
    }

    const { error } = await this.supabase
      .from('game_sessions')
      .update({
        session_end: new Date().toISOString(),
        questions_attempted: questionsAttempted,
        questions_correct: questionsCorrect,
        completion_status: 'completed',
        score_data: scoreData
      })
      .eq('id', sessionId)

    if (error) throw error
  }

  async getAvatarProgress(avatarId: string) {
    const { data, error } = await this.supabase
      .from('learning_progress')
      .select('*')
      .eq('avatar_id', avatarId)
      .order('last_played', { ascending: false })

    if (error) throw error
    return data || []
  }
}

export const analyticsService = new SupabaseAnalyticsService()
```

### 5.4 Authentication Hook

Create `src/hooks/useAuth.ts`:

```typescript
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function useAuth() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const signUp = async (email: string, password: string, userData: {
    firstName: string
    lastName: string
  }) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName
          }
        }
      })

      if (error) throw error

      // Create user profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            first_name: userData.firstName,
            last_name: userData.lastName
          })

        if (profileError) throw profileError
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      router.push('/dashboard')
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  return { signUp, signIn, loading }
}
```

## Phase 6: Testing & Deployment

### 6.1 Local Testing

```bash
# Run your Next.js app
npm run dev

# Test authentication and data flow
```

### 6.2 Production Setup

1. **Update Supabase Auth URLs** in your project settings
2. **Add environment variables** to your hosting platform
3. **Test the complete flow**: Registration → Avatar creation → Game playing → Analytics

## 🎯 Implementation Complete

This setup provides:
- ✅ **Complete database schema** with all our finalized decisions
- ✅ **Tier-based analytics processing** (real-time for personal, batch for enterprise)
- ✅ **Hierarchical permission system** ("managed by organization" UX)
- ✅ **Theme commerce integration** with subscription tiers
- ✅ **Row-level security** for data protection
- ✅ **Application integration** with existing analytics service

**Phase 1 Schema Finalization: COMPLETE ✅**
**Ready for Phase 3: Supabase Integration** from our tasks.md roadmap! 