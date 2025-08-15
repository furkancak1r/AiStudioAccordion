let sidebar, body, clearAllBtn, toggleBtn, addStageBtn, header;
let detectedSections = [];
let isSidebarCollapsed = false;
let isAutoSending = false;
let selectedIDE = 'cursor'; // default
const cacheKey = 'markdownCache';

// Text selection variables
let selectionToolbar = null;
let lastSelectedText = '';

function getCachedData() {
  try {
    // Clear any corrupted cache first
    sessionStorage.removeItem(cacheKey);
    
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const data = JSON.parse(cached);
      detectedSections = data.sections || [];
      isSidebarCollapsed = data.isCollapsed || false;
      
      // Limit sections to prevent storage issues
      if (detectedSections.length > 100) {
        detectedSections = detectedSections.slice(0, 100);
      }
    }
  } catch (e) {
    console.warn('Failed to load cached data:', e);
    detectedSections = [];
    isSidebarCollapsed = false;
    // Clear corrupted cache
    try {
      sessionStorage.removeItem(cacheKey);
    } catch (e2) {
      console.error('Failed to clear corrupted cache:', e2);
    }
  }
}

function updateCache() {
  try {
    // Limit section content size
    const limitedSections = detectedSections.map(section => {
      if (section && section.length > 2000) {
        return section.substring(0, 2000) + '...';
      }
      return section;
    });
    
    const dataToSave = JSON.stringify({ 
      sections: limitedSections, 
      isCollapsed: isSidebarCollapsed 
    });
    
    // Check size before saving
    const size = new Blob([dataToSave]).size;
    if (size > 500000) { // 500KB limit
      console.warn('Cache data too large, clearing old sections');
      detectedSections = detectedSections.slice(0, 50);
      const reducedData = JSON.stringify({ 
        sections: detectedSections, 
        isCollapsed: isSidebarCollapsed 
      });
      sessionStorage.setItem(cacheKey, reducedData);
    } else {
      sessionStorage.setItem(cacheKey, dataToSave);
    }
  } catch (e) {
    console.warn('Failed to update cache:', e);
    // Clear cache if it's corrupted
    try {
      sessionStorage.removeItem(cacheKey);
    } catch (e2) {
      console.error('Failed to clear cache:', e2);
    }
  }
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
  