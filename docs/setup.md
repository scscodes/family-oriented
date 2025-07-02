---
title: "Setup & Troubleshooting Guide"
description: "Complete environment setup and issue resolution guide"
version: "2.1.0"
last_updated: "2025-07-02"
category: "Setup Guide"
tags: ["Setup", "Environment", "Troubleshooting", "Configuration", "Issues", "User Management", "Security"]
complexity: "All Levels"
audience: ["Developers", "DevOps", "QA Engineers", "System Administrators"]
---

# 🚀 Setup & Troubleshooting Guide

Complete environment configuration and issue resolution for the family-oriented educational platform.

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
npm run lint          # Check code style
npm run build         # Validate production build
npm test              # Run test suite
```

---

## 📋 Environment Variables Reference

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
4. Run database migrations: `supabase db push`

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
- All premium features
- Advanced reporting
- API access simulation

### Demo Features
- **Realistic Data**: Pre-populated games, analytics, user profiles
- **Role Simulation**: Account owner, admin, educator roles
- **Feature Testing**: All subscription tiers and feature gates
- **No Authentication**: Works without Supabase connection

---

## 🗄️ Database Schema & User Management

### Core Tables

The platform includes a comprehensive database schema supporting enterprise-grade user management:

#### `user_invitations`
Stores organization member invitations with secure token-based system.

```sql
CREATE TABLE user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  roles TEXT[] DEFAULT '{}',
  status TEXT CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')) DEFAULT 'pending',
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `audit_logs`
Comprehensive audit trail for all user management actions.

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `rate_limits`
Tracks API usage and implements rate limiting.

```sql
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  identifier_type TEXT NOT NULL CHECK (identifier_type IN ('email', 'ip', 'user_id')),
  action_type TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(identifier, identifier_type, action_type, window_start)
);
```

### Database Functions

