let sidebar, body, clearAllBtn, toggleBtn, addStageBtn, header;
let detectedSections = [];
let isSidebarCollapsed = false;
let isAutoSending = false;
let selectedIDE = 'cursor'; // default
const cacheKey = 'markdownCache';
const SENT_REGISTRY_KEY = 'aiSentBlocksV1';

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

// ------------------------------
// Sent-state persistence helpers
// ------------------------------

function loadSentSet() {
  try {
    const raw = sessionStorage.getItem(SENT_REGISTRY_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return new Set(arr);
  } catch {}
  return new Set();
}

function saveSentSet(set) {
  try {
    const arr = Array.from(set);
    sessionStorage.setItem(SENT_REGISTRY_KEY, JSON.stringify(arr));
  } catch (e) {
    // If saving fails (quota, etc.), degrade gracefully
    try { sessionStorage.removeItem(SENT_REGISTRY_KEY); } catch {}
  }
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; // 32-bit
  }
  return Math.abs(hash).toString(36);
}

function extractFilePathFromPre(preEl) {
  try {
    const text = (preEl?.textContent || '').split('\n')[0].trim();
    const m = text.match(/^(?:\/\/\s*(.*)|#\s*(.*)|\/\*\s*(.*?)\s*\*\/|<!--\s*(.*?)\s*-->|--\s*(.*)|%\s*(.*))/);
    if (!m) return null;
    const filePath = (m[1] || m[2] || m[3] || m[4] || m[5] || m[6] || '').trim();
    return filePath || null;
  } catch {
    return null;
  }
}

function getBlockKeyFromElement(codeBlockEl) {
  try {
    const pre = codeBlockEl?.querySelector('pre');
    if (!pre) return null;
    const filePath = extractFilePathFromPre(pre);
    if (filePath) return `fp:${filePath}`;
    const head = (pre.textContent || '').trim().slice(0, 500);
    return head ? `h:${simpleHash(head)}` : null;
  } catch {
    return null;
  }
}

function isBlockSent(codeBlockEl) {
  const key = getBlockKeyFromElement(codeBlockEl);
  if (!key) return false;
  const set = loadSentSet();
  return set.has(key);
}

function markBlockSent(codeBlockEl) {
  const key = getBlockKeyFromElement(codeBlockEl);
  if (!key) return;
  const set = loadSentSet();
  set.add(key);
  saveSentSet(set);
  try { codeBlockEl.dataset.aiSentKey = key; } catch {}
}

// Expose for other modules if needed
if (typeof window !== 'undefined') {
  window.AIStudioSent = {
    isBlockSent,
    markBlockSent,
    getBlockKeyFromElement
  };
}
  

