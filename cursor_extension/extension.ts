import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

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
		console.log('🚀 URI received:', uri.toString());
		vscode.window.showInformationMessage(`URI alındı: ${uri.toString()}`);
		
		const query = new URLSearchParams(uri.query);
		const filePath = query.get('file');
		const content = query.get('content');
		
		if (!filePath || !content) {
			vscode.window.showErrorMessage('VS Code URI eksik parametreler: file ve content gerekli');
			return;
		}
		
		const decodedFilePath = decodeURIComponent(filePath);
		const decodedContent = decodeURIComponent(content);
		
		await handleDeepLinkContent(decodedContent, decodedFilePath);
		
	} catch (error) {
		console.error('❌ URI handling error:', error);
		vscode.window.showErrorMessage(`VS Code URI işleme hatası: ${error}`);
	}
}

async function handleDeepLinkContent(content: string, filePath: string) {
	try {
		console.log('📝 Starting handleDeepLinkContent with:', { filePath, contentLength: content.length });
		
		const cleanedContent = cleanMarkdownCodeBlocks(content);
		
		if (!vscode.workspace.workspaceFolders) {
			vscode.window.showErrorMessage('Çalışma klasörü açık değil');
			return;
		}
		
		const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
		
		let targetPath: string;
		
		if (path.isAbsolute(filePath)) {
			targetPath = filePath;
		} else {
			targetPath = path.join(workspaceRoot, filePath);
		}
		
		const dirPath = path.dirname(targetPath);
		
		if (!fs.existsSync(dirPath)) {
			fs.mkdirSync(dirPath, { recursive: true });
		}
		
		fs.writeFileSync(targetPath, cleanedContent, 'utf-8');
		
		const document = await vscode.workspace.openTextDocument(targetPath);
		await vscode.window.showTextDocument(document);
		
		vscode.window.showInformationMessage(`✅ Kod ${filePath} dosyasına yazıldı ve açıldı`);
		
	} catch (error) {
		console.error('❌ Error in handleDeepLinkContent:', error);
		vscode.window.showErrorMessage(`Dosya yazma hatası: ${error}`);
	}
}

export function activate(context: vscode.ExtensionContext) {
	console.log('🎉 AI Studio Copy extension is ACTIVATING!');
	
	// Status bar button ekleme
	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.text = "$(file-add) AI Studio";
	statusBarItem.command = 'aistudiocopy.pasteToFile';
	statusBarItem.tooltip = 'Paste code from clipboard to file';
	statusBarItem.show();
	console.log('✅ Status bar item created and shown');
	
	// URI handler
	const uriHandler = vscode.window.registerUriHandler({
		handleUri: handleUri
	});
	console.log('✅ URI handler registered');
	
	// Main command
	const pasteCommand = vscode.commands.registerCommand('aistudiocopy.pasteToFile', async () => {
		try {
			console.log('🔥 Paste command executed!');
			vscode.window.showInformationMessage('🔥 AI Studio Copy çalışıyor!');
			
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
			
			vscode.window.showInformationMessage(`✅ Kod ${extractedPath} dosyasına yazıldı ve açıldı`);
			
		} catch (error) {
			console.error('❌ Paste command error:', error);
			vscode.window.showErrorMessage(`Dosya yazma hatası: ${error}`);
		}
	});

	context.subscriptions.push(statusBarItem, uriHandler, pasteCommand);
	
	console.log('🎯 AI Studio Copy extension FULLY ACTIVATED!');
	vscode.window.showInformationMessage('🎯 AI Studio Copy eklentisi aktif!');
}

export function deactivate() {
	console.log('👋 AI Studio Copy extension deactivated');
}