#### Token Generation
```sql
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Audit Logging
```sql
CREATE OR REPLACE FUNCTION log_audit_event(
  p_org_id UUID,
  p_user_id UUID,
  p_action_type TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
-- Implementation details...
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Rate Limiting
```sql
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier TEXT,
  p_identifier_type TEXT,
  p_action_type TEXT,
  p_window_minutes INTEGER DEFAULT 60,
  p_max_attempts INTEGER DEFAULT 10
)
RETURNS BOOLEAN AS $$
-- Implementation details...
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Row Level Security (RLS)

All tables implement Row Level Security with appropriate policies:

- **User Invitations**: Organization admins can manage invitations for their org
- **Audit Logs**: Organization admins can view audit logs for their org
- **Rate Limits**: System can manage rate limits (no auth check)

---

## 🔧 Services & API

### User Management Services

The platform includes comprehensive services for user management:

#### Invitation Service (`src/utils/invitationService.ts`)
Handles user invitations with secure token generation and email integration.

```typescript
import { invitationService } from '@/utils/invitationService';

// Create invitation
const result = await invitationService.createInvitation({
  orgId: 'org-123',
  email: 'user@example.com',
  invitedBy: 'admin-user-id',
  roles: ['member'],
  message: 'Welcome to our organization!',
  expiresInHours: 72
});

// Accept invitation
const acceptResult = await invitationService.acceptInvitation({
  token: 'invitation-token',
  userId: 'new-user-id',
  firstName: 'John',
  lastName: 'Doe'
});
```

#### Audit Service (`src/utils/auditService.ts`)
Provides comprehensive audit logging for compliance and security.

```typescript
import { auditService, auditEvents } from '@/utils/auditService';

// Log custom audit event
await auditService.logEvent({
  orgId: 'org-123',
  userId: 'user-456',
  actionType: 'user_invited',
  resourceType: 'user_invitation',
  resourceId: 'invitation-789',
  newValues: { email: 'user@example.com' }
});

// Use convenience functions
await auditEvents.userInvited({
  orgId: 'org-123',
  userId: 'admin-id',
  resourceId: 'invitation-id',
  newValues: { email: 'user@example.com' }
});
```

#### Security Service (`src/utils/securityService.ts`)
Implements security measures including rate limiting and activity detection.

```typescript
import { securityService, securityChecks } from '@/utils/securityService';

// Check rate limit
const rateLimit = await securityService.checkRateLimit(
  'user@example.com',
  'email',
  'login'
);

// Detect suspicious activity
const suspicious = await securityService.detectSuspiciousActivity(
  'user@example.com',
  'email',
  'login_failed',
  { ipAddress: '192.168.1.1' }
);
```

#### User Management Service (`src/utils/userManagementService.ts`)
High-level user management operations with integrated security and audit.

```typescript
import { userManagementService } from '@/utils/userManagementService';

// Create user
const userResult = await userManagementService.createUser({
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  orgId: 'org-123',
  accountType: 'organization_member'
});

// Bulk invite users
const bulkResult = await userManagementService.bulkInviteUsers(
  ['user1@example.com', 'user2@example.com'],
  'org-123',
  'admin-user-id',
  ['member'],
  'Welcome to our organization!'
);
```

---

## 🔒 Security Features

### Rate Limiting

Configurable rate limits for different actions:

```typescript
const defaultRateLimits = {
  login: { windowMinutes: 15, maxAttempts: 5 },
  invitation: { windowMinutes: 60, maxAttempts: 10 },
  registration: { windowMinutes: 60, maxAttempts: 3 },
  password_reset: { windowMinutes: 60, maxAttempts: 3 },
  api_request: { windowMinutes: 1, maxAttempts: 100 }
};
```

### Input Validation

Comprehensive input validation for all user data:

```typescript
// Email validation
const emailValidation = securityChecks.validateEmail('user@example.com');

// Name validation
const nameValidation = securityChecks.validateName('John Doe');

// Phone validation
const phoneValidation = securityChecks.validatePhone('+1234567890');
```

### Suspicious Activity Detection

Automated detection of:
- High-frequency actions
- Multiple failed login attempts
- Unusual IP patterns
- Off-hours activity

### Audit Trail

The system maintains comprehensive audit logs for all user actions:

```typescript
type AuditActionType = 
  | 'user_invited' | 'user_accepted_invitation' | 'user_declined_invitation'
  | 'user_role_changed' | 'user_removed' | 'user_suspended' | 'user_reactivated'
  | 'invitation_expired' | 'invitation_cancelled' | 'invitation_resent'
  | 'login_attempt' | 'login_success' | 'login_failed' | 'logout'
  | 'password_changed' | 'password_reset' | 'email_changed'
  | 'organization_created' | 'organization_updated' | 'organization_deleted'
  | 'subscription_changed' | 'billing_updated' | 'policy_changed'
  | 'avatar_created' | 'avatar_updated' | 'avatar_deleted'
  | 'game_session_started' | 'game_session_completed' | 'game_session_abandoned'
  | 'data_exported' | 'data_imported' | 'settings_changed';
```

---

## 🧪 Testing Setup

### Running Tests
```bash
npm test                               # Run Jest test suite
npm run test:watch                     # Watch mode for development
npm run test:coverage                  # Generate coverage report
npm run test:ci                        # CI/CD optimized run
```

### Test Environment
The testing environment is automatically configured with:
- **Mocked Supabase**: Local test environment
- **Mocked localStorage**: Consistent test storage
- **Enhanced Safety**: Timeout protection and cleanup
- **Modular Utilities**: Restructured test helper functions

### Test Utilities Structure
```bash
src/utils/__tests__/
├── index.ts                 # Barrel exports
├── test-constants.ts        # Timeouts and constants
├── test-factories.ts        # Mock data creation
├── test-helpers.ts          # Async utilities
├── react-test-utils.tsx     # React testing utilities
├── mock-services.ts         # Service mocks
├── invitationService.test.ts # Invitation service tests
├── auditService.test.ts     # Audit service tests
├── securityService.test.ts  # Security service tests
└── userManagementService.test.ts # User management tests
```

### User Management Test Coverage
- Invitation service functionality
- Security validation and rate limiting
- Audit logging and retrieval
- User management operations
- Integration scenarios

---

## 🚨 Troubleshooting Guide

### Common Issues & Solutions

#### **Issue: Hydration Mismatch Errors**

**Symptoms**:
```
Error: Hydration failed because the initial UI does not match what was rendered on the server
```

**Root Cause**: Context providers initializing at different times causing server/client render mismatches.

**Solution**: Use hydration coordination pattern
```tsx
// Check if all contexts are ready before rendering
function useIsFullyHydrated() {
  const { isHydrated: themeHydrated } = useEnhancedTheme();
  const { loadingState } = useUser();
  
  return themeHydrated && loadingState.isReady;
}

// Apply to components with context dependencies
function NavigationBar() {
  const isFullyHydrated = useIsFullyHydrated();
  
  if (!isFullyHydrated) {
    return <LoadingSkeleton />; // Consistent skeleton
  }
  
  return <ActualNavigation />; // Render when stable
}
```

#### **Issue: Grid Component TypeScript Errors**

**Symptoms**:
```typescript
Property 'item' does not exist on type 'IntrinsicAttributes & GridBaseProps'
```

**Root Cause**: Material-UI Grid component compatibility issues with Next.js 15.2.4+ and TypeScript strict mode.

**Solution**: Replace all Grid usage with CSS Grid
```tsx
// ❌ PROBLEMATIC: Material-UI Grid
<Grid container spacing={3}>
  <Grid item xs={12} md={6}>
    <Card>Content</Card>
  </Grid>
</Grid>

// ✅ SOLUTION: CSS Grid with Box
<Box sx={{ 
  display: 'grid', 
  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
  gap: 3 
}}>
  <Card>Content</Card>
  <Card>Content</Card>
</Box>
```

#### **Issue: Test Import Errors**

**Symptoms**:
```typescript
Module not found: Can't resolve '@/utils/__tests__/test-utils'
```

**Root Cause**: Test utilities have been restructured from monolithic to modular structure.

**Solution**: Update imports to use new modular structure
```typescript
// ❌ OLD: Monolithic imports
import { renderWithProviders, TEST_TIMEOUTS } from '@/utils/__tests__/test-utils';

// ✅ NEW: Modular imports
import { TEST_TIMEOUTS, mockFactories } from '@/utils/__tests__';
import { renderWithProviders } from '@/utils/__tests__/react-test-utils';
```

#### **Issue: Context Type Errors**

**Symptoms**:
```typescript
Type 'UserContextType' is missing properties from type 'ExtendedUserContextType'
```

**Solution**: Use proper context types and provider hierarchy
```tsx
// Ensure correct context type usage
const { hasRole, canAccess, loadingState } = useUser(); // ExtendedUserContextType

// Verify provider order
<EnhancedThemeProvider>      // 1. Theme first
  <UserProvider>             // 2. User context
    <SettingsProvider>       // 3. Settings last
      {children}
    </SettingsProvider>
  </UserProvider>
</EnhancedThemeProvider>
```

#### **Issue: Environment Variables Not Loading**

**Symptoms**: Demo mode not working, Supabase connection failed

**Solution**: Verify environment variable setup
```bash
# Check file exists and has correct name
ls -la .env.local

# Verify variables are properly formatted (no spaces around =)
NEXT_PUBLIC_SUPABASE_URL=https://abc123.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here

# Restart development server after changes
npm run dev
```

#### **Issue: Build Failures in Production**

**Symptoms**: TypeScript compilation errors, missing dependencies

**Solution**: Run local build validation
```bash
# Test production build locally
npm run build

# Check for TypeScript errors
npm run type-check

# Verify no Grid component usage
grep -r "Grid container\|Grid item" src/
```

### Development Issues

#### **Issue: Infinite Re-render Loops**

**Symptoms**: Maximum update depth exceeded errors

**Solution**: Proper memoization of context values
```tsx
// ❌ PROBLEMATIC: New object every render
const contextValue = {
  user,
  settings: { theme: currentTheme, gameSettings }
};

// ✅ SOLUTION: Memoized context value
const contextValue = useMemo(() => ({
  user,
  settings,
  loadingState: {
    user: userLoading,
    roles: rolesLoading,
    avatars: avatarsLoading,
    isReady: !userLoading && !rolesLoading && !avatarsLoading
  }
}), [user, settings, userLoading, rolesLoading, avatarsLoading]);
```

#### **Issue: Missing Component Exports**

**Symptoms**: Export doesn't exist in target module

**Solution**: Add missing exports to index files
```tsx
// Add to src/shared/components/index.ts
export { default as UsageMeter, UsageOverview } from './gates/UsageMeter';
export { default as FeatureGate } from './gates/FeatureGate';
```

#### **Issue: Rate Limit Errors**

**Symptoms**: Rate limit exceeded errors in user management

**Solution**: Check rate limit configuration and adjust as needed
```typescript
// Check current rate limit settings
const rateLimit = await securityService.checkRateLimit(
  'user@example.com',
  'email',
  'invitation'
);

// Adjust rate limits if needed
const customRateLimits = {
  invitation: { windowMinutes: 120, maxAttempts: 20 }, // More lenient
  login: { windowMinutes: 30, maxAttempts: 10 }        // More attempts
};
```

#### **Issue: Audit Log Performance**

**Symptoms**: Slow audit log queries

**Solution**: Implement proper indexing and archiving
```sql
-- Add indexes for common audit log queries
CREATE INDEX idx_audit_logs_org_id_created_at ON audit_logs(org_id, created_at);
CREATE INDEX idx_audit_logs_user_id_action_type ON audit_logs(user_id, action_type);

-- Archive old audit logs (7 years retention)
SELECT cleanup_old_audit_logs(2555);
```

---

## 🔧 Development Tools & Scripts

### Available Scripts
```bash
# Development
npm run dev                    # Start development server
npm run build                  # Build for production
npm run start                  # Start production server

# Code Quality
npm run lint                   # Run ESLint
npm run type-check             # TypeScript checking
npm run format                 # Format code with Prettier

# Testing
npm test                       # Run tests
npm run test:watch             # Run tests in watch mode
npm run test:coverage          # Generate coverage report

# Database (if using local Supabase)
npm run db:start               # Start local Supabase
npm run db:stop                # Stop local Supabase
npm run db:reset               # Reset local database
supabase db push               # Push migrations to remote
```

### VS Code Configuration

Recommended VS Code settings (`.vscode/settings.json`):
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

### Browser Extensions
- **React Developer Tools**: Component debugging
- **Redux DevTools**: State management debugging (if used)
- **Accessibility Insights**: WCAG compliance testing

---

## 📊 Validation & Testing

### Environment Validation Checklist
- [ ] `.env.local` file exists and has correct variables
- [ ] Supabase connection working (check network tab)
- [ ] Demo mode functional (if using demo scenario)
- [ ] All games loading correctly
- [ ] Analytics dashboard operational
- [ ] User context loading properly without errors
- [ ] Theme system working (no hydration mismatches)
- [ ] Test suite passing completely
- [ ] User management services functional
- [ ] Audit logging working correctly
- [ ] Rate limiting operational

### Debug Mode Features
When `NEXT_PUBLIC_DEBUG_MODE=true`:
- Dashboard debug panel shows environment status
- Enhanced console logging for troubleshooting
- User context debugging information
- Theme hydration status indicators
- Security service status display

### Performance Validation
```bash
# Check bundle size
npm run build
npm run analyze  # If bundle analyzer is configured

# Lighthouse testing
npx lighthouse http://localhost:3000 --view

# Load testing (development)
npx autocannon http://localhost:3000
```

---

## 🚀 Deployment

### Database Migration

Run the migration to create all necessary tables and functions:

```bash
# Link to remote Supabase project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push
```

### Scheduled Tasks

Set up scheduled cleanup tasks (requires pg_cron extension):

```sql
-- Clean up expired invitations every 6 hours
SELECT cron.schedule('cleanup-expired-invitations', '0 */6 * * *', 'SELECT cleanup_expired_invitations();');

-- Clean up old rate limits daily at 2 AM
SELECT cron.schedule('cleanup-rate-limits', '0 2 * * *', 'SELECT cleanup_old_rate_limits();');

-- Clean up old audit logs (7 years retention)
SELECT cron.schedule('cleanup-audit-logs', '0 3 * * 0', 'SELECT cleanup_old_audit_logs(2555);');
```

### Vercel Deployment
1. Connect repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy automatically on push to main

### Other Platform Deployment
1. Build the application: `npm run build`
2. Set environment variables in platform settings
3. Deploy the `.next` directory and `public` folder
4. Configure runtime environment for Node.js

### Environment Variables for Production
```bash
# Required for production
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key

# Optional for production
NEXT_PUBLIC_LOG_LEVEL=error
BASE_PATH=""  # If deploying to subdirectory
```

---

## 🔒 Compliance & Security

### GDPR Compliance

The system supports GDPR requirements through:

- **Data Export**: Complete user data export functionality
- **Audit Trail**: Comprehensive logging of all data access and modifications
- **Data Retention**: Configurable retention policies for audit logs
- **Soft Deletion**: User data is marked as deleted rather than permanently removed

### Data Export Example

```typescript
const userData = await userManagementService.exportUserData('user-id');
// Returns complete user profile, activity, audit logs, avatars, and game sessions
```

### Security Monitoring

- Rate limit violations trigger security alerts
- Suspicious activity detection logs events
- Failed authentication attempts are tracked
- Unusual access patterns are flagged

### Performance Monitoring

- Database query performance metrics
- API response time monitoring
- Error rate tracking
- Resource utilization monitoring

---

## 📚 Additional Resources

### Framework Documentation
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React 18 Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

### Supabase Resources
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Integration Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Database Migrations](https://supabase.com/docs/guides/database/migrations)

### Testing Resources
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### Security Resources
- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)
- [GDPR Compliance Guide](https://gdpr.eu/)
- [Rate Limiting Best Practices](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)

---

**🔧 Need Help?** Check [`AGENTS.md`](./AGENTS.md) for development patterns or [`tasks.md`](./tasks.md) for project status and roadmap. 