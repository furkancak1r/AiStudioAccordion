# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AiStudioAccordion is a tool suite consisting of two complementary extensions designed to enhance the Google AI Studio workflow:

1. **Chrome Extension** - Adds a "Plan Stages" (Plan Aşamaları) manager to the AI Studio interface, enabling multi-step task planning and execution
2. **VS Code Extension** - Handles deep-links from the Chrome extension and clipboard imports to automatically create/update files in the local development environment

The project facilitates seamless workflow from AI-assisted planning in Google AI Studio to code implementation in VS Code.

## Repository Structure

```
/
├── chrome_extension/     # Chrome extension for AI Studio
│   ├── src/             # Modular JavaScript source files
│   │   ├── icons.js     # SVG icon definitions
│   │   ├── state.js     # State management with sessionStorage
│   │   ├── ui.js        # UI components (sidebar, modals, buttons)
│   │   ├── handlers.js  # Event handlers for user interactions
│   │   └── main.js      # Entry point and initialization
│   ├── manifest.json    # Chrome extension manifest v3
│   └── styles.css       # Extension styling
│
├── cursor_extension/    # VS Code extension (Cursor IDE compatible)
│   ├── extension.ts     # Main extension logic
│   ├── package.json     # Extension manifest and dependencies
│   ├── tsconfig.json    # TypeScript configuration
│   └── esbuild.js       # Build configuration
│
├── prd.md              # Product Requirements Document (Turkish)
└── GEMINI.md           # Technical guide for AI assistants (Turkish)
```

## Development Commands

### Chrome Extension
```bash
# No build step required - pure JavaScript
# To load in Chrome:
# 1. Open chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked" and select chrome_extension/ directory
# 4. Navigate to https://aistudio.google.com to test
```

### VS Code Extension (Cursor Extension)
```bash
# Install dependencies
npm install

# Development build with watch mode
npm run watch

# Production build
npm run compile

# Lint TypeScript code
npm run lint

# Package extension (requires vsce)
vsce package
```

## Architecture and Key Components

### Chrome Extension Architecture

The Chrome extension uses a modular IIFE pattern with five main modules:

1. **State Management** (`state.js`): Persists plan stages in sessionStorage
2. **UI Components** (`ui.js`): Creates sidebar, modals, and dynamic UI elements
3. **Event Handlers** (`handlers.js`): Manages user interactions (add, edit, delete, send to prompt)
4. **Icons** (`icons.js`): Centralized SVG icon definitions
5. **Main** (`main.js`): Initializes extension using MutationObserver to detect AI Studio page load

Key features:
- Integrates into AI Studio's left navigation panel below "History"
- Collapsible/expandable plan stages section
- Modal-based editing for plan stages
- One-click execution with "go " prefix automation
- Clipboard import functionality
- Deep-link generation for VS Code integration

### VS Code Extension Architecture

The VS Code extension provides two main functionalities:

1. **URI Handler**: Listens for `vscode://furkan.aistudiocopy` deep-links with file path and content parameters
2. **Manual Paste Command**: Parses clipboard content with path comments (e.g., `// src/file.ts`)

Key features:
- Automatic directory creation
- Markdown code block cleaning
- Tree view in Explorer sidebar for easy access
- Support for both absolute and relative paths
- Turkish UI messages

## Important Implementation Details

### Chrome Extension
- Uses `sessionStorage` for state persistence (not `localStorage`)
- Monitors DOM changes with `MutationObserver` to detect AI Studio's dynamic content
- Injects UI elements only when `ms-app` element is present
- Automatically adds "go " prefix when sending stages to prompt
- Handles VS Code button creation in AI Studio's action bars

### VS Code Extension
- Registers as URI handler for `furkan.aistudiocopy` scheme
- Strips markdown code fences and cleans content before writing
- Creates directories recursively if they don't exist
- Opens created/updated files automatically in editor
- Provides visual feedback through VS Code's notification system

## Testing Approach

### Chrome Extension
- Manual testing by loading unpacked extension and using AI Studio
- Test all CRUD operations for plan stages
- Verify sessionStorage persistence across page refreshes
- Test clipboard import with various text formats

### VS Code Extension
- Test URI handling with sample deep-links
- Test clipboard paste command with various path formats
- Verify directory creation and file writing
- Test with both absolute and relative paths

## Common Issues and Solutions

1. **Chrome Extension not appearing**: Ensure you're on https://aistudio.google.com and the extension is enabled
2. **VS Code deep-links not working**: Check that VS Code is set as the default handler for `vscode://` URLs
3. **Clipboard import failing**: Verify the first line contains a valid file path comment
4. **UI elements not injecting**: The AI Studio page structure may have changed - check for `ms-app` element

## Language and Localization

- UI text is primarily in Turkish (plan stages = "Plan Aşamaları", etc.)
- Code comments and technical documentation are in English
- Error messages and user notifications are in Turkish