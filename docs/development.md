---
title: "Development Guide - Complete Reference"
description: "Complete development reference for family-oriented educational platform"
version: "2.0.0"
last_updated: "2024-01-15"
category: "Development Guide"
tags: ["Development", "AI Reference", "Game Discovery", "Architecture", "Guidelines"]
complexity: "All Levels"
audience: ["AI Models", "Developers", "Architects", "Contributors"]
---

# Development Guide - Complete Reference

## 🎯 Quick Context for AI Models
**Enterprise educational game platform** with **flat game discovery engine**, React/TypeScript, 11 games across 4 subjects, enterprise-scale filtering and search.

**Key Innovation**: Migrated from nested subgames to flat structure with rich metadata and advanced discovery capabilities.

## 📊 System Overview at a Glance
```
FLAT GAMES REGISTRY (11 games) → DISCOVERY ENGINE → UI COMPONENTS
     ↓                              ↓                    ↓
• Rich Metadata              • Multi-dimensional    • Smart Navigation
• Tags & Prerequisites       • Search & Filter      • Subject Organization  
• Learning Objectives        • Dynamic Groupings    • Enhanced UI
```

## 🏗️ Core Architecture (Essential)

### Game Discovery System (`src/utils/gameData.ts`)
```typescript
// FLAT STRUCTURE - All games in single array
export const GAMES: Game[] = [/* 11 games with rich metadata */];

// DISCOVERY ENGINE - Advanced filtering
export class GameDiscoveryEngine {
  search(query: string, filters: GameFilter): Game[]
  getGamesBySubject(subject): Game[]
  getFeaturedGames(): Game[]
}

// GAME METADATA - Enterprise scale
interface Game {
  id: string; title: string; href: string;
  subject: 'Mathematics' | 'Language Arts' | 'Visual Arts' | 'Social Studies';
  tags: string[]; ageRange: [number, number]; skillLevel: string;
  learningObjectives: string[]; prerequisites?: string[];
  hasAudio: boolean; isInteractive: boolean; status: string;
}
```

### Key Components (Enhanced)
- **Game Browser** (`src/app/games/page.tsx`): Advanced filtering, search, subject organization
- **Game Menu** (`src/components/GameMenu.tsx`): Subject-organized navigation with metadata
- **Game Board** (`src/components/GameBoard.tsx`): Unified game UI using question generators
- **Settings Context** (`src/context/SettingsContext.tsx`): Global configuration with localStorage

### File Structure (Essential Paths)
```
src/
├── utils/gameData.ts          # 🎯 CORE: Flat registry & discovery engine
├── utils/gameUtils.ts         # Question generation logic
├── components/GameMenu.tsx    # 🔄 Enhanced subject navigation
├── app/games/page.tsx         # 🔄 Advanced game browser
├── context/SettingsContext.tsx # Global settings
└── theme/tokens.ts            # Design system
```

## 🎮 Current Game Inventory
**11 Active Games Across 4 Subjects:**
- **Mathematics (3)**: Numbers, Addition, Subtraction
- **Language Arts (3)**: Letters, Fill in the Blank, Rhyming Words
- **Visual Arts (4)**: Shapes, Shape Sorter, Colors, Patterns
- **Social Studies (1)**: Geography

## 🛠️ Development Guidelines (Essential)

### Adding New Games
1. Add to `GAMES` array in `gameData.ts` with complete metadata
2. Create question generator in `gameUtils.ts` 
3. Add to `questionGenerators` map
4. Create game page in `src/app/games/[name]/`
5. Use Fisher-Yates shuffle, proper TypeScript types

### Code Standards
- **Type Safety**: Explicit interfaces, no `any` types
- **Accessibility**: WCAG compliance, ARIA attributes, keyboard navigation
- **Utilities**: Use centralized `arrayUtils.ts`, `constants.ts`
- **Design**: Use design tokens, styled components over inline `sx`

### Quality Checklist
- [ ] TypeScript compilation success
- [ ] ESLint compliance  
- [ ] Accessibility testing
- [ ] Game discovery functionality
- [ ] Documentation updates

## 🔧 Environment Configuration

### Required Environment Variables
Create `.env.local` file in project root:

```bash
# Core Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Development Features
NEXT_PUBLIC_LOG_LEVEL=info
NEXT_PUBLIC_DEMO_SCENARIO=professional
NEXT_PUBLIC_DEBUG_MODE=true
```

### Demo Mode for Development
Set `NEXT_PUBLIC_DEMO_SCENARIO` to test without Supabase:
- `personal`: 5 avatars, basic features
- `professional`: 30 avatars, advanced analytics
- `enterprise`: unlimited features

