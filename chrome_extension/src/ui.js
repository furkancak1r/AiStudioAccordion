// C:/Users/furkan.cakir/Desktop/FurkanPRS/Kodlar/test/AiStudioAccordion/chrome_extension/src/ui.js
function truncateText(text, wordLimit = 2) {
  if (!text) return '';
  const words = text.split(' ');
  if (words.length > wordLimit) {
    return words.slice(0, wordLimit).join(' ') + '...';
  }
  return text;
}

function createButton(iconKey, title, onClick, extraClass = '') {
  const btn = document.createElement('button');
  btn.className = `markdown-${iconKey}-btn-fwk ${extraClass}`.trim();
  btn.innerHTML = ICONS[iconKey];
  btn.title = title;
  if (iconKey === 'vscode' || iconKey === 'git' || iconKey === 'analyze') {
    btn.onclick = (e) => {
      onClick(e);
    };
  } else {
    btn.onclick = (e) => {
      e.stopPropagation();
      onClick(e);
    };
  }
  return btn;
}

function createMaterialIconButton(iconKey, title, onClick, extraClass = '') {
  const btn = document.createElement('button');
  btn.className = `mdc-icon-button mat-mdc-icon-button mat-mdc-button-base mat-unthemed ${extraClass}`.trim();
  btn.setAttribute('mat-icon-button', '');
  btn.setAttribute('title', title);
  btn.setAttribute('aria-label', title);

  const rippleSpan = document.createElement('span');
  rippleSpan.className = 'mat-mdc-button-persistent-ripple mdc-icon-button__ripple';

  const iconSpan = document.createElement('span');
  iconSpan.setAttribute('aria-hidden', 'true');
  iconSpan.className = 'material-symbols-outlined notranslate';
  iconSpan.innerHTML = window.ICONS?.[iconKey] || '';

  const focusSpan = document.createElement('span');
  focusSpan.className = 'mat-focus-indicator';

  const touchSpan = document.createElement('span');
  touchSpan.className = 'mat-mdc-button-touch-target';

  btn.append(rippleSpan, iconSpan, focusSpan, touchSpan);

  btn.onclick = (e) => {
    e.stopPropagation();
    onClick(e);
  };

  return btn;
}

function createEditModal(index) {
const currentText = detectedSections[index];

const overlay = document.createElement('div');
overlay.className = 'edit-modal-overlay-fwk';

const modal = document.createElement('div');
modal.className = 'edit-modal-content-fwk';
modal.onclick = (e) => e.stopPropagation();

const title = document.createElement('h3');
title.textContent = 'Aşamayı Düzenle';

const textarea = document.createElement('textarea');
textarea.value = currentText;

const actions = document.createElement('div');
actions.className = 'edit-modal-actions-fwk';

const saveBtn = document.createElement('button');
saveBtn.textContent = 'Kaydet';
saveBtn.className = 'markdown-save-btn-fwk modal-btn';
saveBtn.onclick = () => {
  detectedSections[index] = textarea.value;
  renderSections();
  updateCache();
  document.body.removeChild(overlay);
};

const cancelBtn = document.createElement('button');
cancelBtn.textContent = 'İptal';
cancelBtn.className = 'markdown-cancel-btn-fwk modal-btn';
cancelBtn.onclick = () => {
  if (currentText === '') {
    detectedSections.splice(index, 1);
    renderSections();
  }
  document.body.removeChild(overlay);
};

overlay.onclick = () => {
  if (currentText === '') {
    detectedSections.splice(index, 1);
    renderSections();
  }
  document.body.removeChild(overlay);
};

actions.append(cancelBtn, saveBtn);
modal.append(title, textarea, actions);
overlay.append(modal);
document.body.appendChild(overlay);
textarea.focus();
}

function createSectionItem(section, index) {
const item = document.createElement('div');
item.className = 'markdown-section-item-fwk';
item.dataset.index = index;
item.title = section;

const textWrapper = document.createElement('div');
textWrapper.className = 'markdown-section-text-fwk';

const title = document.createElement('span');
title.className = 'markdown-section-title-fwk';
title.textContent = truncateText(section, 2);

textWrapper.append(title);

const actions = document.createElement('div');
actions.className = 'markdown-section-actions-fwk';

const copyBtn = createButton('copy', 'Kopyala', () => copySection(index));
const editBtn = createButton('edit', 'Düzenle', () => createEditModal(index));
const deleteBtn = createButton('delete', 'Sil', () => deleteSection(index));
const sendBtn = createButton('send', 'Prompt\'a Gönder', () => sendToPrompt(index));

actions.append(copyBtn, editBtn, deleteBtn, sendBtn);
item.append(textWrapper, actions);
return item;
}

function renderSections() {
body.innerHTML = '';
if (detectedSections.length === 0) {
  body.innerHTML = `<div class="markdown-sidebar-empty-fwk">Manuel olarak aşama ekleyin.</div>`;
} else {
  detectedSections.forEach((section, index) => {
    const item = createSectionItem(section, index);
    body.appendChild(item);
  });
}
updateCache();
}

