# 🚀 Quick Onboarding Prompt for AI Assistants

Copy this prompt to quickly bring an AI assistant up to speed on the Family Oriented platform:

---

## Project Context
You are working on **Family Oriented**, an enterprise-scale educational game platform with:
- **Next.js 15.2.4+** with App Router, TypeScript strict mode
- **React 18+** with Material-UI 5+ (NO Grid components - use CSS Grid with Box)
- **Supabase** authentication + database + real-time
- **Flat game discovery engine** with 11 educational games across 4 subjects

## 🎯 Current Status: Core Authentication System Complete ✅

### ✅ Working Features (Ready for Use)
- **Complete Registration Flow** at `/signup` - Multi-step with tier selection and subscription setup
- **Complete Login Flow** at `/login` - Email/password with social login UI ready
- **Email Verification System** at `/verify-email` - Token processing with resend functionality
- **Centralized Error Handling** - User-friendly messages with contextual actions
- **Smart Route Protection** - Protected routes redirect to login, public routes maintain demo mode

### 📊 Progress: 11/15 Core Auth Tasks Complete (73%)

## 🔧 Critical Constraints
1. **NO Material-UI Grid** - Causes TypeScript build errors, use CSS Grid with Box
2. **Context Order** - Theme → User → Settings (prevents hydration issues)
3. **TypeScript Strict** - No `any` types, explicit interfaces required

## 📁 Key File Locations
```typescript
// Authentication System
src/hooks/useAuth.ts                 // Auth operations (signIn, signUp, resetPassword)
src/hooks/useRegistration.ts         // Complete registration flow
src/utils/authErrors.ts              // Centralized error handling
src/components/auth/                 // Auth UI components
src/context/UserContext.tsx         // User state with route-aware logic

// Core System
src/utils/gameData.ts               // Game registry & discovery engine
src/utils/subscriptionService.ts    // Tier management & feature gating
src/theme/EnhancedThemeProvider.tsx // Theme + hydration coordination
```

## 🚀 What Users Can Do Right Now
1. **Register** at `/signup` → Choose tier → Verify email → Access dashboard
2. **Login** at `/login` → Access personalized features
3. **Email Verification** works with proper error handling
4. **Explore Games** via demo mode without authentication
5. **Protected Routes** properly redirect with return URL

## 📋 Next Authentication Tasks (Ready to Start)
- **AUTH-012**: Login/Logout Integration (ProfileMenu updates)
- **AUTH-013**: Authentication State Persistence (cross-tab, token refresh)
- **AUTH-014**: Authentication Loading States (consistent spinners)
- **AUTH-015**: Authentication Testing Infrastructure

## 🛠️ Development Commands
```bash
npm run dev     # Start development server
npm run build   # Test production build 
npm test        # Run Jest test suite
npm run lint    # ESLint validation
```

## 📚 Quick Reference
- **Documentation Hub**: `docs/README.md`
- **AI Reference**: `docs/AGENTS.md` (comprehensive patterns and constraints)
- **Auth Tasks**: `docs/auth-tasks.md` (detailed progress tracking)
- **Setup Guide**: `docs/setup.md` (environment configuration)

---

**Ready to Continue?** The authentication foundation is solid. Next phase focuses on completing remaining core auth tasks (AUTH-012 through AUTH-015) to finish the authentication system. 