# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome extension called "Kod Bloğu Akordiyonu" (Code Block Accordion) that enhances the AI Studio (aistudio.google.com) user experience with multiple features:

1. **Code Block Accordion**: Makes Angular `<pre>` blocks collapsible/expandable
2. **Full-Code Copy**: Adds a copy button to AI Studio's toolbar for complete code copying
3. **Message Truncation**: Automatically shortens long user messages to first 10 words
4. **Clipboard Import**: Imports plan stages from clipboard via navbar button
5. **Plan Stage Management**: Manual addition, editing, and deletion of plan stages via sidebar

## Architecture

The extension uses a content script architecture with three main IIFE (Immediately Invoked Function Expression) modules:

### 1. Code Block Accordion Module (lines 1-69)
- Processes `<pre>` elements with `_ngcontent-ng-c` attributes
- Creates collapsible wrappers with toggle buttons
- Handles expand/collapse animations and accessibility

### 2. Full-Code Copy Module (lines 70-130)
- Enhances AI Studio's action bars with additional copy functionality
- Locates associated `<code>` elements and copies entire content
- Provides visual feedback with temporary button state changes

### 3. Message Truncation Module (lines 131-280)
- Automatically truncates user messages to 10 words
- Uses MutationObserver to detect new messages
- Maintains cache of original/truncated text with sessionStorage

### 4. Clipboard Import Module (lines 281-568)
- Adds import button (📋) to navbar clickable-space elements
- Parses multiple markdown formats from clipboard
- Communicates with sidebar via `window.markdownSystem` global interface

### 5. Plan Stage Management Module (lines 569-1007)
- Creates fixed sidebar for plan stage management
- Supports manual addition, editing, deletion of stages
- Handles both imported and manually created content
- Uses sessionStorage for persistence across page loads

## Key Technical Patterns

### IIFE Module Communication
Modules communicate via:
- `window.markdownSystem.importSections()` - Global interface for clipboard imports
- DOM events and MutationObservers for dynamic content detection
- SessionStorage for data persistence

### Pattern Matching System
The markdown parser supports multiple formats:
- `PLAN` - [ ] **Aşama 1: Title** (PLAN format)
- 1.1 Title (numbered format)
- - [ ] **1.1 Title** (checkbox format)
- Aşama 1: Title (stage format)
- ## 1.1 Title (header format)

### State Management
- `detectedSections`: Array of current plan stages
- `isImportedContent`: Flag to prevent auto-scanning from overwriting manual content
- `markdownCache`: SessionStorage-based cache for persistence

## Development Commands

### Extension Loading
```bash
# Load unpacked extension in Chrome
# 1. Navigate to chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked" and select this directory
```

### Syntax Checking
```bash
node -c content.js  # Check JavaScript syntax
```

### Testing
Test with `test-markdown.md` which contains sample formats the parser should recognize.

## Extension Manifest
- **Target**: aistudio.google.com only
- **Permissions**: Host permissions for AI Studio domain
- **Files**: content.js (script), styles.css (styling)
- **Execution**: document_idle (after DOM ready)

## Current Version
Version 1.7 - Features plan stage management with both clipboard import and manual addition capabilities.

## CSS Classes
Key CSS classes for styling:
- `.kod-blok-*`: Code block accordion styles
- `.ai-copy-full-btn`: Full-code copy button
- `.clipboard-import-btn-fwk`: Clipboard import button
- `.markdown-sidebar-fwk`: Plan stage sidebar
- `.markdown-*-btn-fwk`: Various sidebar buttons (add, delete, edit, copy)

## Important Notes
- The extension operates in manual mode only - no automatic content scanning
- All plan stages are either imported from clipboard or manually added by user
- SessionStorage is used for persistence, not localStorage
- Turkish language is used throughout the UI