# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AiStudioAccordion is an integrated development toolkit with Chrome extension and Cursor extension that provides seamless AI Studio (aistudio.google.com) to Cursor workflow via deep-link integration:

1. **Chrome Extension**: "Kod Bloğu Akordiyonu" - Enhances AI Studio's interface with code block management, copy functionality, and Cursor deep-link integration
2. **Cursor Extension**: "AiStudioCopy" - Handles deep-link URIs from Chrome and automatically creates/updates files in workspace

## Architecture

### Chrome Extension (`chrome_extension/`)
Content script architecture with 5 main IIFE modules:
- **Code Block Accordion**: Collapsible Angular `<pre>` blocks
- **Full-Code Copy**: Enhanced copy functionality for AI Studio toolbar
- **Message Truncation**: Auto-shortens user messages to 10 words
- **Clipboard Import**: Imports plan stages from clipboard via navbar button
- **Plan Stage Management**: Manual stage addition/editing via sidebar

**Key Files:**
- `content.js` - Main content script with all functionality (chrome_extension/content.js:1-1007)
- `manifest.json` - Chrome extension manifest (restricted to aistudio.google.com)
- `styles.css` - CSS styling for all features

### VS Code Extension (`vscode_extension/`)
TypeScript-based extension with deep-link URI handler for Chrome integration:
- **URI Handler**: Processes `vscode://furkan.aistudiocopy` deep-links from Chrome
- **Automatic File Creation**: Receives file path and content via URI parameters
- **Content Processing**: Strips markdown formatting and creates files automatically
- **Manual Mode**: Activity bar with sidebar view for clipboard-based usage

**Key Files:**
- `extension.ts` - Main extension logic with URI handler and PasteViewProvider (vscode_extension/extension.ts:1-250)
- `esbuild.js` - Build configuration using esbuild
- `package.json` - Extension manifest with URI activation events

## Development Commands

### Chrome Extension
```bash
# Load unpacked extension in Chrome
# 1. Navigate to chrome://extensions/
# 2. Enable Developer mode  
# 3. Click "Load unpacked" and select chrome_extension/ directory

# Syntax check
node -c chrome_extension/content.js
```

### VS Code Extension
```bash
# Development
cd vscode_extension/
npm run compile           # Build with type checking and linting
npm run watch            # Development with file watching
npm run package          # Production build (minified)

# Quality checks
npm run check-types      # TypeScript type checking only
npm run lint            # ESLint on source files

# Installation
vsce package            # Create .vsix package
code --install-extension aistudiocopy-x.x.x.vsix
```

## Key Technical Patterns

### Chrome ↔ VS Code Deep-Link Flow
1. **Chrome Extension**: Detects copy button click, extracts file path from code comments
2. **URI Generation**: Creates `vscode://furkan.aistudiocopy?file=...&content=...` with URL-encoded parameters
3. **Browser Navigation**: Opens VS Code URI using `window.open()`
4. **VS Code Activation**: URI triggers extension activation and `handleUri()` function
5. **File Creation**: VS Code processes URI parameters, creates directories, writes file, and opens in editor

### IIFE Module Communication (Chrome)
- Enhanced copy button with deep-link integration (chrome_extension/content.js:95-146)
- `window.markdownSystem.importSections()` - Global interface for clipboard imports
- DOM events and MutationObservers for dynamic content detection
- SessionStorage for data persistence across page loads

### Markdown Pattern Matching (Chrome)
Supports multiple formats:
- `PLAN` - [ ] **Aşama 1: Title** (PLAN format)
- `1.1 Title` (numbered format)
- `- [ ] **1.1 Title**` (checkbox format)
- `Aşama 1: Title` (stage format)
- `## 1.1 Title` (header format)

### Content Processing Pipeline (VS Code)
**Manual Mode (Clipboard)**:
1. Read clipboard content
2. Extract file path from first line (supports `//` and `#` comments)
3. Clean markdown code blocks using regex patterns
4. Create target directory structure recursively
5. Write cleaned content and open file in editor

**Automatic Mode (Deep-Link)**:
1. Receive URI parameters: file path and content
2. URL-decode parameters
3. Clean markdown code blocks using existing pipeline
4. Resolve absolute vs workspace-relative paths
5. Create target directory structure recursively
6. Write cleaned content and open file in editor
7. Show success message with file path

## State Management

### Chrome Extension
- `detectedSections`: Array of current plan stages
- `isImportedContent`: Flag to prevent auto-scanning conflicts
- `markdownCache`: SessionStorage-based persistence

### VS Code Extension
- `registerUriHandler()`: Handles `vscode://furkan.aistudiocopy` deep-links
- `handleUri()`: Processes URI parameters and triggers file creation
- `handleDeepLinkContent()`: Automatic file processing from Chrome
- `PasteViewProvider`: TreeDataProvider for sidebar UI (manual mode)
- Path resolution: Handles both absolute and workspace-relative paths
- Error handling with Turkish language user feedback

## Extension Manifests

### Chrome (manifest.json)
- **Target**: aistudio.google.com only
- **Version**: Manifest V3 (v2.1)
- **Execution**: document_idle timing
- **Permissions**: Host permissions for AI Studio domain (no special permissions needed for deep-links)

### VS Code (package.json)
- **Publisher**: furkan (for `vscode://furkan.aistudiocopy` URI scheme)
- **Commands**: `aistudiocopy.pasteToFile`, `aistudiocopy.refreshView`
- **Activation**: Command execution, sidebar view interaction, or `onUri` (deep-links)
- **Engine**: VS Code ^1.74.0
- **Category**: Other

## Build System

### Chrome Extension
- Vanilla JavaScript (ES6+ with IIFE modules)
- CSS for styling with specific class prefixes (`.kod-blok-*`, `.markdown-*-fwk`)

### VS Code Extension
- **esbuild**: Fast TypeScript compilation
- **Entry**: `extension.ts` → `dist/extension.js`
- **Format**: CommonJS with `vscode` module external
- **Development**: Source maps enabled, watch mode available
- **Production**: Minified, no source maps

## Testing Files
- `chrome_extension/test-markdown.md` - Sample formats for testing markdown parser

## Current Versions
- Chrome Extension: v2.1 (with deep-link integration)
- VS Code Extension: v0.1.0 (with URI handler)

## Important Notes
- **Chrome ↔ VS Code Integration**: Uses standard VS Code deep-link URIs (no special setup required)
- Chrome extension operates in manual mode only (no automatic content scanning)
- All plan stages are either imported from clipboard or manually added
- VS Code extension requires active workspace for file operations
- Turkish language is used throughout both UIs
- SessionStorage (not localStorage) is used for Chrome extension persistence
- Deep-link integration works cross-platform (Windows, macOS, Linux)

## Usage Workflow
1. Add file path comment to code in AI Studio (e.g., `// src/components/Button.tsx`)
2. Click 📋 copy button in Chrome extension
3. Code is copied to clipboard AND VS Code opens automatically
4. File is created in workspace and opened in VS Code editor
5. Success message confirms file creation

## Testing
See `TEST.md` for complete testing instructions and manual URI testing methods.