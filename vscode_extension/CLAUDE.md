# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Studio Copy is a VS Code extension that allows users to paste clipboard content containing markdown-formatted code directly to files based on path comments. The extension parses the first line of clipboard content to extract file paths and automatically creates the necessary directory structure.

## Development Commands

### Building and Packaging
- `npm run compile` - Build the extension with type checking and linting
- `npm run package` - Build for production (minified, no sourcemaps)
- `npm run watch` - Start development with file watching
- `vsce package` - Create .vsix package for installation

### Quality Checks
- `npm run check-types` - Run TypeScript type checking only
- `npm run lint` - Run ESLint on source files

### Installation and Development
- `code --install-extension aistudiocopy-x.x.x.vsix` - Install packaged extension
- `code --uninstall-extension furkan.aistudiocopy` - Remove existing version

## Architecture

### Core Components

**Extension Entry Point** (`src/extension.ts`):
- `activate()` function registers all commands and UI components
- `PasteViewProvider` implements TreeDataProvider for the sidebar view
- `cleanMarkdownCodeBlocks()` strips markdown formatting from clipboard content

**Main Functionality**:
1. **Path Extraction**: Parses first line for `// path/to/file.ext` or `# path/to/file.ext`
2. **Path Resolution**: Handles both absolute paths (`C:/...`) and relative paths within workspace
3. **Content Processing**: Removes markdown code blocks (`````, ````javascript`, etc.) and trailing ```
4. **File Operations**: Creates directories recursively and writes cleaned content

### VS Code Integration

**Commands**:
- `aistudiocopy.pasteToFile` - Main functionality (clipboard → file)
- `aistudiocopy.refreshView` - Refresh sidebar view
- `aistudiocopy.helloWorld` - Debug command

**UI Components**:
- **Activity Bar**: Custom container with file-code icon
- **Sidebar View**: "Code Paster" tree view with clickable items
- **Single-click Activation**: Uses `onDidChangeSelection` to trigger paste immediately

**Activation**: Triggered by command execution or sidebar view interaction

## Key Implementation Details

### Content Processing Pipeline
1. Read clipboard content
2. Extract file path from first line (supports `//` and `#` comments)
3. Determine if path is absolute or relative to workspace
4. Clean markdown code blocks using regex patterns:
   - Remove lines matching `^```.*$`
   - Remove trailing ``` from code lines
   - Trim leading/trailing empty lines
5. Create target directory structure
6. Write cleaned content and open file

### Path Handling
- **Absolute paths**: Use as-is with path separator normalization
- **Relative paths**: Join with workspace root
- **Windows compatibility**: Handles drive letters (`C:`, `D:`, etc.)

### Error Handling
- Turkish language error messages for user experience
- Validates clipboard content, workspace availability, and path format
- Graceful fallbacks for missing directories or invalid paths

## Build System

Uses esbuild for fast compilation:
- **Entry**: `src/extension.ts`
- **Output**: `dist/extension.js` (CommonJS format)
- **External**: VS Code API (`vscode` module)
- **Development**: Source maps enabled, watch mode available
- **Production**: Minified, no source maps