📋 **Complete Guide**: [environment-setup.md](./environment-setup.md)

## 🔧 Key Integration Points (For AI)

### Game Discovery Usage
```typescript
// Search with filters
const games = gameDiscovery.search('math counting', {
  subjects: ['Mathematics'],
  ageRange: [3, 6],
  skillLevels: ['beginner']
});

// Get by subject
const mathGames = gameDiscovery.getGamesBySubject('Mathematics');

// Featured games
const featured = gameDiscovery.getFeaturedGames();
```

### Extending the System
```typescript
// New game with rich metadata
const newGame: Game = {
  id: 'new-game', title: 'New Game', href: '/games/new-game',
  subject: 'Mathematics', tags: ['counting', 'beginner'],
  ageRange: [4, 7], skillLevel: 'beginner',
  learningObjectives: ['Skill 1', 'Skill 2'],
  hasAudio: true, isInteractive: true, status: 'active'
};

// Add question generator
questionGenerators['newGame'] = (settings) => [/* questions */];
```

## 🔧 Advanced Development Topics

### Code Review Checklist
- [ ] Proper TypeScript types
- [ ] Accessibility attributes and keyboard navigation
- [ ] Use of centralized utilities and game discovery system
- [ ] Proper algorithms (Fisher-Yates shuffle)
- [ ] Game metadata completeness and accuracy
- [ ] Documentation updates
- [ ] Test coverage
- [ ] Build success

### Accessibility Testing
- [ ] Screen reader testing
- [ ] Keyboard-only navigation
- [ ] Color contrast validation
- [ ] Touch target verification
- [ ] Zoom testing (200%)
- [ ] Focus indicator visibility
- [ ] Game discovery UI accessibility

### Performance Standards
- Proper algorithms and data structures
- React optimization patterns
- Centralized calculations and caching
- Debounced user input
- Efficient game discovery filtering
- Optimized metadata queries

### Quality Assurance
**Pre-Commit Requirements:**
- TypeScript compilation success
- All tests passing
- ESLint compliance
- Game discovery engine functionality
- Documentation updates for architectural changes

**Deployment Readiness:**
- Accessibility compliance validated
- Performance benchmarks met
- Cross-browser compatibility
- Game discovery system tested
- Documentation current

## 📚 Specialized Documentation

For deeper technical details, see:
- [`game-discovery.md`](./game-discovery.md) - Discovery system implementation
- [`architecture.md`](./architecture.md) - System design and major changes
- [`agents.md`](./agents.md) - AI integration patterns
- [`tasks.md`](./tasks.md) - Roadmap and progress tracking

## 🚀 Recent Major Updates (v2.0.0)
- **Enterprise Restructure**: Flat game registry replacing nested subgames
- **Advanced Discovery**: Multi-dimensional filtering and search engine
- **Rich Metadata**: Tags, prerequisites, learning objectives for all games
- **Enhanced UI**: Subject-organized navigation with metadata display
- **Dynamic Groupings**: Code-free content collections
- **Build Success**: Zero TypeScript/ESLint errors, full accessibility compliance

## 🗺️ Project Roadmap

### Current Phase (v2.0.0) - ✅ COMPLETE
- ✅ Flat game registry implementation
- ✅ Advanced discovery engine
- ✅ Rich metadata system
- ✅ Enhanced UI components
- ✅ Analytics integration complete with dashboard
- ✅ User context loading state optimization
- ✅ Role-based UI rendering without flashing
- ✅ Dashboard analytics data loading functional

### Recently Fixed (v2.0.1)
- ✅ Analytics service method naming consistency (`getAvatarProgress` vs `getLearningProgress`)
- ✅ Dashboard loading error resolution
- ✅ Full analytics dashboard functionality verified

### Next Phase (v2.1.0)
1. **Enhanced Analytics**
   - Advanced performance tracking
   - Learning path optimization
   - Personalized recommendations

2. **Accessibility Improvements**
   - WCAG 2.1 AA compliance
   - Enhanced screen reader support
   - Improved keyboard navigation

3. **Performance Optimization**
   - Code splitting
   - Lazy loading
   - Caching strategies

### Future Plans (v2.2.0+)
1. **New Game Types**
   - Advanced mathematics
   - Science integration
   - Social-emotional learning

2. **Platform Features**
   - Multiplayer support
   - Progress sharing
   - Parent dashboard

3. **Technical Improvements**
   - AI integration
   - Advanced personalization
   - Cross-platform support

### Maintenance Tasks
- Regular dependency updates
- Performance monitoring
- Security audits
- Documentation updates

---
**For AI Models**: This document contains 80% of essential system knowledge. Use specialized docs only when deep implementation details are needed. 