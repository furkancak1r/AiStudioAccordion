```markdown
<!-- C:/Users/furkan.cakir/Desktop/FurkanPRS/Kodlar/test/AiStudioAccordion/chrome_extension/CLAUDE.md -->
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome extension called "Kod Bloğu Akordiyonu" (Code Block Accordion) that enhances the AI Studio (aistudio.google.com) user experience with multiple features:

1.  **Code Block Accordion**: Makes Angular `<pre>` blocks collapsible/expandable.
2.  **Plan Stage Management**: Adds a sidebar for creating, editing, deleting, and running multi-step plans.
3.  **Message Truncation**: Automatically shortens long user messages, expandable on click.
4.  **Prompt Area Shortcuts**: Injects "Git Command" and "Analyze Files" buttons for one-click prompts.
5.  **Automatic Model Settings**: Configures "Thinking Budget" and "Media Resolution" automatically.
6.  **Smart IDE Integration**: Adds a "Send to IDE" button that automatically loads the full code content, collapses the accordion, and then sends the complete code to VS Code or Cursor.

## Architecture

The extension uses a content script architecture with several IIFE (Immediately Invoked Function Expression) modules organized under `src/`:

-   `main.js`: The entry point. Uses a `MutationObserver` to watch for DOM changes and injects all features.
-   `ui.js`: Responsible for creating all UI elements, such as the sidebar, modals, and buttons.
-   `handlers.js`: Contains all event handler logic. The main `sendToVscode` async function is located here.
-   `state.js`: Manages the application's state (plan stages, IDE preferences).
-   `icons.js`: A central repository for all SVG icons.
-   `accordion.js`: Manages the code block accordion. Crucially, it exports helper functions like `forceLoadAndGetContent` and `collapseAccordion` via the `window.AIStudioAccordion` object for use by other modules.
-   `messages.js`: A self-contained module for the message truncation feature.

## Key Technical Patterns

### Dynamic UI Injection via MutationObserver
The core logic in `main.js` uses a `MutationObserver` to watch the DOM. When specific elements (like `div.prompt-input-wrapper-container` or `ms-settings-view`) are added, the observer triggers corresponding functions to inject new UI or modify settings.

### Smart IDE Integration via Async Workflow
The "Send to IDE" feature is a key example of inter-module communication and asynchronous control flow:
1.  The user clicks the button, triggering the `async sendToVscode` function in `handlers.js`.
2.  `sendToVscode` calls `await window.AIStudioAccordion.forceLoadAndGetContent(...)`. This function, located in `accordion.js`, programmatically scrolls the `<pre>` element to trigger AI Studio's lazy loading until all content is present in the DOM. It returns a promise that resolves with the full code content.
3.  After the content is loaded, `sendToVscode` calls `window.AIStudioAccordion.collapseAccordion()` to reset the UI.
4.  Finally, `sendToVscode` uses the fully loaded code to construct and open the `vscode://` or `cursor://` URI.
5.  Visual feedback (loading icon, success checkmark) is provided to the user throughout this process.

### Module Communication
Modules communicate primarily through a global `window` object (`window.AIStudioAccordion`) which exposes an API from the `accordion.js` module to the `handlers.js` module. This allows for clean separation of concerns, where `accordion.js` handles the DOM manipulation of the accordion, and `handlers.js` handles the user interaction logic.

## Development Commands

### Extension Loading
```bash
# Load unpacked extension in Chrome
# 1. Navigate to chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked" and select the chrome_extension directory
```

### Testing
-   Test the "Send to IDE" button on a very long code block that requires scrolling. Verify the full content arrives in the IDE.
-   Test all buttons in the prompt area (Git, Analyze).
-   Open the model settings panel to verify that "Thinking Budget" and "Media Resolution" are set automatically.
-   Use the Plan Stage sidebar to manage and send stages.

## CSS Classes
Key CSS classes for new features:
-   `.markdown-vscode-btn-fwk.processing`: Used for the spinning loading animation on the IDE button.
-   `.kod-blok-akordiyon-sarmalayici`: The wrapper for each collapsible code block.
```