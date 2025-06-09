# Agent-Centric Project Guide

This document is designed to help AI/LLM-powered agents quickly understand and interact with the core logic and extensibility points of the project.

## 1. Context & State
- **SettingsContext**: The global source of truth for all game configuration (number of questions, ranges, difficulty, etc.).
  - Located in `src/context/SettingsContext.tsx`.
  - Exposes settings, update functions, and reset logic.
  - Settings are persisted in localStorage for continuity.
- **Usage**: Agents can read and update settings via the context, or directly manipulate localStorage for batch operations.

## 2. Question Generation
- **Centralized in `src/utils/gameUtils.ts`**
  - Each game type (numbers, math, colors, etc.) has a dedicated generator function.
  - All generators return a list of `GameQuestion` objects, which are strongly typed.
  - The `questionGenerators` map allows dynamic selection of the appropriate generator based on game type and settings.
- **Extending**: To add new question types, implement a new generator and register it in `questionGenerators`.

## 3. Game Flow
- **useGame Hook**: The main orchestrator for question generation and settings integration.
  - Located in `src/hooks/useGame.ts`.
  - Consumes global settings and produces a list of questions for the current game.
- **GameBoard Component**: The UI engine for presenting questions, options, and feedback.
  - Located in `src/components/GameBoard.tsx`.
  - Handles user interaction, scoring, and state transitions.

## 4. Extensibility Points
- **Settings**: Add new fields to the `GlobalSettings` interface and update the context/provider logic.
- **Question Types**: Add new generator functions and update the `questionGenerators` map.
- **UI/UX**: Extend or customize the `GameBoard` or per-game pages for new interaction patterns.
- **Analytics/Adaptivity**: Agents can observe user performance via the GameBoard and context, and adjust settings or question difficulty accordingly.

## 5. Agent Integration Patterns
- **Direct Context Manipulation**: Use the SettingsContext to read/update configuration in real time.
- **Batch Operations**: Read/write settings or question data in localStorage for rapid prototyping or testing.
- **Hooking into Question Generation or Settings Update**: 
  - Agents can wrap or extend the `questionGenerators` map to inject new logic, intercept question creation, or log/modify questions before they reach the UI.
  - For settings, agents can use the context's update functions or patch the provider to observe and react to changes.
  - Example: To log every generated question, wrap the generator function for a game type and add logging before returning the questions.
  - Example: To enforce a minimum number of questions, intercept settings updates and adjust values as needed before applying them.
- **Dynamic Game Creation**: Register new question generators or inject new game types at runtime (if agent has code execution privileges).
- **Feedback Loops**: Monitor user answers and adapt question generation or settings for personalized learning.

## 6. Key Types
- **GameQuestion**: The core data structure for all questions. Includes prompt, options, correct answer, type, and optional metadata.
- **GlobalSettings**: The shape of all configurable options for the platform.

## 7. Best Practices for Agents
- Always validate settings before applying them to avoid breaking the UI.
- Use the centralized question generation logic for consistency.
- Prefer context/provider APIs over direct DOM manipulation for state changes.
- When adding new features, update both the context and the UI for a seamless experience. 