// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// Tree data provider for the custom view
class PasteViewProvider implements vscode.TreeDataProvider<PasteItem> {
	constructor() {}

	getTreeItem(element: PasteItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: PasteItem): Thenable<PasteItem[]> {
		if (!element) {
			// Root level items
			return Promise.resolve([
				new PasteItem(
					'📋 Paste Code to File',
					'Click to paste clipboard content to file based on path comment',
					vscode.TreeItemCollapsibleState.None,
					'pasteAction'
				),
				new PasteItem(
					'ℹ️ Usage',
					'Copy code with path comment like: // src/file.tsx',
					vscode.TreeItemCollapsibleState.None,
					'info'
				)
			]);
		}
		return Promise.resolve([]);
	}

	private _onDidChangeTreeData: vscode.EventEmitter<PasteItem | undefined | null | void> = new vscode.EventEmitter<PasteItem | undefined | null | void>();
	readonly onDidChangeTreeData: vscode.Event<PasteItem | undefined | null | void> = this._onDidChangeTreeData.event;

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}
}

class PasteItem extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		public readonly tooltip: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly contextValue?: string,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);
		this.tooltip = tooltip;
		this.contextValue = contextValue;
	}
}

function cleanMarkdownCodeBlocks(content: string): string {
	const lines = content.split(/\r?\n/);
	
	// Remove lines that are just ``` or ```language
	const cleanedLines = lines
		.filter(line => {
			const trimmed = line.trim();
			// Skip lines that are just ``` or ```language
			return !trimmed.match(/^```[a-zA-Z]*$/);
		})
		.map(line => {
			// Remove ``` from the end of lines
			return line.replace(/```$/, '');
		});
	
	// Trim leading and trailing empty lines
	while (cleanedLines.length > 0 && cleanedLines[0].trim() === '') {
		cleanedLines.shift();
	}
	
	while (cleanedLines.length > 0 && cleanedLines[cleanedLines.length - 1].trim() === '') {
		cleanedLines.pop();
	}
	
	return cleanedLines.join('\n');
}

// Handle VS Code URI deep-links
function handleUri(uri: vscode.Uri) {
	try {
		console.log('URI received:', uri.toString());
		vscode.window.showInformationMessage(`URI alındı: ${uri.toString()}`);
		
		const query = new URLSearchParams(uri.query);
		const filePath = query.get('file');
		const content = query.get('content');
		
		console.log('Parsed parameters:', { filePath, content: content ? content.substring(0, 100) + '...' : null });
		
		if (!filePath || !content) {
			vscode.window.showErrorMessage('VS Code URI eksik parametreler: file ve content gerekli');
			return;
		}
		
		const decodedFilePath = decodeURIComponent(filePath);
		const decodedContent = decodeURIComponent(content);
		
		console.log('Decoded parameters:', { decodedFilePath, decodedContent: decodedContent.substring(0, 100) + '...' });
		
		// Process the content similar to existing pasteToFile functionality
		handleDeepLinkContent(decodedContent, decodedFilePath);
		
	} catch (error) {
		console.error('URI handling error:', error);
		vscode.window.showErrorMessage(`VS Code URI işleme hatası: ${error}`);
	}
}

async function handleDeepLinkContent(content: string, filePath: string) {
	try {
		console.log('Starting handleDeepLinkContent with:', { filePath, contentLength: content.length });
		
		// Clean the content using existing function
		const cleanedContent = cleanMarkdownCodeBlocks(content);
		console.log('Content cleaned, new length:', cleanedContent.length);
		
		if (!vscode.workspace.workspaceFolders) {
			vscode.window.showErrorMessage('Çalışma klasörü açık değil');
			return;
		}
		
		const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
		console.log('Workspace root:', workspaceRoot);
		
		let targetPath: string;
		
		// Check if the path is absolute or relative
		if (path.isAbsolute(filePath)) {
			targetPath = filePath;
		} else {
			// Relative path, join with workspace root
			targetPath = path.join(workspaceRoot, filePath);
		}
		
		console.log('Target path:', targetPath);
		
		// Create directory if it doesn't exist
		const dirPath = path.dirname(targetPath);
		console.log('Directory path:', dirPath);
		
		if (!fs.existsSync(dirPath)) {
			console.log('Creating directory:', dirPath);
			fs.mkdirSync(dirPath, { recursive: true });
		}
		
		// Write the file
		console.log('Writing file to:', targetPath);
		fs.writeFileSync(targetPath, cleanedContent, 'utf-8');
		
		// Open the file in VS Code
		console.log('Opening file in VS Code');
		const document = await vscode.workspace.openTextDocument(targetPath);
		await vscode.window.showTextDocument(document);
		
		vscode.window.showInformationMessage(`Chrome'dan gelen kod ${filePath} dosyasına yazıldı ve açıldı`);
		console.log('File creation and opening completed successfully');
		
	} catch (error) {
		console.error('Error in handleDeepLinkContent:', error);
		vscode.window.showErrorMessage(`Dosya yazma hatası: ${error}`);
	}
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('AiStudioCopy extension is now active!');
	vscode.window.showInformationMessage('AiStudioCopy extension aktif - URI handler kayıtlandı');
	
	// Register URI handler for deep-link integration
	const uriHandler = vscode.window.registerUriHandler({
		handleUri: handleUri
	});
	context.subscriptions.push(uriHandler);
	
	console.log('URI handler registered successfully');

	// Create and register the tree data provider
	const pasteViewProvider = new PasteViewProvider();
	const treeView = vscode.window.createTreeView('aistudiocopy.pasteView', {
		treeDataProvider: pasteViewProvider,
		showCollapseAll: false
	});
	
	// Listen for selection changes and trigger action immediately
	treeView.onDidChangeSelection(e => {
		if (e.selection.length > 0) {
			const selectedItem = e.selection[0];
			if (selectedItem.contextValue === 'pasteAction') {
				// Trigger paste command immediately on selection
				vscode.commands.executeCommand('aistudiocopy.pasteToFile');
			}
		}
	});

	// Register refresh command
	const refreshDisposable = vscode.commands.registerCommand('aistudiocopy.refreshView', () => {
		pasteViewProvider.refresh();
		vscode.window.showInformationMessage('AI Studio Copy view refreshed!');
	});

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('aistudiocopy.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from AiStudioCopy!');
	});

	// New command to paste markdown content to file based on path comment
	const pasteToFileDisposable = vscode.commands.registerCommand('aistudiocopy.pasteToFile', async () => {
		try {
			// Read clipboard content
			const clipboardContent = await vscode.env.clipboard.readText();
			
			if (!clipboardContent.trim()) {
				vscode.window.showErrorMessage('Pano boş, kopyalanmış içerik bulunamadı');
				return;
			}

			// Split content into lines
			const lines = clipboardContent.split(/\r?\n/);
			
			// Extract file path from first line comment
			const firstLine = lines[0];
			const pathMatch = firstLine.match(/^(?:#|\/\/)\s*(.+\.\w+)/);
			
			if (!pathMatch) {
				vscode.window.showErrorMessage('İlk satırda dosya yolu bulunamadı.\nÖrnekler:\n// src/components/Layout.tsx\n// C:/tam/yol/Layout.tsx\n# src/utils/helper.js');
				return;
			}

			const extractedPath = pathMatch[1].trim();
			
			// Clean the content
			const cleanedContent = cleanMarkdownCodeBlocks(clipboardContent);
			
			if (!vscode.workspace.workspaceFolders) {
				vscode.window.showErrorMessage('Çalışma klasörü açık değil');
				return;
			}

			const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
			let targetPath: string;
			
			// Check if the path is absolute (starts with drive letter or /)
			if (path.isAbsolute(extractedPath)) {
				targetPath = extractedPath;
			} else {
				// Relative path, join with workspace root
				targetPath = path.join(workspaceRoot, extractedPath);
			}
			
			// Create directory if it doesn't exist
			const dirPath = path.dirname(targetPath);
			if (!fs.existsSync(dirPath)) {
				fs.mkdirSync(dirPath, { recursive: true });
			}
			
			// Write the file
			fs.writeFileSync(targetPath, cleanedContent, 'utf-8');
			
			// Open the file in VS Code
			const document = await vscode.workspace.openTextDocument(targetPath);
			await vscode.window.showTextDocument(document);
			
			vscode.window.showInformationMessage(`Kod ${extractedPath} dosyasına yazıldı ve açıldı`);
			
		} catch (error) {
			vscode.window.showErrorMessage(`Dosya yazma hatası: ${error}`);
		}
	});

	context.subscriptions.push(disposable, pasteToFileDisposable, refreshDisposable, treeView);
}

// This method is called when your extension is deactivated
export function deactivate() {}