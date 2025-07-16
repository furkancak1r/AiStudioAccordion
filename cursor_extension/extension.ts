import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

function cleanMarkdownCodeBlocks(content: string): string {
	// Eğer içerik markdown kod bloğu değilse, olduğu gibi döndür
	if (!content.includes('```')) {
		return content;
	}
	
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
		const query = new URLSearchParams(uri.query);
		const filePath = query.get('file');

		if (!filePath) {
			const errorMsg = 'VS Code URI eksik parametre: file gerekli';
			vscode.window.showErrorMessage(errorMsg);
			return;
		}

		// Önce URI'den content parametresini oku, yoksa clipboard'dan
		let content = query.get('content');
		if (content) {
			content = decodeURIComponent(content);
		} else {
			content = await vscode.env.clipboard.readText();
			if (!content) {
				vscode.window.showInformationMessage('Pano boş. Lütfen AI Studio\'dan kodu tekrar gönderin.');
				return;
			}
		}
		
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
		vscode.window.showErrorMessage(`VS Code URI işleme hatası: ${error}`);
	}
}

export function activate(context: vscode.ExtensionContext) {
	vscode.window.showInformationMessage('🎯 AI Studio Copy extension activated!');
	
	// Status bar button ekleme
	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.text = "$(file-add) AI Studio";
	statusBarItem.command = 'aistudiocopy.pasteToFile';
	statusBarItem.tooltip = 'Paste code from clipboard to file';
	statusBarItem.show();
	
	// URI handler
	const uriHandler = vscode.window.registerUriHandler({
		handleUri: handleUri
	});
	
	// Main command
	const pasteCommand = vscode.commands.registerCommand('aistudiocopy.pasteToFile', async () => {
		try {
			
			const clipboardContent = await vscode.env.clipboard.readText();
			
			if (!clipboardContent.trim()) {
				vscode.window.showErrorMessage('Pano boş, kopyalanmış içerik bulunamadı');
				return;
			}

			const lines = clipboardContent.split(/\r?\n/);
			const firstLine = lines[0];
			const pathMatch = firstLine.match(/^(?:\/\/\s*(.+\.\w+)|#\s*(.+\.\w+)|\/\*\s*(.+\.\w+)\s*\*\/|<!--\s*(.+\.\w+)\s*-->|--\s*(.+\.\w+)|%\s*(.+\.\w+))/);
			
			if (!pathMatch) {
				vscode.window.showErrorMessage('İlk satırda dosya yolu bulunamadı.\nÖrnekler:\n// src/components/Layout.tsx\n# src/utils/helper.js\n/* src/styles/app.css */\n<!-- src/templates/page.html -->\n-- src/queries/data.sql\n% src/scripts/process.m');
				return;
			}

			// Extract the file path from the appropriate capture group
			const extractedPath = (pathMatch[1] || pathMatch[2] || pathMatch[3] || pathMatch[4] || pathMatch[5] || pathMatch[6] || '').trim();
			if (!extractedPath) {
				vscode.window.showErrorMessage('İlk satırda dosya yolu bulunamadı.\nÖrnekler:\n// src/components/Layout.tsx\n# src/utils/helper.js\n/* src/styles/app.css */\n<!-- src/templates/page.html -->\n-- src/queries/data.sql\n% src/scripts/process.m');
				return;
			}
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
			vscode.window.showErrorMessage(`Dosya yazma hatası: ${error}`);
		}
	});

	context.subscriptions.push(statusBarItem, uriHandler, pasteCommand);
}

export function deactivate() {}