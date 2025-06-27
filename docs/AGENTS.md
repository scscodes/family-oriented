---
title: "AGENTS - AI/Coding Assistant Reference"
description: "Essential reference for AI models and coding assistants"
version: "2.0.0"
last_updated: "2024-01-17"
category: "AI Reference"
tags: ["AI", "Agents", "Architecture", "Constraints", "Development", "Essential"]
complexity: "Essential"
audience: ["AI Models", "Coding Assistants", "Automated Tools"]
---

# 🤖 AGENTS - AI/Coding Assistant Reference

**Essential reference optimized for AI models and coding assistants working on the family-oriented educational platform.**

## Project Context
You are working on **Family Oriented**, an enterprise-scale educational game platform with:
- **Next.js 15.2.4+** with App Router, TypeScript strict mode
- **React 18+** with Material-UI 5+ (NO Grid components - use CSS Grid with Box)
- **Supabase** authentication + database + real-time
- **Flat game discovery engine** with 11 educational games across 4 subjects

## 🎯 Current Status: Core Systems Online

### ✅ Key Systems Operational
- **Core Authentication System** is complete and operational.
- **Enterprise Game Discovery Engine** is live.
- **Subscription & Tier Management** services are active.

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

## 🛠️ Development Commands
```bash
npm run dev     # Start development server
npm run build   # Test production build 
npm test        # Run Jest test suite
npm run lint    # ESLint validation
```

## 📚 Quick Reference
- **Project README**: `../README.md` (comprehensive project overview)
- **Deep Context**: `prompts/agent-context.md` (comprehensive patterns and constraints)
- **Auth Tasks**: `auth-tasks.md` (detailed progress tracking)
- **Setup Guide**: `setup.md` (environment configuration)

---

**Ready to Continue?** The core systems are stable. Refer to the documentation for next steps and project roadmaps. 