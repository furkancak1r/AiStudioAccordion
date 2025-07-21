```markdown
# C:/Users/furkan.cakir/Desktop/FurkanPRS/Kodlar/test/AiStudioAccordion/chrome_extension/CLAUDE.md
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome extension called "Kod Bloğu Akordiyonu" (Code Block Accordion) that enhances the AI Studio (aistudio.google.com) user experience with multiple features:

1.  **Code Block Accordion**: Makes Angular `<pre>` blocks collapsible/expandable.
2.  **Plan Stage Management**: Adds a sidebar for creating, editing, deleting, and running multi-step plans. Supports importing stages from clipboard.
3.  **Message Truncation**: Automatically shortens long user messages to the first 10 words, expandable on click.
4.  **Prompt Area Shortcuts**: Injects "Git Command" and "Analyze Files" buttons next to the "Run" button for one-click prompt submission.
5.  **Automatic Model Settings**: On page load or when the settings panel is opened, it automatically enables "Thinking Budget" to its max value and sets "Media Resolution" to "Medium".
6.  **IDE Integration**: Adds a "Send to VS Code/Cursor" button to code blocks for seamless transfer of code to a local editor via deep-links.

## Architecture

The extension uses a content script architecture with several IIFE (Immediately Invoked Function Expression) modules organized under `src/`:

-   `main.js`: The entry point. It uses a `MutationObserver` to watch for DOM changes and injects all features at the appropriate time by calling functions from other modules. It orchestrates the enhancement of the prompt area, code blocks, and model settings panel.
-   `ui.js`: Responsible for creating all UI elements, such as the sidebar, modals, and all custom buttons (`createGitCommitButton`, `createAnalyzeFilesButton`, etc.).
-   `handlers.js`: Contains all event handler logic. This includes functions for button clicks (`sendGitCommitPrompt`, `sendAnalyzeFilesPrompt`), plan stage management (add, delete, copy), and IDE integration (`sendToVscode`).
-   `state.js`: Manages the application's state, including plan stages and IDE preferences, using `sessionStorage` and `localStorage` for persistence.
-   `icons.js`: A central repository for all SVG icons used in the UI.
-   `accordion.js` & `messages.js`: Self-contained modules for the code block accordion and message truncation features, respectively.

## Key Technical Patterns

### Dynamic UI Injection via MutationObserver
The core of the extension's logic resides in `main.js`. A single, powerful `MutationObserver` watches the entire `document.documentElement`. When specific elements (like `div.prompt-input-wrapper-container` or `ms-settings-view`) are added to the DOM, the observer triggers corresponding functions (`enhancePromptInputArea`, `configureModelSettings`) to inject new UI elements or modify existing ones.

### Programmatic Control of Angular Material Components
The `configureModelSettings` function in `main.js` demonstrates how to control complex, third-party components. It programmatically simulates user clicks (`element.click()`) and dispatches `input` and `change` events to ensure that Angular's change detection recognizes the new values for components like `mat-slide-toggle` and `mat-select`.

### Prompt Area Enhancement
The `enhancePromptInputArea` function is called by the observer to inject custom buttons. It creates wrappers for the new buttons and inserts them before the "Run" button's wrapper, ensuring a consistent layout. It uses a `dataset` flag (`data-prompt-enhanced`) to prevent re-injection.

### State Management
-   `sessionStorage` is used for non-critical session data like plan stages (`markdownCache`).
-   `localStorage` (via `chrome.storage.local`) is used for persistent user settings like `selectedIDE` and `systemInstructions`.

## Development Commands

### Extension Loading
```bash
# Load unpacked extension in Chrome
# 1. Navigate to chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked" and select the chrome_extension directory
```

### Testing
-   Test all buttons in the prompt area (Git, Analyze).
-   Open the model settings panel to verify that "Thinking Budget" and "Media Resolution" are set automatically.
-   Use the Plan Stage sidebar to add, edit, and send stages.
-   Use the "Send to IDE" button on code blocks.

## CSS Classes
Key CSS classes for new features:
-   `.git-commit-btn-fwk`: The Git command shortcut button.
-   `.analyze-files-btn-fwk`: The file analysis shortcut button.
```