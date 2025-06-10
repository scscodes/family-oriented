# Family-Oriented Educational Game Platform

A modular, extensible platform for family-friendly educational games (math, colors, shapes, patterns, etc.), built with [Next.js](https://nextjs.org) and [Material UI](https://mui.com/). Features an accessible, modern interface with categorized navigation and comprehensive educational content.

## Features

### 🎯 Educational Games
- **Language Arts**: Letters, Fill-in-the-Blank, Rhyming Words
- **Mathematics**: Numbers (counting, recognition), Addition, Subtraction
- **Social Studies**: Geography (continents, states)
- **Visual Arts**: Colors, Shapes, Patterns

### ♿ Accessibility & Usability
- **WCAG-compliant** design with proper ARIA attributes
- **Keyboard navigation** support throughout
- **Screen reader** compatibility
- **High contrast** colors and large touch targets
- **Responsive design** for all device sizes

### 🎨 Modern Interface
- **Accordion-based navigation** for easy category browsing
- **Search and filter** functionality for quick game discovery
- **Visual category icons** with academic subject organization
- **Consistent, child-friendly** design language

## Quick Start

```bash
npm install
npm run dev
# or: yarn dev, pnpm dev, bun dev
```

To run tests:
```bash
npm test
```

To build for production:
```bash
npm run build
```

## Architecture Highlights

### Code Quality & Performance
- **Type-safe** TypeScript throughout with strict interfaces
- **Centralized utilities** for consistent algorithms and constants
- **Proper randomization** using Fisher-Yates shuffle algorithm
- **Algorithmic content generation** for scalable question creation
- **Accessibility-first** component design

### Key Files & Structure
- `src/app/page.tsx` - Landing page with accordion navigation
- `src/utils/gameUtils.ts` - Centralized question generation
- `src/utils/arrayUtils.ts` - Proper shuffle and array utilities
- `src/utils/constants.ts` - Centralized timing and UI constants
- `src/components/GameBoard.tsx` - Reusable game interface
- `src/context/SettingsContext.tsx` - Global settings management

### Extensibility
- **Modular game architecture** for easy addition of new games
- **Centralized question generators** with consistent interfaces
- **Settings-driven** configuration for all game parameters
- **Component reusability** across different game types

## Documentation

- [Architecture Overview](docs/architecture.md) - Detailed technical architecture
- [Agent Guide](docs/agents.md) - AI/LLM integration patterns
- [ReadTheDocs: Rules & Standards](docs/READTHEDOCS.md) - Development guidelines
- [Tasks Tracking](tasks.md) - Implementation progress and remaining items

## Recent Improvements

### Landing Page Redesign ✅
- Converted from grid layout to accessible accordion navigation
- Added search and subject-based filtering
- Implemented proper ARIA attributes and keyboard navigation
- Organized games by academic subjects for better discoverability

### Code Quality Enhancements ✅
- Fixed problematic shuffle algorithm with proper Fisher-Yates implementation
- Centralized magic numbers and timing constants
- Consolidated duplicate question generation logic
- Replaced hard-coded patterns with algorithmic generators
- Improved styling consistency and removed conflicts

### Accessibility Improvements ✅
- Added comprehensive ARIA labels and screen reader support
- Implemented proper focus management and keyboard navigation
- Ensured high contrast colors and large touch targets
- Added alternative text for all interactive elements

## Contributing

When contributing to this project, please follow the guidelines in [docs/READTHEDOCS.md](docs/READTHEDOCS.md) and ensure:

1. **Type Safety**: Use explicit TypeScript types and interfaces
2. **Accessibility**: Follow WCAG guidelines and test with screen readers
3. **Testing**: Run tests and ensure builds pass before committing
4. **Documentation**: Keep documentation updated with changes
5. **Code Quality**: Follow established patterns and use centralized utilities

