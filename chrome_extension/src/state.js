// chrome_extension/src/state.js
let sidebar, body, clearAllBtn, toggleBtn, addStageBtn, header;
let detectedSections = [];
let isSidebarCollapsed = false;
const cacheKey = 'markdownCache';

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