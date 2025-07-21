// C:/Users/furkan.cakir/Desktop/FurkanPRS/Kodlar/test/AiStudioAccordion/chrome_extension/src/handlers.js
function addSection(content = '', startEditing = false) {
  if (isSidebarCollapsed) {
    toggleSidebar();
  }
  detectedSections.push(content);
  renderSections();
  if (startEditing) {
    const newIndex = detectedSections.length - 1;
    createEditModal(newIndex);
  }
}

function deleteSection(index) {
  detectedSections.splice(index, 1);
  renderSections();
}

function copySection(index) {
  const text = "go " + detectedSections[index] + ", yalnızca kod bloğu döndür. ilk satırda dosya yolunu dosya diline uygun yorum satırı olarak yaz. kod bloğu dışında hiçbir metin yazma. \"File:\" yazma. ng-star-inserted ekleme.";
  navigator.clipboard.writeText(text).then(() => {
    const copyBtn = body.querySelector(`[data-index='${index}'] .markdown-copy-btn-fwk`);
    if (copyBtn) {
      const originalContent = copyBtn.innerHTML;
      copyBtn.innerHTML = ICONS.save;
      copyBtn.disabled = true;
      setTimeout(() => {
        copyBtn.innerHTML = originalContent;
        copyBtn.disabled = false;
      }, 1500);
    }
  });
}

function clearAllSections() {
  detectedSections = [];
  renderSections();
}

function toggleSidebar() {
  isSidebarCollapsed = !isSidebarCollapsed;
  sidebar.classList.toggle('collapsed', isSidebarCollapsed);
  toggleBtn.style.transform = isSidebarCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)';
  updateCache();
}

async function importFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    if (text.trim()) {
      detectedSections.push(text.trim());
      renderSections();
      if (isSidebarCollapsed) {
        toggleSidebar();
      }
    } else {
      alert('Pano boş.');
    }
  } catch (err) {
    console.error('Pano okuma hatası:', err);
    alert('Panoya erişilemedi veya izin verilmedi.');
  }
}

async function sendToPrompt(index) {
    const text = detectedSections[index];
    if (!text) return;
  
    const systemInstructions = await getSystemInstructions();
    let promptText = `go ${text}, yalnızca kod bloğu döndür. ilk satırda dosya yolunu dosya diline uygun yorum satırı olarak yaz. kod bloğu dışında hiçbir metin yazma. "File:" yazma. ng-star-inserted ekleme.`;
    
    if (systemInstructions.trim()) {
      promptText += `\n\nSistem talimatları: ${systemInstructions}`;
    }
    
    const textarea = document.querySelector('textarea.textarea.gmat-body-medium');
    const runButton = document.querySelector('run-button button[type="submit"]');
  
    if (textarea && runButton) {
      textarea.value = promptText;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      
      setTimeout(() => {
        if (!runButton.disabled) {
            runButton.click();
            // Plan aşamasını listeden sil
            detectedSections.splice(index, 1);
            renderSections();
        }
      }, 100);
    } else {
      console.error('Prompt textarea veya run butonu bulunamadı.');
    }
}

async function sendGitCommitPrompt() {
    const promptText = 'git add . git commit -m "" git push kodlarını ver';
    const textarea = document.querySelector('textarea.textarea.gmat-body-medium');
    const runButton = document.querySelector('run-button button[type="submit"]');

    if (textarea && runButton) {
        textarea.value = promptText;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        
        setTimeout(() => {
            if (!runButton.disabled) {
                runButton.click();
            }
        }, 100);
    } else {
        console.error('Prompt textarea veya run butonu bulunamadı.');
    }
}

async function sendAnalyzeFilesPrompt() {
    const appendText = ' burası ile ilgili tüm dosyaları tespit et. Her satırın başında \'#\' olacak şekilde dosya yolları listesini paylaş. Kod bloğu içinde ver. Genel bilgileri de ekle, örneğin remember, package.json, gemini.md, prd.md';
    const textarea = document.querySelector('textarea.textarea.gmat-body-medium');
    const runButton = document.querySelector('run-button button[type="submit"]');

    if (textarea && runButton) {
        textarea.value += appendText;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        
        setTimeout(() => {
            if (!runButton.disabled) {
                runButton.click();
            }
        }, 100);
    } else {
        console.error('Prompt textarea veya run butonu bulunamadı.');
    }
}


