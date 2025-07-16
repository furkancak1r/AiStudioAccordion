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
if (iconKey === 'vscode') {
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
  // Remove existing toolbar if present
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
  
  // Auto-hide after 10 seconds
  setTimeout(() => {
    removeSelectionToolbar();
  }, 10000);
  
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
    
    // Position toolbar at the end of selection
    const x = rect.left + (rect.width / 2) - 50; // Center horizontally
    const y = rect.top + window.scrollY; // Account for scroll
    
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

// Get current IDE preference for button title
const currentIDE = getSelectedIDE();
const buttonTitle = currentIDE === 'cursor' ? 'Cursora Gönder' : 'VS Code\'a Gönder';

// Create button with full Material Design structure to match native buttons
const vscodeBtn = document.createElement('button');
vscodeBtn.className = 'markdown-vscode-btn-fwk mdc-icon-button mat-mdc-icon-button mat-mdc-button-base mat-mdc-tooltip-trigger mat-unthemed';
vscodeBtn.setAttribute('mat-icon-button', '');
vscodeBtn.setAttribute('title', buttonTitle);

// Add ripple span (for Material Design touch feedback)
const rippleSpan = document.createElement('span');
rippleSpan.className = 'mat-mdc-button-persistent-ripple mdc-icon-button__ripple';

// Add icon span with Material Symbols styling
const iconSpan = document.createElement('span');
iconSpan.setAttribute('aria-hidden', 'true');
iconSpan.className = 'material-symbols-outlined notranslate';
iconSpan.innerHTML = window.ICONS?.vscode || `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`;

// Add focus indicator span
const focusSpan = document.createElement('span');
focusSpan.className = 'mat-focus-indicator';

// Add touch target span
const touchSpan = document.createElement('span');
touchSpan.className = 'mat-mdc-button-touch-target';

// Assemble button structure
vscodeBtn.appendChild(rippleSpan);
vscodeBtn.appendChild(iconSpan);
vscodeBtn.appendChild(focusSpan);
vscodeBtn.appendChild(touchSpan);

// Add click handler
vscodeBtn.onclick = (e) => {
  e.stopPropagation();
  sendToVscode(e);
};

actionBar.appendChild(vscodeBtn);
actionBar.dataset.vscodeBtnInjected = '1';
}