function createSidebar() {
sidebar = document.createElement('div');
sidebar.className = 'markdown-sidebar-fwk';

header = document.createElement('div');
header.className = 'markdown-sidebar-header-fwk';
header.onclick = (e) => {
  if (e.target.closest('button')) return;
  toggleSidebar();
};

const title = document.createElement('div');
title.className = 'markdown-sidebar-title-fwk';
title.textContent = 'Plan Aşamaları';

const buttons = document.createElement('div');
buttons.className = 'markdown-sidebar-buttons-fwk';

addStageBtn = createButton('add', 'Yeni Aşama Ekle', () => addSection('', true));
clearAllBtn = createButton('clear', 'Tümünü Temizle', clearAllSections);
toggleBtn = createButton('toggle', 'Gizle/Göster', toggleSidebar);
toggleBtn.style.transition = 'transform 0.2s ease-in-out';

buttons.append(addStageBtn, clearAllBtn, toggleBtn);
header.append(title, buttons);

body = document.createElement('div');
body.className = 'markdown-sidebar-body-fwk';

const footer = document.createElement('div');
footer.className = 'markdown-sidebar-footer-fwk';

const importBtn = document.createElement('button');
importBtn.className = 'markdown-import-btn-fwk';
importBtn.innerHTML = ICONS.clipboard;
importBtn.title = 'Panodan İçe Aktar';
importBtn.onclick = importFromClipboard;

footer.append(importBtn);
sidebar.append(header, body, footer);

const historyElement = document.querySelector('ms-prompt-history');
if (historyElement && historyElement.parentElement) {
  historyElement.parentElement.insertBefore(sidebar, historyElement.nextSibling);
} else {
  document.body.appendChild(sidebar);
}

getCachedData();
renderSections();
if (isSidebarCollapsed) {
  sidebar.classList.add('collapsed');
  toggleBtn.style.transform = 'rotate(-90deg)';
}
}

function createSelectionToolbar(selectedText, x, y) {
  removeSelectionToolbar();
  
  const toolbar = document.createElement('div');
  toolbar.className = 'selection-toolbar-fwk';
  toolbar.style.position = 'absolute';
  toolbar.style.left = `${x}px`;
  toolbar.style.top = `${y - 50}px`;
  toolbar.style.zIndex = '10000';
  
  const addBtn = createButton('add', 'Plan Aşamalarına Ekle', () => {
    addSelectedTextToStages(selectedText);
    removeSelectionToolbar();
  }, 'selection-add-btn');
  
  const sendBtn = createButton('send', 'Sohbete Gönder', () => {
    sendSelectedTextToPrompt(selectedText);
    removeSelectionToolbar();
  }, 'selection-send-btn');
  
  toolbar.appendChild(addBtn);
  toolbar.appendChild(sendBtn);
  
  document.body.appendChild(toolbar);
  selectionToolbar = toolbar;
  
  return toolbar;
}

function removeSelectionToolbar() {
  if (selectionToolbar) {
    selectionToolbar.remove();
    selectionToolbar = null;
  }
}

function handleTextSelection() {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  
  if (selectedText && selectedText.length > 3) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    const x = rect.left + (rect.width / 2) - 50;
    const y = rect.top + window.scrollY;
    
    lastSelectedText = selectedText;
    createSelectionToolbar(selectedText, x, y);
  } else {
    removeSelectionToolbar();
  }
}

function enhanceActionBarWithVscodeButton(actionBar) {
if (!actionBar || actionBar.dataset.vscodeBtnInjected === '1') {
  return;
}

if (!actionBar.closest('ms-code-block')) {
  return;
}

const currentIDE = getSelectedIDE();
const buttonTitle = currentIDE === 'cursor' ? 'Cursora Gönder' : 'VS Code\'a Gönder';

const vscodeBtn = document.createElement('button');
vscodeBtn.className = 'markdown-vscode-btn-fwk mdc-icon-button mat-mdc-icon-button mat-mdc-button-base mat-mdc-tooltip-trigger mat-unthemed';
vscodeBtn.setAttribute('mat-icon-button', '');
vscodeBtn.setAttribute('title', buttonTitle);

const rippleSpan = document.createElement('span');
rippleSpan.className = 'mat-mdc-button-persistent-ripple mdc-icon-button__ripple';

const iconSpan = document.createElement('span');
iconSpan.setAttribute('aria-hidden', 'true');
iconSpan.className = 'material-symbols-outlined notranslate';
iconSpan.innerHTML = window.ICONS?.vscode || `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`;

const focusSpan = document.createElement('span');
focusSpan.className = 'mat-focus-indicator';

const touchSpan = document.createElement('span');
touchSpan.className = 'mat-mdc-button-touch-target';

vscodeBtn.appendChild(rippleSpan);
vscodeBtn.appendChild(iconSpan);
vscodeBtn.appendChild(focusSpan);
vscodeBtn.appendChild(touchSpan);

vscodeBtn.onclick = (e) => {
  e.stopPropagation();
  sendToVscode(e);
};

actionBar.appendChild(vscodeBtn);
actionBar.dataset.vscodeBtnInjected = '1';
}

function createGitCommitButton() {
    return createMaterialIconButton('git', 'Git Komutlarını İste', sendGitCommitPrompt, 'git-commit-btn-fwk');
}

function createAnalyzeFilesButton() {
    return createMaterialIconButton('analyze', 'Dosyaları Analiz Et', sendAnalyzeFilesPrompt, 'analyze-files-btn-fwk');
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