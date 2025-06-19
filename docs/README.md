---
title: "Family-Oriented Platform - Documentation Hub"
description: "Complete documentation index for the educational game platform"
version: "2.0.0"
last_updated: "2024-01-15"
category: "Documentation Hub"
tags: ["Documentation", "Index", "Setup", "Development"]
---

# 📚 Family-Oriented Platform - Documentation Hub

Complete documentation for the enterprise-scale educational game platform with flat discovery engine, React/TypeScript, and Supabase integration.

## 🚀 Quick Start Documentation

### New Developers
1. **[Quick Reference](./quick-reference.md)** - 30-second overview for AI context
2. **[Environment Setup](./environment-setup.md)** - Complete .env.local configuration guide
3. **[Development Guide](./development.md)** - Development guidelines and standards

### Setup Checklist
- [ ] Clone repository: `git clone <repo-url>`
- [ ] Install dependencies: `npm install`
- [ ] Configure environment: Copy and update `.env.local` ([guide](./environment-setup.md))
- [ ] Start development: `npm run dev`
- [ ] Access application: http://localhost:3000

## 📖 Documentation Structure

### Essential Guides (Start Here)
| Document | Purpose | Audience | Time to Read |
|----------|---------|----------|--------------|
| **[Quick Reference](./quick-reference.md)** | AI context & essentials | AI Models, Quick lookup | 1 min |
| **[Environment Setup](./environment-setup.md)** | Complete .env.local guide | All developers | 5 min |
| **[Development Guide](./development.md)** | Complete development reference | Developers | 15 min |

### Specialized Documentation
| Document | Purpose | Audience | Use Case |
|----------|---------|----------|----------|
| **[Technical Reference](./technical-reference.md)** | Deep architecture & patterns | Senior developers, architects | Major changes |
| **[Tasks & Roadmap](./tasks.md)** | Project planning & specifications | Project managers, architects | Planning |
| **[Subscription Analysis](./subscription-tier-analysis.md)** | Business tier implementation | Product, business | Feature planning |

## 🔧 Configuration & Setup

### Environment Variables (.env.local)
```bash
# Required for full functionality
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional development features
NEXT_PUBLIC_LOG_LEVEL=info                    # error, warn, info, debug
NEXT_PUBLIC_DEMO_SCENARIO=professional        # personal, professional, enterprise
NEXT_PUBLIC_DEBUG_MODE=true                   # true, false

# Optional deployment
BASE_PATH=                                    # For subdirectory deployments
```

### Demo Mode Setup (No Supabase Required)
```bash
# Quick demo without database setup
NEXT_PUBLIC_DEMO_SCENARIO=professional
NEXT_PUBLIC_DEBUG_MODE=true
```

**Complete Guide**: [Environment Setup](./environment-setup.md)

## 🎮 Platform Overview

### Current Features
- **11 Educational Games** across 4 academic subjects
- **Flat Game Discovery Engine** with advanced filtering
- **Analytics Dashboard** with learning progress tracking
- **User Management** with avatar system and role-based access
- **Subscription Tiers** with feature gating and usage limits
- **Demo Mode** for development and testing

### Architecture Highlights
- **Next.js 14+** with App Router and Server Components
- **React 18+** with TypeScript strict mode
- **Supabase** for authentication, database, and real-time features
- **Material-UI 5+** with custom design tokens
- **Enterprise-scale** game discovery and metadata system

## 🛠️ Development Resources

### Key File Structure
```
src/
├── utils/
│   ├── gameData.ts                    # 🎯 Core game registry & discovery
│   ├── gameUtils.ts                   # Question generation logic
│   ├── subscriptionService.ts         # Tier management & feature gating
│   └── analyticsService.ts            # Learning progress analytics
├── components/
│   ├── GameMenu.tsx                   # Subject-organized navigation
│   ├── billing/                       # Subscription management UI
│   └── dashboard/                     # Analytics components
├── app/
│   ├── games/                         # Game pages
│   ├── dashboard/                     # Analytics dashboard
│   └── settings/                      # User preferences
├── context/                           # React context providers
├── hooks/                             # Custom React hooks
└── theme/                             # Design system & tokens
```

### Adding New Features
1. **New Game**: Add to `gameData.ts`, create generator, add page
2. **New Component**: Use design tokens, follow TypeScript patterns
3. **New Feature**: Update subscription service if tier-gated
4. **Database Changes**: Add migration, update types

### Quality Standards
- **TypeScript**: Strict mode, explicit types, zero `any`
- **Accessibility**: WCAG 2.1 AA compliance
- **Testing**: Jest with React Testing Library
- **Code Style**: ESLint with Next.js config
- **Documentation**: Update relevant docs with changes

## 📊 Testing & Validation

### Running Tests
```bash
npm test                               # Run Jest test suite
npm run lint                          # Check code style
npm run build                         # Validate production build
```

### Environment Validation
- ✅ Supabase connection working
- ✅ Demo mode functional
- ✅ All games loading correctly
- ✅ Analytics dashboard operational
- ✅ User context loading properly

### Debug Mode Features
When `NEXT_PUBLIC_DEBUG_MODE=true`:
- Dashboard debug panel shows environment status
- Enhanced console logging
- User context debugging information

## 🚀 Deployment

### Environment Configuration
- **Vercel**: Set environment variables in dashboard
- **GitHub Actions**: Configure secrets for CI/CD
- **Docker**: Pass environment variables at runtime

### Required Secrets
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Complete Deployment Guide**: [Environment Setup - Deployment](./environment-setup.md#deployment-configuration)

## 📚 External Resources

### Supabase Documentation
- [Getting Started](https://supabase.com/docs/guides/getting-started)
- [Next.js Integration](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Database Migrations](https://supabase.com/docs/guides/database/migrations)

### Framework Documentation
- [Next.js 14](https://nextjs.org/docs)
- [React 18](https://react.dev/)
- [Material-UI](https://mui.com/)
- [TypeScript](https://www.typescriptlang.org/docs/)

## 🎯 Documentation Maintenance

### Updating Documentation
- Keep version numbers current in frontmatter
- Update last_updated dates when making changes
- Ensure code examples match current implementation
- Test all setup instructions on clean environment

### Documentation Standards
- Use frontmatter for metadata
- Include clear audience and complexity indicators
- Provide time estimates for reading/setup
- Cross-reference related documentation

---

**🚀 Ready to Start?** Begin with [Environment Setup](./environment-setup.md) for complete configuration guidance. 