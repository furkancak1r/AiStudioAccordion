// chrome_extension/src/main.js
;(() => {
  function scanAndEnhanceActionBars() {
    document.querySelectorAll('div.actions').forEach(enhanceActionBarWithVscodeButton);
  }

  function initializeSidebar() {
    if (document.querySelector('ms-app') && !document.querySelector('.markdown-sidebar-fwk')) {
      createSidebar();
    }
  }

  const observer = new MutationObserver((mutations) => {
    initializeSidebar();
    
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== 1) return;

        if (node.matches && node.matches('div.actions')) {
          enhanceActionBarWithVscodeButton(node);
        } else if (node.querySelectorAll) {
          node.querySelectorAll('div.actions').forEach(enhanceActionBarWithVscodeButton);
        }
      });
    });
  });

  initializeSidebar();
  scanAndEnhanceActionBars();
  
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();