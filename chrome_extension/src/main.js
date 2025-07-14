// chrome_extension/src/main.js
;(() => {
    function initializePlanManager() {
      createSidebar();
    }
  
    const observer = new MutationObserver((mutations, obs) => {
      if (document.querySelector('ms-app') && !document.querySelector('.markdown-sidebar-fwk')) {
        initializePlanManager();
        obs.disconnect();
      }
    });
  
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  })();