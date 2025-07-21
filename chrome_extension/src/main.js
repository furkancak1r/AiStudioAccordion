// C:/Users/furkan.cakir/Desktop/FurkanPRS/Kodlar/test/AiStudioAccordion/chrome_extension/src/main.js
;(() => {
  // Varsayılan sistem talimatı
  const DEFAULT_SYSTEM_INSTRUCTIONS = `# İş Akışı ve Yanıt Kuralları (v4)
# Her bir sayfayı ayrı bir kod bloğunda vereceksin!
# Sadece sana denileni yapacaksın, geliştirme düzeltme adı altında var olan özellikleri silip bozmayacaksın!
# Hata ile karşılaşınca hata devam ediyorsa, debug eklemeyi veya veri tabanında sql sorgusu çalıştırmayı öner.
# Kod bloğu içinde filepath yazarken asla kelime olarak filepath yazma sadece yorum satırı içinde dosyanın yolu olmalı örnek "// src/file.js"
# Kodları yorum satırı olmadan ver
# Fazları her bir faz bir dosyayı temsil edecek şekilde ayarla
## 1 · Genel İlkeler
- **Yalnızca isteneni yap**; ek görev veya açıklama ekleme.  
- Kod blokları dışındaki tüm metin **Türkçe**.  
- Kod dosyalarında yorum satırı **kullanılmayacak** (dosya yolu satırı hariç).  
- Tüm yanıtlar Markdown içinde sunulur.

---

## 2 · PLAN Modu  
| Tetik | Çıktı | İçerik |
|-------|-------|--------|
| Hata bildirimi | PLAN | Numara-lanmış yapılacaklar listesi, **kod yok** |
| Yeni özellik   | PLAN | Numara-lanmış yapılacaklar listesi, **kod yok** |

### PLAN Yazım Detayları  
Her madde - [ ] ile başlar ve altına üç başlık eklenir:  
- **Problem Tanımı**  
- **Çözüm Adımları**  
- **Beklenen Çıktı**  
Adımlar hiyerarşik numaralanır (1, 1.1 …).  
**Bellek güncellemesi** maddesi **yalnızca kullanıcı isterse** eklenir.

---

## 3 · FIX Modu  
| Tetik | Şart | Çıktı |
|-------|------|-------|
| go <faz-no> | Sadece belirtilen faz | Güncellenen dosyalar **tamamıyla** |

### FIX Yazım Detayları  
1. Açıklama, başlık, ekstra yorum yok.  
2. Her dosyadan önce tek satır:  
   File: path/to/file.ext
3. Ardından kod bloğu:  
   <dil>
   // path/to/file.ext            ← İlk satır; uzantıya uygun yorum stili  
   (dosyanın tam içeriği)
   
   Yorum stili uzantıya göre:  
   | Uzantı                              | Yorum Başlatıcı |
   |-------------------------------------|-----------------|
   | .ts, .tsx, .js, .jsx, .java, .css, .scss, .c, .cpp | // |
   | .py, .sh, .sql                                         | #  |
   | .html, .xml                                              | <!-- --> |
   | Yorum kabul etmeyen format (ör. .json, .md)              | İlk satırı atla |
4. Kod bloğu dışında ek metin olmaz.  
5. Yalnızca go komutunda belirtilen faz/alt adımlara ilişkin dosyalar verilir.

---

## 4 · Git Komut Talebi  
Kullanıcı “git add . git commit -m \"…\" git push kodlarını ver” dediğinde:  
- PLAN üretme.  
- Tek kod bloğu içinde:  
  bash
  git add .
  git commit -m "Açıklayıcı commit mesajı"
  git push

---

## 5 · Bellek Yönetimi  
- Kalıcı hatalar/düzeltmeler → .remember/memory/self.md  
- Tercihler/kurallar       → .remember/memory/project.md  
- Bu dosyalar yalnızca kullanıcı bellek güncellemesi istediğinde düzenlenir.

---

## 6 · Özet İş Akışı
1. Talep ⇒ PLAN  
2. go <faz> ⇒ FIX (dosyalar, açıklamasız)  
3. Git komut isteği ⇒ Direkt git kod bloğu
`;

  chrome.storage.local.get(['systemInstructions'], function(result) {
    if (!result.systemInstructions) {
      chrome.storage.local.set({ systemInstructions: DEFAULT_SYSTEM_INSTRUCTIONS });
    }
  });

  function scanAndEnhanceActionBars() {
    document.querySelectorAll('div.actions').forEach(enhanceActionBarWithVscodeButton);
  }

  function enhancePromptInputArea(container) {
    if (!container || container.dataset.promptEnhanced === '1') {
      return;
    }

    const runButtonWrapper = container.querySelector('run-button');
    if (!runButtonWrapper) {
      return;
    }

    // Git Button
    const gitButton = createGitCommitButton();
    const gitButtonWrapper = document.createElement('div');
    gitButtonWrapper.className = 'button-wrapper';
    gitButtonWrapper.appendChild(gitButton);
    
    // Analyze Button
    const analyzeButton = createAnalyzeFilesButton();
    const analyzeButtonWrapper = document.createElement('div');
    analyzeButtonWrapper.className = 'button-wrapper';
    analyzeButtonWrapper.appendChild(analyzeButton);

    const runButtonParentWrapper = runButtonWrapper.closest('.button-wrapper');
    if (runButtonParentWrapper) {
      container.insertBefore(gitButtonWrapper, runButtonParentWrapper);
      container.insertBefore(analyzeButtonWrapper, runButtonParentWrapper);
      container.dataset.promptEnhanced = '1';
    }
  }

  function scanAndEnhancePromptInputs() {
    document.querySelectorAll('div.prompt-input-wrapper-container').forEach(enhancePromptInputArea);
  }
  
  function configureModelSettings(settingsView) {
    if (!settingsView || settingsView.dataset.settingsConfigured === '1') {
      return;
    }

    // --- Configure Thinking Budget ---
    const budgetToggle = settingsView.querySelector('mat-slide-toggle[data-test-toggle="manual-budget"] button');
    if (budgetToggle && budgetToggle.getAttribute('aria-checked') === 'false') {
        budgetToggle.click();
    }

    // Wait for the inputs to become available after toggle
    setTimeout(() => {
        const numberInput = settingsView.querySelector('input[type="number"].manual-input');
        const rangeInput = settingsView.querySelector('input[type="range"][matsliderthumb]');

        if (numberInput && numberInput.value !== '32768') {
            numberInput.value = '32768';
            numberInput.dispatchEvent(new Event('input', { bubbles: true }));
            numberInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        if (rangeInput && rangeInput.value !== '32768') {
            rangeInput.value = '32768';
            rangeInput.dispatchEvent(new Event('input', { bubbles: true }));
            rangeInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }, 100);

    // --- Configure Media Resolution ---
    const resolutionSelector = settingsView.querySelector('mat-select[aria-label="Media Resolution"]');
    if (resolutionSelector) {
        const selectedTextSpan = resolutionSelector.querySelector('.mat-mdc-select-min-line');
        if (selectedTextSpan && selectedTextSpan.textContent.trim() !== 'Medium') {
            resolutionSelector.click(); // Open the dropdown

            // Wait for the options panel to appear
            setTimeout(() => {
                const options = document.querySelectorAll('mat-option .mdc-list-item__primary-text');
                for (const option of options) {
                    if (option.textContent.trim() === 'Medium') {
                        option.click();
                        break;
                    }
                }
                 // Close the dropdown if it's still open
                const backdrop = document.querySelector('.cdk-overlay-backdrop');
                if(backdrop) backdrop.click();

            }, 200);
        }
    }
    
    settingsView.dataset.settingsConfigured = '1';
  }

  function scanAndConfigureModelSettings() {
    document.querySelectorAll('ms-settings-view').forEach(configureModelSettings);
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

  function setupTextSelectionListener() {
    let selectionTimeout;
    
    document.addEventListener('mouseup', () => {
      clearTimeout(selectionTimeout);
      selectionTimeout = setTimeout(() => {
        handleTextSelection();
      }, 100);
    });

    document.addEventListener('keyup', (e) => {
      // Handle keyboard selection (Shift+Arrow keys, Ctrl+A, etc.)
      if (e.shiftKey || e.ctrlKey || e.metaKey) {
        clearTimeout(selectionTimeout);
        selectionTimeout = setTimeout(() => {
          handleTextSelection();
        }, 100);
      }
    });

    // Hide toolbar when clicking elsewhere
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.selection-toolbar-fwk')) {
        removeSelectionToolbar();
      }
    });

    // Hide toolbar on scroll
    document.addEventListener('scroll', () => {
      removeSelectionToolbar();
    }, true);
  }

  window.getSystemInstructions = function() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['systemInstructions'], function(result) {
        resolve(result.systemInstructions || '');
      });
    });
  };

  function getAutoApplySetting() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['autoApplySystemInstructions'], function(result) {
        resolve(result.autoApplySystemInstructions !== false); // Default to true
      });
    });
  }

  function applySystemInstructionsToTextarea() {
    const systemInstructionsTextarea = document.querySelector('textarea[aria-label="System instructions"]');
    if (!systemInstructionsTextarea) return;

    Promise.all([window.getSystemInstructions(), getAutoApplySetting()]).then(([instructions, autoApply]) => {
      if (autoApply && instructions.trim() && !systemInstructionsTextarea.value.trim()) {
        systemInstructionsTextarea.value = instructions;
        systemInstructionsTextarea.dispatchEvent(new Event('input', { bubbles: true }));
      } else if (!autoApply) {
        console.log('Otomatik uygulama kapalı, sistem talimatları uygulanmadı');
      }
    });
  }

  function setupSystemInstructionsObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          
          // Check if the added node is the system instructions textarea
          if (node.matches && node.matches('textarea[aria-label="System instructions"]')) {
            applySystemInstructionsToTextarea();
          } else if (node.querySelectorAll) {
            // Check if any child contains the system instructions textarea
            const textarea = node.querySelector('textarea[aria-label="System instructions"]');
            if (textarea) {
              applySystemInstructionsToTextarea();
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Also check on page load
    setTimeout(() => {
      applySystemInstructionsToTextarea();
    }, 1000);
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

        if (node.matches && node.matches('div.prompt-input-wrapper-container')) {
          enhancePromptInputArea(node);
        } else if (node.querySelectorAll) {
          node.querySelectorAll('div.prompt-input-wrapper-container').forEach(enhancePromptInputArea);
        }

        if (node.matches && node.matches('ms-settings-view')) {
          configureModelSettings(node);
        } else if (node.querySelectorAll) {
          node.querySelectorAll('ms-settings-view').forEach(configureModelSettings);
        }
      });
    });
  });

  initializeSidebar();
  scanAndEnhanceActionBars();
  scanAndEnhancePromptInputs();
  scanAndConfigureModelSettings();
  loadIDEPreference(); // Load IDE preference on startup
  setupTextSelectionListener(); // Setup text selection listener
  setupSystemInstructionsObserver(); // Setup system instructions observer
  
  // Initialize message truncation
  if (window.AIStudioMessages) {
    window.AIStudioMessages.init();
  }
  
  // Initialize code block accordion
  if (window.AIStudioAccordion) {
    window.AIStudioAccordion.init();
  }
  
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();