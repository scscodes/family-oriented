# Project Architecture Overview

## 1. Overview
This project is a family-oriented educational game platform built with Next.js and React, using Material UI for design. It features a modular architecture for different game types (math, colors, shapes, patterns, etc.), centralized settings management, and extensible question generation logic.

## 2. Main Concepts
- **Game Types**: Each game (e.g., numbers, letters, math, fill-in-the-blank, rhyming) is a module with its own question generation logic and UI.
- **Settings Context**: Global settings (e.g., number of questions, difficulty, ranges) are managed via React context and persisted in localStorage.
- **Question Generators**: Centralized logic for generating questions for each game type, supporting extensibility and consistency.
- **Game Board**: A reusable component that handles question display, user interaction, scoring, and feedback.
- **Hooks**: Custom hooks (e.g., `useGame`) abstract game logic and settings integration.

## 3. Core Modules
- **src/context/SettingsContext.tsx**: Provides global settings state and update logic.
- **src/utils/gameUtils.ts**: Contains all question generation logic and type definitions for games.
- **src/hooks/useGame.ts**: Shared hook for generating questions and integrating with settings.
- **src/components/GameBoard.tsx**: Main UI for presenting questions, options, and feedback.
- **src/app/games/**: Contains per-game UI and logic, each in its own directory.
- **src/utils/settingsUtils.ts**: Handles default settings and localStorage persistence.

## 4. Data Flow
1. **SettingsProvider** wraps the app, providing settings context.
2. **Game pages** use `useGame` to generate questions based on current settings.
3. **GameBoard** receives questions and manages user interaction, scoring, and feedback.
4. **Settings changes** propagate through context, updating all dependent components.

## 5. Key Decisions
- **Centralized Question Generation**: All question logic is in one place for maintainability and extensibility.
- **Context for Settings**: Ensures consistent settings across all games and easy persistence.
- **TypeScript Types**: Strong typing for questions, settings, and game logic to prevent errors and ease refactoring.
- **Component Reuse**: GameBoard and other UI components are designed for reuse across game types.

## 6. Extensibility
- **Adding a Game**: Implement a new question generator in `gameUtils.ts`, add a UI page, and register it in the questionGenerators map.
- **Custom Settings**: Extend the settings context and UI to support new configuration options.
- **AI/Agent Integration**: The architecture supports future integration with AI agents for adaptive learning, analytics, or content generation. 