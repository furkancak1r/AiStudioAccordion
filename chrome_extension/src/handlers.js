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
      showPopup('Pano boş.', 'warning', 'Uyarı');
    }
  } catch (err) {
    console.error('Pano okuma hatası:', err);
    showPopup('Panoya erişilemedi veya izin verilmedi.', 'error', 'Hata');
  }
}

async function sendToPrompt(index) {
    const text = detectedSections[index];
    if (!text) return Promise.resolve();
  
    let promptText = `go ${text}, yalnızca kod bloğu döndür. ilk satırda dosya yolunu dosya diline uygun yorum satırı olarak yaz. kod bloğu dışında hiçbir metin yazma. "File:" yazma. ng-star-inserted ekleme.`;
    
    const textarea = document.querySelector('textarea.textarea.gmat-body-medium');
    const runButton = document.querySelector('run-button button[type="submit"]');
  
    if (textarea && runButton) {
      textarea.value = promptText;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (!runButton.disabled) {
            runButton.click();
            detectedSections.splice(index, 1);
            renderSections();
            resolve();
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



function showPopup(message, type = 'info', title = 'Bilgi') {
    const existingPopups = document.querySelectorAll('.ai-popup-fwk');
    existingPopups.forEach(popup => popup.remove());

    const overlay = document.createElement('div');
    overlay.className = 'ai-popup-overlay-fwk';
    
    const popup = document.createElement('div');
    popup.className = `ai-popup-fwk ai-popup-${type}`;
    
    const header = document.createElement('div');
    header.className = 'ai-popup-header-fwk';
    
    const icon = document.createElement('span');
    icon.className = 'ai-popup-icon';
    
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
    
    const titleElement = document.createElement('span');
    titleElement.className = 'ai-popup-title';
    titleElement.textContent = title;
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'ai-popup-close';
    closeBtn.innerHTML = ICONS.close;
    closeBtn.onclick = () => {
        overlay.classList.add('fade-out');
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.remove();
            }
        }, 300);
    };
    
    header.appendChild(icon);
    header.appendChild(titleElement);
    header.appendChild(closeBtn);
    
    const content = document.createElement('div');
    content.className = 'ai-popup-content';
    content.textContent = message;
    
    const footer = document.createElement('div');
    footer.className = 'ai-popup-footer';
    
    const okBtn = document.createElement('button');
    okBtn.className = 'ai-popup-ok-btn';
    okBtn.textContent = 'Tamam';
    okBtn.onclick = () => {
        overlay.classList.add('fade-out');
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.remove();
            }
        }, 300);
    };
    
    footer.appendChild(okBtn);
    
    popup.appendChild(header);
    popup.appendChild(content);
    popup.appendChild(footer);
    overlay.appendChild(popup);
    
    document.body.appendChild(overlay);
    
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' || e.key === 'Escape') {
            overlay.classList.add('fade-out');
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.remove();
                }
            }, 300);
            document.removeEventListener('keydown', handleKeyPress);
        }
    };
    document.addEventListener('keydown', handleKeyPress);
    
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            overlay.classList.add('fade-out');
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.remove();
                }
            }, 300);
        }
    };
    
    setTimeout(() => {
        okBtn.focus();
    }, 100);
}

