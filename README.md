# Family-Oriented Educational Game Platform

Enterprise-scale educational platform with **flat game discovery engine**. Built with Next.js, React, and TypeScript, featuring 11 games across 4 academic subjects with advanced filtering and accessibility.

**🎯 Latest Innovation (v2.0.0)**: Enterprise-scale restructuring with flat game discovery engine and AI-optimized documentation.

## 📋 Table of Contents

- [🚀 Quick Start](#-quick-start)
- [🔧 Environment Setup](#-environment-setup)
- [🎮 Current Games](#-current-games-11-total)
- [🏗️ Key Features](#️-key-features)
- [🛠️ Development Commands](#️-development-commands)
- [📁 Key File Structure](#-key-file-structure)
- [🎯 Adding New Games](#-adding-new-games)
- [📚 Documentation](#-documentation)
- [🤝 Contributing](#-contributing)
- [🚀 Recent Major Updates](#-recent-major-updates-v200)

## 🚀 Quick Start

```bash
# Clone and install
git clone <repository-url>
cd family-oriented
npm install

# Start development
npm run dev
```

Access the application at http://localhost:3000

## 🔧 Environment Setup

Create `.env.local` file in project root:

```bash
# Required for full functionality
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional development features
NEXT_PUBLIC_LOG_LEVEL=info                    # error, warn, info, debug
NEXT_PUBLIC_DEMO_SCENARIO=professional        # personal, professional, enterprise
NEXT_PUBLIC_DEBUG_MODE=true                   # true, false
```

### Demo Mode Setup (No Supabase Required)
```bash
# Quick demo without database setup
NEXT_PUBLIC_DEMO_SCENARIO=professional
NEXT_PUBLIC_DEBUG_MODE=true
```

**📋 Complete Setup Guide**: See [docs/setup.md](docs/setup.md) for detailed configuration and troubleshooting.

## 🎮 Current Games (11 Total)
- **Mathematics (3)**: Numbers, Addition, Subtraction
- **Language Arts (3)**: Letters, Fill in the Blank, Rhyming Words  
- **Visual Arts (4)**: Shapes, Shape Sorter, Colors, Patterns
- **Social Studies (1)**: Geography

## 🏗️ Key Features

### Enterprise Game Discovery
- **Flat Game Registry** with rich metadata (tags, age ranges, learning objectives)
- **Advanced Filtering** by subject, skill level, age, features
- **Dynamic Groupings** for content collections without code changes
- **Learning Paths** with prerequisites and skill progression

### Accessibility & Quality
- **WCAG 2.1 AA compliant** with comprehensive screen reader support
- **Keyboard navigation** throughout with proper focus management
- **TypeScript strict mode** with zero compilation errors
- **Fisher-Yates algorithm** for proper randomization

### Modern Architecture
- **Next.js 14+** with App Router and Server Components
- **React 18+** with TypeScript strict mode
- **Supabase** for authentication, database, and real-time features
- **Material-UI 5+** with design tokens and styled components
- **Centralized utilities** for consistent algorithms and constants
- **Modular game system** for easy extensibility

## 🛠️ Development Commands

```bash
npm run dev           # Start Next.js development server
npm run build         # Validate production build
npm test              # Run Jest test suite
npm run lint          # Check code style
```

## 📁 Key File Structure

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

## 🎯 Adding New Games

```typescript
// 1. Add to GAMES array with rich metadata
const newGame: Game = {
  id: 'new-game', title: 'New Game', href: '/games/new-game',
  subject: 'Mathematics', tags: ['counting', 'beginner'],
  ageRange: [4, 7], skillLevel: 'beginner',
  learningObjectives: ['Skill 1', 'Skill 2'],
  hasAudio: true, isInteractive: true, status: 'active'
};

// 2. Create question generator
questionGenerators['newGame'] = (settings) => [...questions];

// 3. Add game page in src/app/games/new-game/
```

## 📚 Documentation

### For Developers
- **[Setup Guide](docs/setup.md)** - Complete environment configuration and troubleshooting
- **[Tasks & Roadmap](docs/tasks.md)** - Project planning and implementation specifications
- **[Subscription Analysis](docs/subscription-tier-analysis.md)** - Business tier implementation details

### For AI Agents
- **[AGENTS.md](docs/AGENTS.md)** - Essential reference for AI coding assistants (3-minute read)
- **[Auth Tasks](docs/auth-tasks.md)** - Detailed authentication implementation tracking

## 🤝 Contributing

**Key Standards:**
- **Type Safety**: Explicit TypeScript, zero `any` types, strict compilation
- **Accessibility**: WCAG 2.1 AA compliance, comprehensive screen reader support
- **Game Discovery**: Use flat structure with rich metadata and tag system
- **Layout**: Use CSS Grid with Box (NO Material-UI Grid components)
- **Context Order**: Theme → User → Settings (prevents hydration issues)

## 🚀 Recent Major Updates (v2.0.0)

### Game Data & Discovery Engine
- **Flat Game Registry**: Replaced nested subgames with scalable flat structure
- **Advanced Discovery**: Multi-dimensional filtering, search, and dynamic groupings
- **Rich Metadata**: Tags, age ranges, prerequisites, learning objectives for all 11 games
- **Subject Organization**: Mathematics, Language Arts, Visual Arts, Social Studies

### Documentation Optimization
- **AI-Efficient Structure**: Consolidated documentation with zero information loss
- **Single Source of Truth**: Root README contains all essential information
- **Progressive Disclosure**: Quick start → detailed guides → specialized docs

---

**For comprehensive documentation, see [docs/](docs/)**

