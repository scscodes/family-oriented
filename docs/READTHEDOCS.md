# Read The Docs

## General Rules
- For local development, expect a Windows-based environment; use CMD/powershell-compatible commands and syntax
- Keep changes constrained to the task at hand
- Avoid sweeping changes unless directed
- Prioritize accessibility compliance in all changes (WCAG standards)

## Coding Standards

### **Core Principles**
- Keep code short, highly focused and easily testable
- Always check for unit tests, and keep them up to date
- Prefer explicit types and use of data structures, like interfaces
- Avoid use of Any or Unknown types
- Adhere to industry, language and framework best practice by default
- Before updating source control, ensure build and test commands complete successfully

### **Architecture Patterns**
- **Centralized Utilities**: Use established utility files for common operations
  - `src/utils/arrayUtils.ts` for proper randomization and array operations
  - `src/utils/constants.ts` for timing, UI values, and configuration
  - `src/utils/gameUtils.ts` for question generation logic
- **Algorithm Quality**: Use proper computer science algorithms
  - Fisher-Yates shuffle for randomization (never `Math.random() - 0.5` sorting)
  - Efficient array operations and proper mathematical sequences
  - Algorithmic content generation over hard-coded data
- **Type Safety**: Strict TypeScript compliance
  - Explicit interfaces for all data structures (`GameQuestion`, `GameData`, etc.)
  - No `any` or `unknown` types in production code
  - Proper type guards and validation where needed

### **Accessibility Requirements**
- **ARIA Compliance**: All interactive elements must have proper ARIA attributes
  - Use `aria-label`, `aria-expanded`, `aria-controls` appropriately
  - Provide screen reader support for all visual content
  - Implement proper heading hierarchies
- **Keyboard Navigation**: Full functionality accessible via keyboard
  - Tab order must be logical and complete
  - Focus indicators must be visible and high contrast
  - No keyboard traps or inaccessible content
- **Visual Standards**: Meet WCAG contrast and sizing requirements
  - High contrast ratios for all text/background combinations
  - Large touch targets (minimum 44px) for interactive elements
  - Responsive design that works at all zoom levels

### **Component Patterns**
- **Reusability**: Design components for reuse across different contexts
- **Composition**: Prefer composition over inheritance for component architecture
- **Performance**: Use React optimization patterns appropriately
  - `React.memo`, `useMemo`, `useCallback` for expensive operations
  - Proper dependency arrays and effect management
  - Avoid unnecessary re-renders through proper state structure

## Documentation Standards

### **Code Documentation**
- Keep documentation clear, concise, and up to date
- Document all critical or complex logic, including examples as required
- Use JSDoc comments for public APIs and complex functions
- Include usage examples for utility functions and algorithms
- Comment accessibility implementation details for future maintenance

### **Project Documentation**
- Create a `tasks.md` file to track progress over large or multi-step tasks
- Tasks should be ordered, and clearly define their purpose and expected outcome that is easily validated
- Update architecture documentation when adding new patterns or utilities
- Maintain agent integration guides with current best practices
- Document accessibility testing procedures and requirements

### **File Organization**
- **Utility Files**: Organize by purpose (arrays, constants, game logic)
- **Component Files**: Group by feature or reusability scope
- **Documentation**: Keep docs current with implementation
- **Types**: Centralize interfaces and type definitions

## Key Documentation Files

### **Core Documentation**
- [Project README](../README.md) - Overview, features, quick start
- [Architecture Overview](./architecture.md) - Technical details and patterns
- [Agent Guide](./agents.md) - AI/LLM integration patterns
- [Tasks Tracking](../tasks.md) - Implementation progress and roadmap

### **Code Quality Resources**
- **Utility Examples**: Reference `src/utils/` for proper algorithm implementation
- **Accessibility Patterns**: Review accordion and navigation components for ARIA compliance
- **Type Safety**: Use existing interfaces as templates for new features
- **Testing Standards**: Follow established Jest patterns and accessibility testing procedures

## Implementation Guidelines

### **Adding New Features**
1. **Plan Accessibility**: Consider screen readers, keyboard navigation, and WCAG compliance from the start
2. **Use Utilities**: Leverage existing utility functions and constants
3. **Type Safety**: Define proper TypeScript interfaces before implementation
4. **Test Thoroughly**: Validate functionality, accessibility, and performance
5. **Document Changes**: Update relevant documentation and comments

### **Code Review Checklist**
- [ ] Proper TypeScript types with no `any` or `unknown`
- [ ] Accessibility attributes and keyboard navigation support
- [ ] Use of centralized utilities and constants
- [ ] Proper algorithms (Fisher-Yates shuffle, efficient operations)
- [ ] Documentation updates for new patterns or features
- [ ] Test coverage for critical logic and edge cases
- [ ] Build and type compilation success

### **Accessibility Testing Protocol**
- [ ] Screen reader testing (NVDA, JAWS, or VoiceOver)
- [ ] Keyboard-only navigation testing
- [ ] Color contrast validation
- [ ] Touch target size verification
- [ ] Zoom testing up to 200%
- [ ] Focus indicator visibility

## Performance Standards

### **Code Performance**
- Use proper algorithms and data structures
- Leverage React optimization patterns appropriately
- Centralize expensive calculations and cache results
- Debounce user input for search and filtering

### **Accessibility Performance**
- Minimize screen reader verbosity with proper ARIA usage
- Efficient keyboard navigation without excessive tab stops
- Quick visual feedback for user interactions
- Responsive design that works smoothly across devices

## Quality Assurance

### **Pre-Commit Standards**
- All TypeScript compilation must pass without errors
- All tests must pass (unit, integration, accessibility)
- Code must follow established patterns and use centralized utilities
- Documentation must be updated for any architectural changes

### **Deployment Readiness**
- Accessibility compliance validated through testing
- Performance benchmarks met (loading times, interaction responsiveness)
- Cross-browser compatibility verified
- All documentation current and accurate