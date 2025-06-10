# Development Guidelines

## General Rules
- Windows environment: Use CMD/PowerShell syntax
- Keep changes focused and avoid sweeping changes
- Prioritize accessibility (WCAG standards)
- Ensure build/test success before commits
- Keep response context concise, bullet list format, unless directed

## Coding Standards

### Core Principles
- Short, focused, testable code
- Explicit types, avoid `any`/`unknown`
- Use centralized utilities and constants
- Maintain accessibility compliance

### Architecture Patterns
- **Utilities**: Use `arrayUtils.ts`, `constants.ts`, `gameUtils.ts`
- **Algorithms**: Fisher-Yates shuffle, proper mathematical sequences
- **Type Safety**: Explicit interfaces, no `any` types

### Accessibility Requirements
- **ARIA**: Proper labels, controls, screen reader support
- **Keyboard**: Full keyboard navigation, visible focus
- **Visual**: WCAG contrast, 44px touch targets, responsive design

### Component Patterns
- Design for reuse and composition
- Use React optimization patterns appropriately
- Prefer styled components over inline `sx` props

## Documentation Standards

### Code Documentation
- Clear, concise documentation
- JSDoc for public APIs
- Comment accessibility implementations

### Project Documentation
- Track progress in `docs/tasks.md`
- Update architecture docs for new patterns
- Document accessibility procedures

## Key Files
- [Architecture](./architecture.md) - Technical overview
- [Agent Guide](./agents.md) - AI integration patterns
- [Tasks](./tasks.md) - Progress tracking
- [Feature Roadmap](./feature_roadmap.md) - Future ideas

## Implementation Guidelines

### Adding Features
1. Plan accessibility from start
2. Use existing utilities and constants
3. Define TypeScript interfaces first
4. Test functionality and accessibility
5. Update documentation

### Code Review Checklist
- [ ] Proper TypeScript types
- [ ] Accessibility attributes and keyboard navigation
- [ ] Use of centralized utilities
- [ ] Proper algorithms (Fisher-Yates shuffle)
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

## Performance Standards
- Proper algorithms and data structures
- React optimization patterns
- Centralized calculations and caching
- Debounced user input

## Quality Assurance

### Pre-Commit Requirements
- TypeScript compilation success
- All tests passing
- ESLint compliance
- Documentation updates for architectural changes

### Deployment Readiness
- Accessibility compliance validated
- Performance benchmarks met
- Cross-browser compatibility
- Documentation current