async function sendToVscode(event) {
  console.log('🚀 sendToVscode started');
  
  const button = event.currentTarget;
  const codeBlockElement = button.closest('ms-code-block');
  if (!codeBlockElement) {
    alert('İlişkili kod bloğu bulunamadı.');
    return;
  }
  
  const codeElement = codeBlockElement.querySelector('code');
  if (!codeElement) {
    alert('Kod içeriği bulunamadı.');
    return;
  }

  const fullCode = codeElement.textContent || '';
  const lines = fullCode.split('\n');
  const firstLine = lines[0].trim();

  const pathMatch = firstLine.match(/^(?:\/\/\s*(.*)|#\s*(.*)|\/\*\s*(.*?)\s*\*\/|<!--\s*(.*?)\s*-->|--\s*(.*)|%\s*(.*))/);
  if (!pathMatch) {
    alert('Kodun ilk satırında geçerli bir dosya yolu yorumu bulunamadı.\nÖrnekler:\n// src/app.js\n# src/app.py\n/* src/app.css */\n<!-- src/app.html -->\n-- src/app.sql\n% src/app.m');
    return;
  }
  
  const filePath = (pathMatch[1] || pathMatch[2] || pathMatch[3] || pathMatch[4] || pathMatch[5] || pathMatch[6] || '').trim();
  
  if (!filePath) {
    alert('Kodun ilk satırında geçerli bir dosya yolu yorumu bulunamadı.\nÖrnekler:\n// src/app.js\n# src/app.py\n/* src/app.css */\n<!-- src/app.html -->\n-- src/app.sql\n% src/app.m');
    return;
  }
  
  try {
    await navigator.clipboard.writeText(fullCode);
    
    const encodedPath = encodeURIComponent(filePath);
    const currentIDE = getSelectedIDE();
    const uriScheme = currentIDE === 'cursor' ? 'cursor' : 'vscode';
    
    let uri;
    if (fullCode.length > 1000) {
      // Uzun content - sadece clipboard kullan
      uri = `${uriScheme}://furkan.aistudiocopy?file=${encodedPath}`;
      console.log(`🚀 URI (${uriScheme}) açılıyor (clipboard mode): ${filePath} - ${fullCode.length} karakter`);
    } else {
      // Kısa content - URI'ye content ekle
      const encodedContent = encodeURIComponent(fullCode);
      uri = `${uriScheme}://furkan.aistudiocopy?file=${encodedPath}&content=${encodedContent}`;
      console.log(`🚀 URI (${uriScheme}) açılıyor (URI mode): ${filePath} - ${fullCode.length} karakter`);
    }
    
    window.open(uri, '_self');

    const iconSpan = button.querySelector('.material-symbols-outlined');
    if (iconSpan) {
        button.disabled = true;
        iconSpan.textContent = 'check';

        setTimeout(() => {
          iconSpan.innerHTML = window.ICONS.vscode;
          button.disabled = false;
        }, 2000);
    }
  } catch (error) {
    console.error('❌ URI açma veya panoya kopyalama hatası:', error);
    alert('İşlem başarısız: ' + error.message + '\n\nTarayıcı konsolunu kontrol edin (F12).');
  }
}

function addSelectedTextToStages(selectedText) {
  if (!selectedText) return;
  
  if (isSidebarCollapsed) {
    toggleSidebar();
  }
  
  detectedSections.push(selectedText);
  renderSections();
  updateCache();
  
  // Visual feedback
  const message = document.createElement('div');
  message.className = 'selection-feedback-fwk';
  message.textContent = 'Plan aşamalarına eklendi!';
  message.style.position = 'fixed';
  message.style.top = '20px';
  message.style.right = '20px';
  message.style.zIndex = '10001';
  document.body.appendChild(message);
  
  setTimeout(() => {
    message.remove();
  }, 2000);
}

async function sendSelectedTextToPrompt(selectedText) {
  if (!selectedText) return;
  
  const systemInstructions = await getSystemInstructions();
  let promptText = `go ${selectedText}, yalnızca kod bloğu döndür. ilk satırda dosya yolunu dosya diline uygun yorum satırı olarak yaz. kod bloğu dışında hiçbir metin yazma. "File:" yazma. ng-star-inserted ekleme.`;
  
  if (systemInstructions.trim()) {
    promptText += `\n\nSistem talimatları: ${systemInstructions}`;
  }
  
  const textarea = document.querySelector('textarea.textarea.gmat-body-medium');
  const runButton = document.querySelector('run-button button[type="submit"]');
  
  if (textarea && runButton) {
    textarea.value = promptText;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    
    setTimeout(() => {
      if (!runButton.disabled) {
        runButton.click();
      }
    }, 100);
  } else {
    console.error('Prompt textarea veya run butonu bulunamadı.');
  }
}