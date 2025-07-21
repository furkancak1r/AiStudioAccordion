// chrome_extension/src/state.js
let sidebar, body, clearAllBtn, toggleBtn, addStageBtn, header;
let detectedSections = [];
let isSidebarCollapsed = false;
let selectedIDE = 'cursor'; // default
const cacheKey = 'markdownCache';

// Text selection variables
let selectionToolbar = null;
let lastSelectedText = '';

function getCachedData() {
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    const data = JSON.parse(cached);
    detectedSections = data.sections || [];
    isSidebarCollapsed = data.isCollapsed || false;
  }
}

function updateCache() {
  sessionStorage.setItem(cacheKey, JSON.stringify({ sections: detectedSections, isCollapsed: isSidebarCollapsed }));
}

// IDE Preference Management
function loadIDEPreference() {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.get(['selectedIDE'], function(result) {
      if (result.selectedIDE) {
        selectedIDE = result.selectedIDE;
        updateIDEButtons();
      }
    });
  }
}

function getSelectedIDE() {
  return selectedIDE;
}

function setSelectedIDE(ide) {
  selectedIDE = ide;
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.set({selectedIDE: ide});
  }
  updateIDEButtons();
}

function updateIDEButtons() {
  // Update all VSCode buttons text and title
  const vscodeButtons = document.querySelectorAll('.markdown-vscode-btn-fwk');
  vscodeButtons.forEach(btn => {
    if (selectedIDE === 'cursor') {
      btn.title = 'Cursora Gönder';
    } else {
      btn.title = 'VS Code\'a Gönder';
    }
  });
}