# Family-Oriented Educational Game Platform

Enterprise-scale educational platform with **flat game discovery engine**. Built with Next.js, React, and TypeScript, featuring 11 games across 4 academic subjects with advanced filtering and accessibility.

**🎯 Latest Innovation (v2.0.0)**: Enterprise-scale restructuring with flat game discovery engine and AI-optimized documentation (67% size reduction).

## Quick Start

```bash
npm install
npm run dev     # Development server
npm test        # Run tests  
npm run build   # Production build
```

### Environment Setup
Create `.env.local` file in project root:

```bash
# Required for full functionality
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Development features
NEXT_PUBLIC_LOG_LEVEL=info
NEXT_PUBLIC_DEMO_SCENARIO=professional
NEXT_PUBLIC_DEBUG_MODE=true
```

📋 **Complete Setup Guide**: See [docs/environment-setup.md](docs/environment-setup.md) for full configuration options, demo modes, and troubleshooting.

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
- **Material UI 5+** with design tokens and styled components
- **Centralized utilities** for consistent algorithms and constants
- **Modular game system** for easy extensibility

## 📚 Documentation

**📖 [Complete Documentation Hub](docs/README.md)** - Comprehensive setup and development guides

### 🎯 Essential Guides
- **[Environment Setup](docs/environment-setup.md)** - Complete `.env.local` configuration guide
- **[Development Guide](docs/development.md)** - Complete development reference  
- **[Quick Reference](docs/quick-reference.md)** - Ultra-compact AI context (30-second overview)
- **[Technical Reference](docs/technical-reference.md)** - Deep architecture and advanced patterns
- **[Tasks & Roadmap](docs/tasks.md)** - Project planning and implementation specs

## 🛠️ Adding New Games

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

## 🤝 Contributing

See [docs/development.md](docs/development.md) for complete development guidelines and [docs/quick-reference.md](docs/quick-reference.md) for rapid AI context.

**Key Standards:**
- **Type Safety**: Explicit TypeScript, zero `any` types, strict compilation
- **Accessibility**: WCAG 2.1 AA compliance, comprehensive screen reader support
- **Game Discovery**: Use flat structure with rich metadata and tag system
- **Documentation**: Update relevant docs, maintain AI-efficient structure

## 🚀 Recent Major Updates (v2.0.0)

### Game Data & Discovery Engine
- **Flat Game Registry**: Replaced nested subgames with scalable flat structure
- **Advanced Discovery**: Multi-dimensional filtering, search, and dynamic groupings
- **Rich Metadata**: Tags, age ranges, prerequisites, learning objectives for all 11 games
- **Subject Organization**: Mathematics, Language Arts, Visual Arts, Social Studies

### Documentation Optimization
- **AI-Efficient Structure**: 67% size reduction (154KB → 50KB) with zero information loss
- **Consolidated References**: 6 focused docs replacing 15+ scattered files
- **Strategic Separation**: Quick context vs. detailed enterprise specifications
- **Cross-Referenced**: Clear "when to use" guidance for optimal AI context

---

**For comprehensive documentation, see [docs/](docs/)**

