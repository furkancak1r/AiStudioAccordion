import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

function cleanMarkdownCodeBlocks(content: string): string {
	const lines = content.split(/\r?\n/);
	
	// Find the index of the first non-empty line.
	const firstLineIndex = lines.findIndex(line => line.trim().length > 0);
	if (firstLineIndex === -1) {
		return ''; // Content is empty or just whitespace
	}

	// The code is everything after that first line (which is the path comment).
	const codeLines = lines.slice(firstLineIndex + 1);
	
	return codeLines.join('\n');
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
    await vscode.window.showTextDocument(document, {
      preview: false,
      preserveFocus: false,
      viewColumn: vscode.ViewColumn.Active,
    });
		
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
			const pathMatch = firstLine.match(/^(?:\/\/\s*(.*)|#\s*(.*)|\/\*\s*(.*?)\s*\*\/|<!--\s*(.*?)\s*-->|--\s*(.*)|%\s*(.*))/);
			
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
            await vscode.window.showTextDocument(document, {
                preview: false,
                preserveFocus: false,
                viewColumn: vscode.ViewColumn.Active,
            });
			
			vscode.window.showInformationMessage(`✅ Kod ${extractedPath} dosyasına yazıldı ve açıldı`);
			
		} catch (error) {
			vscode.window.showErrorMessage(`Dosya yazma hatası: ${error}`);
		}
	});

    // Copy Problems (Diagnostics) with code snippets
    const copyProblemsCommand = vscode.commands.registerCommand('aistudiocopy.copyProblemsWithCode', async () => {
        try {
            // Always use workspace scope (no prompt)
            const scope = { label: 'Entire workspace', value: 'workspace' } as const;

            const workspaceFolders = vscode.workspace.workspaceFolders;
            const workspaceRoot = workspaceFolders && workspaceFolders.length > 0 ? workspaceFolders[0].uri.fsPath : undefined;
            const relPath = (uri: vscode.Uri) => {
                if (workspaceRoot) {
                    try { return path.relative(workspaceRoot, uri.fsPath) || uri.fsPath; } catch { return uri.fsPath; }
                }
                return uri.fsPath;
            };

            const severityText = (s: vscode.DiagnosticSeverity) => {
                switch (s) {
                    case vscode.DiagnosticSeverity.Error: return 'Error';
                    case vscode.DiagnosticSeverity.Warning: return 'Warning';
                    case vscode.DiagnosticSeverity.Information: return 'Info';
                    case vscode.DiagnosticSeverity.Hint: return 'Hint';
                    default: return 'Unknown';
                }
            };

            // Proactively load workspace files so diagnostics include closed files
            const includeGlobs = [
                '**/*.{ts,tsx,js,jsx,vue,svelte,css,scss,less,html,md,markdown,json,jsonc}',
                '**/*.{py,java,kt,cs,cpp,c,h,hpp,mm,m,swift,rs,go,rb,php}',
                '**/*.{xml,yml,yaml,toml,ini,gradle,cmake,make,mak,sql,sh,bat,ps1}'
            ];
            const excludeGlob = '{**/.git/**,**/node_modules/**,**/dist/**,**/build/**,**/out/**,**/.next/**,**/.venv/**,**/__pycache__/**,**/.mypy_cache/**,**/.turbo/**,**/.cache/**}';

            const discoverUris: vscode.Uri[] = [];
            for (const g of includeGlobs) {
                const found = await vscode.workspace.findFiles(g, excludeGlob);
                discoverUris.push(...found);
            }

            // Open in small batches to trigger LSP diagnostics without UI
            const batchSize = 20;
            for (let i = 0; i < discoverUris.length; i += batchSize) {
                const batch = discoverUris.slice(i, i + batchSize);
                await Promise.all(batch.map(u => vscode.workspace.openTextDocument(u).then(() => undefined, () => undefined)));
            }

            // Small delay to allow providers to compute diagnostics
            const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
            await wait(600);

            type Item = { uri: vscode.Uri; diagnostic: vscode.Diagnostic };
            let items: Item[] = [];

            // Workspace diagnostics only
            for (const [uri, diags] of vscode.languages.getDiagnostics()) {
                for (const d of diags) items.push({ uri, diagnostic: d });
            }

            if (items.length === 0) {
                vscode.window.showInformationMessage('No problems found to copy.');
                return;
            }

            // Load documents (cache per file)
            const docCache = new Map<string, vscode.TextDocument>();
            const getDoc = async (uri: vscode.Uri) => {
                const key = uri.toString();
                const cached = docCache.get(key);
                if (cached) return cached;
                const doc = await vscode.workspace.openTextDocument(uri);
                docCache.set(key, doc);
                return doc;
            };

            const parts: string[] = [];
            for (const { uri, diagnostic } of items) {
                let text = '';
                try {
                    const doc = await getDoc(uri);
                    // Include one line before and after the diagnostic range
                    const startLine = Math.max(0, diagnostic.range.start.line - 1);
                    const endLine = Math.min(doc.lineCount - 1, diagnostic.range.end.line + 1);
                    const startPos = new vscode.Position(startLine, 0);
                    const endPos = new vscode.Position(endLine, doc.lineAt(endLine).text.length);
                    text = doc.getText(new vscode.Range(startPos, endPos));
                } catch {
                    // ignore failures to open doc
                }

                const pos = diagnostic.range.start;
                const loc = `${relPath(uri)}:${pos.line + 1}:${pos.character + 1}`;
                const sev = severityText(diagnostic.severity);
                const src = diagnostic.source ? ` ${diagnostic.source}` : '';
                const code = typeof diagnostic.code === 'object' && diagnostic.code !== null
                    ? (diagnostic.code as any).value ?? ''
                    : (diagnostic.code ?? '');
                const codeStr = code ? ` (${code})` : '';

                parts.push(
                    `${loc} [${sev}] ${diagnostic.message}${src}${codeStr}`,
                    text ? `${text}` : '',
                    '———'
                );
            }

            const output = parts.join('\n');
            await vscode.env.clipboard.writeText(output);
            vscode.window.showInformationMessage(`Copied ${items.length} problem(s) with code to clipboard.`);
        } catch (err) {
            vscode.window.showErrorMessage(`Copy Problems failed: ${err}`);
        }
    });

	context.subscriptions.push(statusBarItem, uriHandler, pasteCommand, copyProblemsCommand);
}

export function deactivate() {}
