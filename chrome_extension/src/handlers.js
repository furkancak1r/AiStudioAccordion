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
      showNotification('Pano boş.', 'warning');
    }
  } catch (err) {
    console.error('Pano okuma hatası:', err);
    showNotification('Panoya erişilemedi veya izin verilmedi.', 'error');
  }
}

async function sendToPrompt(index, sequential = false) {
    const text = detectedSections[index];
    if (!text) return Promise.resolve();
  
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
      
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (!runButton.disabled) {
            runButton.click();
            
            if (!sequential) {
              // Tekil gönderimde aşamayı sil
              detectedSections.splice(index, 1);
              renderSections();
              resolve();
            } else {
              // Sequential gönderimde AI'ın yanıt vermesini bekle
              waitForAIResponse().then(() => {
                resolve();
              }).catch((error) => {
                console.error('AI yanıt bekleme hatası:', error);
                reject(error);
              });
            }
          } else {
            reject(new Error('Run button disabled'));
          }
        }, 100);
      });
    } else {
      console.error('Prompt textarea veya run butonu bulunamadı.');
      return Promise.reject(new Error('Prompt elements not found'));
    }
}

function waitForAIResponse() {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 120; // 2 dakika bekle
        const checkInterval = 500; // Her 500ms kontrol et
        let responseDetected = false;
        
        // Run button'ın durumunu izle
        const checkForResponse = () => {
            attempts++;
            
            if (responseDetected) {
                return;
            }
            
            // Run button'ı bul
            const runButton = document.querySelector('run-button button[type="submit"]');
            
            if (runButton) {
                // Button disabled ve "Run" yazıyor mu kontrol et
                const isDisabled = runButton.hasAttribute('disabled') || runButton.getAttribute('aria-disabled') === 'true';
                const buttonLabel = runButton.querySelector('.label');
                const labelText = buttonLabel ? buttonLabel.textContent.trim() : '';
                
                // Button class'larını kontrol et
                const hasDisabledClass = runButton.classList.contains('disabled');
                const hasNoTimerClass = runButton.classList.contains('no-timer');
                
                // Typing indicator yok mu kontrol et
                const isTyping = document.querySelector('div[data-testid="typing-indicator"]');
                
                // AI yanıt verdi: button disabled, "Run" yazıyor, typing yok ve disabled class var
                if (isDisabled && labelText === 'Run' && !isTyping && hasDisabledClass && !responseDetected) {
                    responseDetected = true;
                    console.log('AI yanıt verdi, devam ediliyor...');
                    
                    setTimeout(() => {
                        resolve();
                    }, 2000);
                    return;
                }
            }
            
            // Timeout kontrolü
            if (attempts >= maxAttempts) {
                console.warn('AI yanıt timeout, devam ediliyor...');
                resolve(); // Timeout olsa bile devam et
                return;
            }
            
            setTimeout(checkForResponse, checkInterval);
        };
        
        checkForResponse();
    });
}

function showNotification(message, type = 'info') {
    // Mevcut notification'ları temizle
    const existingNotifications = document.querySelectorAll('.ai-notification-fwk');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `ai-notification-fwk ai-notification-${type}`;
    
    const icon = document.createElement('span');
    icon.className = 'ai-notification-icon';
    
    // Type'a göre icon seç
    switch(type) {
        case 'success':
            icon.innerHTML = ICONS.success;
            break;
        case 'error':
            icon.innerHTML = ICONS.error;
            break;
        case 'warning':
            icon.innerHTML = ICONS.warning;
            break;
        default:
            icon.innerHTML = ICONS.info;
    }
    
    const text = document.createElement('span');
    text.className = 'ai-notification-text';
    text.textContent = message;
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'ai-notification-close';
    closeBtn.innerHTML = ICONS.close;
    closeBtn.onclick = () => notification.remove();
    
    notification.appendChild(icon);
    notification.appendChild(text);
    notification.appendChild(closeBtn);
    
    document.body.appendChild(notification);
    
    // Otomatik kaldırma
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
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
    showNotification('İlişkili kod bloğu bulunamadı.', 'warning');
    return;
  }
  
  const codeElement = codeBlockElement.querySelector('code');
  if (!codeElement) {
    showNotification('Kod içeriği bulunamadı.', 'warning');
    return;
  }

  const fullCode = codeElement.textContent || '';
  const lines = fullCode.split('\n');
  const firstLine = lines[0].trim();

  const pathMatch = firstLine.match(/^(?:\/\/\s*(.*)|#\s*(.*)|\/\*\s*(.*?)\s*\*\/|<!--\s*(.*?)\s*-->|--\s*(.*)|%\s*(.*))/);
  if (!pathMatch) {
    showNotification('Kodun ilk satırında geçerli bir dosya yolu yorumu bulunamadı.\nÖrnekler:\n// src/app.js\n# src/app.py\n/* src/app.css */\n<!-- src/app.html -->\n-- src/app.sql\n% src/app.m', 'warning');
    return;
  }
  
  const filePath = (pathMatch[1] || pathMatch[2] || pathMatch[3] || pathMatch[4] || pathMatch[5] || pathMatch[6] || '').trim();
  
  if (!filePath) {
    showNotification('Kodun ilk satırında geçerli bir dosya yolu yorumu bulunamadı.\nÖrnekler:\n// src/app.js\n# src/app.py\n/* src/app.css */\n<!-- src/app.html -->\n-- src/app.sql\n% src/app.m', 'warning');
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
    showNotification('İşlem başarısız: ' + error.message + '\n\nTarayıcı konsolunu kontrol edin (F12).', 'error');
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