function showNotification(message, type = 'info') {
    const existingNotifications = document.querySelectorAll('.ai-notification-fwk');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `ai-notification-fwk ai-notification-${type}`;
    
    const icon = document.createElement('span');
    icon.className = 'ai-notification-icon';
    
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
    showPopup('İlişkili kod bloğu bulunamadı.', 'warning', 'Uyarı');
    return;
  }
  
  const preElement = codeBlockElement.querySelector('pre');
  if (!preElement) {
    showPopup('Kod içeriği bulunamadı (`pre` etiketi).', 'warning', 'Uyarı');
    return;
  }
  
  const iconSpan = button.querySelector('.material-symbols-outlined');
  const originalIconHTML = iconSpan ? iconSpan.innerHTML : '';

  try {
    if (iconSpan) iconSpan.textContent = 'sync';
    
    const fullCode = await window.AIStudioAccordion.forceLoadAndGetContent(preElement, button);
    
    window.AIStudioAccordion.collapseAccordion(preElement);
    
    const lines = fullCode.split('\n');
    const firstLine = lines[0].trim();

    const pathMatch = firstLine.match(/^(?:\/\/\s*(.*)|#\s*(.*)|\/\*\s*(.*?)\s*\*\/|<!--\s*(.*?)\s*-->|--\s*(.*)|%\s*(.*))/);
    if (!pathMatch) {
      showPopup('Kodun ilk satırında geçerli bir dosya yolu yorumu bulunamadı.\nÖrnekler:\n// src/app.js\n# src/app.py\n/* src/app.css */\n<!-- src/app.html -->\n-- src/app.sql\n% src/app.m', 'warning', 'Dosya Yolu Hatası');
      button.disabled = false;
      if (iconSpan) iconSpan.innerHTML = originalIconHTML;
      return;
    }
    
    const filePath = (pathMatch[1] || pathMatch[2] || pathMatch[3] || pathMatch[4] || pathMatch[5] || pathMatch[6] || '').trim();
    
    if (!filePath) {
      showPopup('Kodun ilk satırında geçerli bir dosya yolu yorumu bulunamadı.\nÖrnekler:\n// src/app.js\n# src/app.py\n/* src/app.css */\n<!-- src/app.html -->\n-- src/app.sql\n% src/app.m', 'warning', 'Dosya Yolu Hatası');
      button.disabled = false;
      if (iconSpan) iconSpan.innerHTML = originalIconHTML;
      return;
    }
    
    await navigator.clipboard.writeText(fullCode);
    
    const encodedPath = encodeURIComponent(filePath);
    const currentIDE = getSelectedIDE();
    const uriScheme = currentIDE === 'cursor' ? 'cursor' : 'vscode';
    
    let uri;
    if (fullCode.length > 1000) {
      uri = `${uriScheme}://furkan.aistudiocopy?file=${encodedPath}`;
      console.log(`🚀 URI (${uriScheme}) açılıyor (clipboard mode): ${filePath} - ${fullCode.length} karakter`);
    } else {
      const encodedContent = encodeURIComponent(fullCode);
      uri = `${uriScheme}://furkan.aistudiocopy?file=${encodedPath}&content=${encodedContent}`;
      console.log(`🚀 URI (${uriScheme}) açılıyor (URI mode): ${filePath} - ${fullCode.length} karakter`);
    }
    
    window.open(uri, '_self');

    if (iconSpan) {
        iconSpan.textContent = 'check';

        setTimeout(() => {
          iconSpan.innerHTML = originalIconHTML;
          button.disabled = false;
        }, 2000);
    }
  } catch (error) {
    console.error('❌ URI açma veya panoya kopyalama hatası:', error);
    showPopup('İşlem başarısız: ' + error.message + '\n\nTarayıcı konsolunu kontrol edin (F12).', 'error', 'Hata');
    button.disabled = false;
    if (iconSpan) iconSpan.innerHTML = originalIconHTML;
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
  
  let promptText = `go ${selectedText}, yalnızca kod bloğu döndür. ilk satırda dosya yolunu dosya diline uygun yorum satırı olarak yaz. kod bloğu dışında hiçbir metin yazma. "File:" yazma. ng-star-inserted ekleme.`;
  
  const textarea = document.querySelector('textarea[placeholder="Start typing a prompt"]') || 
                   document.querySelector('textarea.textarea') ||
                   document.querySelector('ms-autosize-textarea textarea');
  const runButton = document.querySelector('run-button button[type="submit"]') ||
                   document.querySelector('button[aria-label="Run"]') ||
                   document.querySelector('.run-button');
  
  if (textarea && runButton) {
    textarea.value = promptText;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.dispatchEvent(new Event('change', { bubbles: true }));
    
    setTimeout(() => {
      if (!runButton.disabled) {
        runButton.click();
      } else {
        console.log('Run butonu disabled, metin girişi tamamlandı');
      }
    }, 200);
  } else {
    console.error('Prompt textarea veya run butonu bulunamadı.');
  }
}