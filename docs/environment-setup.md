---
title: "Environment Setup Guide"
description: "Complete environment configuration for family-oriented educational platform"
version: "2.0.0"
last_updated: "2024-01-15"
category: "Setup Guide"
tags: ["Environment", "Configuration", "Setup", "Supabase", "Development"]
complexity: "All Levels"
audience: ["Developers", "DevOps", "Administrators"]
---

# Environment Setup Guide

Complete environment configuration for the family-oriented educational platform with Supabase integration, analytics, and demo modes.

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd family-oriented
npm install
```

### 2. Environment Configuration
Create `.env.local` file in project root:

```bash
# Core Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Development Features
NEXT_PUBLIC_LOG_LEVEL=info
NEXT_PUBLIC_DEMO_SCENARIO=professional
NEXT_PUBLIC_DEBUG_MODE=true

# Optional: Deployment Configuration
BASE_PATH=""
```

### 3. Start Development
```bash
npm run dev           # Start Next.js development server
npm run db:start      # Start Supabase local stack (optional)
```

---

## 📋 Complete Environment Variables Reference

### 🔑 Required Variables

#### **Supabase Configuration**
```bash
# Your Supabase project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Your Supabase anon/public key (safe for client-side)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Where to find these values:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy **Project URL** and **anon public** key

### 🛠️ Optional Development Variables

#### **Logging Configuration**
```bash
# Controls console logging level in development
# Options: error, warn, info, debug
NEXT_PUBLIC_LOG_LEVEL=info
```

#### **Demo Mode Configuration**
```bash
# Enables demo data for development without authentication
# Options: personal, professional, enterprise
NEXT_PUBLIC_DEMO_SCENARIO=professional
```

#### **Debug Features**
```bash
# Enables debug panels and additional logging
# Options: true, false
NEXT_PUBLIC_DEBUG_MODE=true
```

#### **Deployment Configuration**
```bash
# Base path for deployment (GitHub Pages, subdirectories)
BASE_PATH=""

# Automatically set in CI/CD environments
GITHUB_REPOSITORY=username/repository-name
```

### 🧪 Testing Environment
For running tests, these variables are automatically set in `jest.setup.ts`:

```bash
# Test environment (automatically configured)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=test-key
```

---

## 🗂️ Environment Configuration Examples

### Development Setup (.env.local)
```bash
# Basic development configuration
NEXT_PUBLIC_SUPABASE_URL=https://abc123.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_LOG_LEVEL=debug
NEXT_PUBLIC_DEMO_SCENARIO=professional
NEXT_PUBLIC_DEBUG_MODE=true
```

### Production Setup
```bash
# Minimal production configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
NEXT_PUBLIC_LOG_LEVEL=error
```

### Demo/Preview Setup
```bash
# Demo environment without database
NEXT_PUBLIC_DEMO_SCENARIO=enterprise
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_LOG_LEVEL=info
```

---

## 🏗️ Local Development with Supabase

### Option 1: Cloud Supabase (Recommended)
1. Create free account at [supabase.com](https://supabase.com)
2. Create new project
3. Copy environment variables from Settings → API
4. Run database migrations: `npm run db:migrate` (if available)

### Option 2: Local Supabase Stack
```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase stack
supabase start

# Your local environment variables:
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Apply migrations
supabase db reset
```

**Local Supabase Services:**
- **API Gateway**: http://127.0.0.1:54321
- **Studio (Dashboard)**: http://127.0.0.1:54323
- **Database**: postgresql://postgres:postgres@127.0.0.1:54322/postgres
- **Email Testing**: http://127.0.0.1:54324

---

## 🎯 Demo Mode Configuration

The app includes comprehensive demo modes for development and testing without requiring user authentication.

### Demo Scenarios

#### **Personal Tier Demo**
```bash
NEXT_PUBLIC_DEMO_SCENARIO=personal
```
- 5 avatars limit
- Basic analytics
- Personal plan features

#### **Professional Tier Demo**
```bash
NEXT_PUBLIC_DEMO_SCENARIO=professional
```
- 30 avatars limit
- Advanced analytics
- User management features
- Premium themes

#### **Enterprise Tier Demo**
```bash
NEXT_PUBLIC_DEMO_SCENARIO=enterprise
```
- Unlimited avatars
- Full feature access
- Custom branding
- API access

### Demo Data Includes:
- Pre-populated avatars with themes
- Sample analytics data
- Realistic usage metrics
- All subscription features enabled

---

## 🔍 Debugging and Development

### Debug Panel Access
When `NEXT_PUBLIC_DEBUG_MODE=true`, access debug information at:
- **Dashboard**: Debug panel shows environment status
- **Console**: Enhanced logging with user context
- **Network**: Supabase connection status

### Environment Validation
The app automatically validates environment variables on startup:

```typescript
// Validates required variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn('Supabase URL not configured - using demo mode');
}
```

### Troubleshooting Common Issues

#### **"No Supabase configuration" Error**
- ✅ Check `.env.local` file exists in project root
- ✅ Verify `NEXT_PUBLIC_SUPABASE_URL` is set
- ✅ Restart development server: `npm run dev`

#### **Authentication Issues**
- ✅ Verify anon key is correct and matches your Supabase project
- ✅ Check Supabase project URL format: `https://xxx.supabase.co`
- ✅ Ensure RLS policies are configured (see database migrations)

#### **Demo Mode Not Working**
- ✅ Check `NEXT_PUBLIC_DEMO_SCENARIO` is set to valid value
- ✅ Clear browser localStorage and refresh
- ✅ Verify console for demo data loading messages

---

## 🚀 Deployment Configuration

### Vercel Deployment
Add environment variables in Vercel dashboard:
1. Go to project settings
2. Add Environment Variables
3. Include required Supabase variables

### GitHub Actions / CI/CD
Set secrets in repository settings:
```yaml
# .github/workflows/deploy.yml
env:
  NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

### Docker Deployment
```dockerfile
# Pass environment variables at runtime
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
```

---

## 📊 Environment Status Validation

### Runtime Checks
The application performs these validation checks:

```typescript
// Environment validation at startup
const environmentStatus = {
  supabaseConfigured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  demoMode: !!process.env.NEXT_PUBLIC_DEMO_SCENARIO,
  debugMode: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
  logLevel: process.env.NEXT_PUBLIC_LOG_LEVEL || 'info'
};
```

### Health Check Endpoints
When properly configured, these features are available:
- ✅ User authentication and profiles
- ✅ Avatar creation and management
- ✅ Game progress analytics
- ✅ Subscription tier features
- ✅ Real-time data synchronization

---

## 📚 Additional Resources

### Supabase Documentation
- [Getting Started](https://supabase.com/docs/guides/getting-started)
- [Local Development](https://supabase.com/docs/guides/local-development)
- [Environment Variables](https://supabase.com/docs/guides/local-development/cli/config)

### Project Documentation
- [`development.md`](./development.md) - Development guidelines
- [`technical-reference.md`](./technical-reference.md) - Architecture details
- [`quick-reference.md`](./quick-reference.md) - Fast setup guide

### Support
- Check existing [GitHub Issues](../issues)
- Review [troubleshooting section](#troubleshooting-common-issues)
- Validate environment with debug mode enabled

---

**💡 Quick Tip**: For immediate development without Supabase setup, set `NEXT_PUBLIC_DEMO_SCENARIO=professional` to use demo mode with full features enabled. 