---
title: "Quick Reference - AI Context"
description: "Ultra-compact essential information for AI models"
version: "2.0.0"
complexity: "Essential Only"
audience: ["AI Models", "Quick Reference"]
---

# 🚀 Family-Oriented Platform - Quick Reference

## Essential Context (30 seconds)
- **Educational game platform**: React/TypeScript/Next.js
- **11 games**, 4 subjects (Math, Language Arts, Visual Arts, Social Studies)
- **Flat game registry** with enterprise discovery engine
- **Analytics dashboard**: Fully functional with Supabase integration
- **Key innovation**: Migrated from nested to flat with rich metadata
- **Status**: Core platform complete, dashboard operational ✅

## Core System
```typescript
// GAMES ARRAY: src/utils/gameData.ts
GAMES: Game[] // 11 games with rich metadata

// DISCOVERY ENGINE
gameDiscovery.search(query, filters)
gameDiscovery.getGamesBySubject(subject)

// GAME STRUCTURE
interface Game {
  id, title, href, subject, tags, ageRange, skillLevel,
  learningObjectives, prerequisites?, hasAudio, isInteractive
}
```

## Key Files
- `src/utils/gameData.ts` - Core registry & discovery
- `src/utils/gameUtils.ts` - Question generators
- `src/utils/analyticsService.ts` - Analytics & learning progress
- `src/components/GameMenu.tsx` - Subject navigation
- `src/app/games/page.tsx` - Game browser
- `src/app/dashboard/page.tsx` - Analytics dashboard

## Quick Setup
```bash
# .env.local file
NEXT_PUBLIC_SUPABASE_URL=https://abc123.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
NEXT_PUBLIC_DEMO_SCENARIO=professional  # For demo mode
```

## Add New Game
1. Add to `GAMES` array with metadata
2. Create generator in `gameUtils.ts`
3. Add game page in `src/app/games/[name]/`

## Standards
- TypeScript strict, no `any`
- WCAG accessibility
- Fisher-Yates shuffle
- Design tokens, styled components

---
**Use `docs/README.md` for complete reference** 