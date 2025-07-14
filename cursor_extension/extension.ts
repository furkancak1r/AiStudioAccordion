// C:/Users/furkan.cakir/Desktop/FurkanPRS/Kodlar/test/AiStudioAccordion/vscode_extension/extension.ts
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

class PasteViewProvider implements vscode.TreeDataProvider<PasteItem> {
	constructor() {}

	getTreeItem(element: PasteItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: PasteItem): Thenable<PasteItem[]> {
		if (!element) {
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
	
	const firstLineIndex = lines.findIndex(line => line.trim().length > 0);
    const contentLines = lines.slice(firstLineIndex + 1);

	const cleanedLines = contentLines
		.filter(line => {
			const trimmed = line.trim();
			return !trimmed.match(/^```[a-zA-Z]*$/);
		})
		.map(line => {
			return line.replace(/```$/, '');
		});
	
	while (cleanedLines.length > 0 && cleanedLines[0].trim() === '') {
		cleanedLines.shift();
	}
	
	while (cleanedLines.length > 0 && cleanedLines[cleanedLines.length - 1].trim() === '') {
		cleanedLines.pop();
	}
	
	return cleanedLines.join('\n');
}

async function handleUri(uri: vscode.Uri) {
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
		
		await handleDeepLinkContent(decodedContent, decodedFilePath);
		
	} catch (error) {
		console.error('URI handling error:', error);
		vscode.window.showErrorMessage(`VS Code URI işleme hatası: ${error}`);
	}
}

async function handleDeepLinkContent(content: string, filePath: string) {
	try {
		console.log('Starting handleDeepLinkContent with:', { filePath, contentLength: content.length });
		
		const cleanedContent = cleanMarkdownCodeBlocks(content);
		console.log('Content cleaned, new length:', cleanedContent.length);
		
		if (!vscode.workspace.workspaceFolders) {
			vscode.window.showErrorMessage('Çalışma klasörü açık değil');
			return;
		}
		
		const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
		console.log('Workspace root:', workspaceRoot);
		
		let targetPath: string;
		
		if (path.isAbsolute(filePath)) {
			targetPath = filePath;
		} else {
			targetPath = path.join(workspaceRoot, filePath);
		}
		
		console.log('Target path:', targetPath);
		
		const dirPath = path.dirname(targetPath);
		console.log('Directory path:', dirPath);
		
		if (!fs.existsSync(dirPath)) {
			console.log('Creating directory:', dirPath);
			fs.mkdirSync(dirPath, { recursive: true });
		}
		
		fs.writeFileSync(targetPath, cleanedContent, 'utf-8');
		
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

export function activate(context: vscode.ExtensionContext) {

	console.log('AiStudioCopy extension is now active!');
	
	const uriHandler = vscode.window.registerUriHandler({
		handleUri: handleUri
	});
	context.subscriptions.push(uriHandler);
	
	console.log('URI handler registered successfully for furkan.aistudiocopy');

	const pasteViewProvider = new PasteViewProvider();
	const treeView = vscode.window.createTreeView('aistudiocopy.pasteView', {
		treeDataProvider: pasteViewProvider,
		showCollapseAll: false
	});
	
	treeView.onDidChangeSelection(e => {
		if (e.selection.length > 0) {
			const selectedItem = e.selection[0];
			if (selectedItem.contextValue === 'pasteAction') {
				vscode.commands.executeCommand('aistudiocopy.pasteToFile');
			}
		}
	});

	const pasteToFileDisposable = vscode.commands.registerCommand('aistudiocopy.pasteToFile', async () => {
		try {
			const clipboardContent = await vscode.env.clipboard.readText();
			
			if (!clipboardContent.trim()) {
				vscode.window.showErrorMessage('Pano boş, kopyalanmış içerik bulunamadı');
				return;
			}

			const lines = clipboardContent.split(/\r?\n/);
			
			const firstLine = lines[0];
			const pathMatch = firstLine.match(/^(?:#|\/\/)\s*(.+\.\w+)/);
			
			if (!pathMatch) {
				vscode.window.showErrorMessage('İlk satırda dosya yolu bulunamadı.\nÖrnekler:\n// src/components/Layout.tsx\n// C:/tam/yol/Layout.tsx\n# src/utils/helper.js');
				return;
			}

			const extractedPath = pathMatch[1].trim();
			
			const cleanedContent = cleanMarkdownCodeBlocks(clipboardContent);
			
			if (!vscode.workspace.workspaceFolders) {
				vscode.window.showErrorMessage('Çalışma klasörü açık değil');
				return;
			}

			const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
			let targetPath: string;
			
			if (path.isAbsolute(extractedPath)) {
				targetPath = extractedPath;
			} else {
				targetPath = path.join(workspaceRoot, extractedPath);
			}
			
			const dirPath = path.dirname(targetPath);
			if (!fs.existsSync(dirPath)) {
				fs.mkdirSync(dirPath, { recursive: true });
			}
			
			fs.writeFileSync(targetPath, cleanedContent, 'utf-8');
			
			const document = await vscode.workspace.openTextDocument(targetPath);
			await vscode.window.showTextDocument(document);
			
			vscode.window.showInformationMessage(`Kod ${extractedPath} dosyasına yazıldı ve açıldı`);
			
		} catch (error) {
			vscode.window.showErrorMessage(`Dosya yazma hatası: ${error}`);
		}
	});

	context.subscriptions.push(pasteToFileDisposable, treeView);
}

export function deactivate() {}