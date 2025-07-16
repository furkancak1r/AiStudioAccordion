// chrome_extension/src/main.js
;(() => {
  function scanAndEnhanceActionBars() {
    document.querySelectorAll('div.actions').forEach(enhanceActionBarWithVscodeButton);
  }

  function initializeSidebar() {
    if (document.querySelector('ms-app') && !document.querySelector('.markdown-sidebar-fwk')) {
      createSidebar();
      setupNavbarObserver();
    }
  }

  function setupNavbarObserver() {
    const navbar = document.querySelector('.layout-navbar');
    if (!navbar) return;

    const navbarObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const isExpanded = navbar.classList.contains('expanded');
          handleNavbarStateChange(isExpanded);
        }
      });
    });

    navbarObserver.observe(navbar, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Check initial state
    const isExpanded = navbar.classList.contains('expanded');
    handleNavbarStateChange(isExpanded);
  }

  function handleNavbarStateChange(isExpanded) {
    const sidebar = document.querySelector('.markdown-sidebar-fwk');
    if (!sidebar) return;

    if (isExpanded) {
      sidebar.classList.remove('navbar-collapsed');
      hidePlanStagesNavbarIcon();
    } else {
      sidebar.classList.add('navbar-collapsed');
      showPlanStagesNavbarIcon();
    }
  }

  function createPlanStagesNavbarIcon() {
    // Check if icon already exists
    if (document.querySelector('.plan-stages-navbar-item')) return;

    const navbarIcon = document.createElement('div');
    navbarIcon.className = 'plan-stages-navbar-item mat-mdc-tooltip-trigger nav-item-wrapper';
    navbarIcon.setAttribute('mattooltipposition', 'right');
    navbarIcon.setAttribute('style', '');
    
    const iconLink = document.createElement('a');
    iconLink.className = 'nav-item';
    iconLink.title = 'Plan Aşamaları';
    iconLink.addEventListener('click', handleIconClick);
    
    const iconWrapper = document.createElement('div');
    iconWrapper.className = 'nav-item-icon-wrapper';
    
    const icon = document.createElement('span');
    icon.className = 'material-symbols-outlined notranslate';
    icon.textContent = 'assignment';
    icon.setAttribute('aria-hidden', 'true');
    
    iconWrapper.appendChild(icon);
    iconLink.appendChild(iconWrapper);
    navbarIcon.appendChild(iconLink);
    
    // Insert in the nav-items section, after history
    const navItems = document.querySelector('.nav-items');
    const historyElement = document.querySelector('ms-prompt-history');
    if (navItems && historyElement) {
      navItems.insertBefore(navbarIcon, historyElement.nextSibling);
    }
  }

  function showPlanStagesNavbarIcon() {
    createPlanStagesNavbarIcon();
    const navbarIcon = document.querySelector('.plan-stages-navbar-item');
    if (navbarIcon) {
      navbarIcon.classList.add('navbar-collapsed-active');
    }
  }

  function hidePlanStagesNavbarIcon() {
    const navbarIcon = document.querySelector('.plan-stages-navbar-item');
    if (navbarIcon) {
      navbarIcon.classList.remove('navbar-collapsed-active');
    }
  }

  function handleIconClick(e) {
    e.preventDefault();
    // Trigger navbar expansion by clicking the navbar toggle button
    const navToggleButton = document.querySelector('.nav-toggle-wrapper button');
    if (navToggleButton) {
      navToggleButton.click();
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
  loadIDEPreference(); // Load IDE preference on startup
  
  // Initialize message truncation
  if (window.AIStudioMessages) {
    window.AIStudioMessages.init();
  }
  
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();