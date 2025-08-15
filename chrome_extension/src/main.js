;(() => {
  // Varsayılan sistem talimatı
  const DEFAULT_SYSTEM_INSTRUCTIONS = `
# İş Akışı ve Yanıt Kuralları (v8)

Kritik ilkeler:
- Her zaman **ya PLAN ver ya KOD ver**; **ikisini aynı anda verme**.
- PLAN'da her faz **yalnızca tek bir dosyayı** ele almalıdır. Fazlar arası dosya tekrarı olamaz.
- KOD yalnızca kullanıcı **go <faz-no>** dediğinde verilir (Git komut talebi istisnadır).

1. Her dosya ayrı kod bloğunda.
2. Sadece isteneni yap; mevcut işlevleri bozma.
3. Hata sürerse debug veya SQL sorgusu önerebilirsin.
4. Kod bloğu içinde filepath kelimesi geçmez; yalnızca ilk satıra **dosya yolu** yazılır (yorum destekleyen dillerde).
5. Kodlarda **yorum satırı yok** (dosya yolu hariç).
6. Faz numaraları **her dosyayı** temsil eder.
7. PLAN ile KOD’u aynı mesajda verme; KOD sadece go <faz-no> ile.
8. Eksik Bilgi Bildirimi: “Eksik Bilgi:” başlığı altında gereken ek verileri kısaca listele.
9. Kod dışındaki tüm metin **Türkçe**.
10. Tüm yanıtlar **Markdown** biçiminde.
11. PLAN çıktısı **her zaman** bir kod bloğu içinde verilir.
12. JSON/MD istisnası: .json ve .md dosyalarında kod bloğu içinde dosya yolu satırı yazılmaz; File: satırı her zaman kod bloğu dışında verilir.

---

## 1 · PLAN Modu

| Tetik          | Çıktı | İçerik                                         |
| -------------- | ----- | ---------------------------------------------- |
| Hata bildirimi | PLAN  | Numaralanmış yapılacaklar listesi, **kod yok** |
| Yeni özellik   | PLAN  | Numaralanmış yapılacaklar listesi, **kod yok** |

### PLAN Yazım Detayları

- Her madde - [ ] ile başlar, altına:
  - **Problem Tanımı**
  - **Çözüm Adımları**
  - **Beklenen Çıktı**
- Adımlar hiyerarşik numaralanır (1, 1.1 …).
- **Bellek güncellemesi** maddesi yalnızca kullanıcı isterse eklenir.
- Gerekirse **Eksik Bilgi:** listesi eklenir.
- PLAN çıktısı mutlaka kod bloğu içinde olur

---

## 2 · FIX Modu

| Tetik         | Şart                  | Çıktı                              |
| ------------- | --------------------- | ---------------------------------- |
| go faz-no | Yalnız belirtilen faz | Güncellenen dosyalar tamamıyla |

### FIX Yazım Detayları

1. Açıklama, başlık, ekstra yorum yok.
2. Her dosyadan önce tek satır (kod bloğu dışında):

File: path/to/file.ext
3. Ardından kod bloğu (uzantıya uygun dil etiketiyle). İlk satır yalnız yorum destekleyen dillerde dosya yoludur.

| Uzantı                                     | Yorum Başlatıcı                   |
| ------------------------------------------ | --------------------------------- |
| .ts .tsx .js .jsx .java .css .scss .c .cpp | //                                |
| .py .sh .sql                               | #                                 |
| .html .xml                                 | (yok)                             |
| .json .md                                  | (kod bloğu içinde yol satırı yok) |

4. Kod bloğu dışında metin yok.
5. Yalnızca go komutunda belirtilen faza ait dosyalar verilir.

---

## 3 · Git Komut Talebi

Kullanıcı “git add . git commit -m … git push kodlarını ver” dediğinde:

Plan yapmadan tek kod bloğunda verilir.

---

## 4 · Bellek Yönetimi

* Kalıcı hatalar/düzeltmeler → .remember/memory/self.md
* Tercihler/kurallar → .remember/memory/project.md
* Bu dosyalar **yalnızca kullanıcı isterse** düzenlenir.

---

## 5 · Özet İş Akışı

1. Talep ⇒ **PLAN**
2. go faz-no ⇒ FIX

Not: Her zaman ya PLAN ver ya KOD ver; ikisini aynı anda verme ve KOD'u sadece kullanıcı go faz-no derse ver.`;

  chrome.storage.local.get(['systemInstructions'], function(result) {
    if (!result.systemInstructions) {
      chrome.storage.local.set({ systemInstructions: DEFAULT_SYSTEM_INSTRUCTIONS }, function() {
        if (chrome.runtime.lastError) {
          console.error('Sistem talimatları kaydedilemedi:', chrome.runtime.lastError);
        }
      });
    }
  });

  function scanAndEnhanceActionBars() {
    document.querySelectorAll('div.actions, .actions-container').forEach(enhanceActionBarWithVscodeButton);
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

    // Scroll ve click ile toolbar'ı kaldırma kodları silindi
  }

  window.getSystemInstructions = function() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['systemInstructions'], function(result) {
        if (chrome.runtime.lastError) {
          console.error('Sistem talimatları alınamadı:', chrome.runtime.lastError);
          resolve(''); // Return empty string on error
        } else {
          resolve(result.systemInstructions || '');
        }
      });
    });
  };

  function getAutoApplySetting() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['autoApplySystemInstructions'], function(result) {
        if (chrome.runtime.lastError) {
          console.error('Otomatik uygulama ayarı alınamadı:', chrome.runtime.lastError);
          resolve(true); // Default to true on error
        } else {
          resolve(result.autoApplySystemInstructions !== false); // Default to true
        }
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
        
        setTimeout(() => {
          const systemInstructionsButton = document.querySelector('button[aria-label="System instructions"]');
          if (systemInstructionsButton) {
            systemInstructionsButton.click();
          }
        }, 100);
  
      }
    });
  }

  async function autoOpenAndApplySystemInstructions() {
    const promptContainer = document.querySelector('div.prompt-input-wrapper-container');
    
    if (!promptContainer || promptContainer.dataset.systemPromptOpened === 'true') {
      return;
    }
  
    const autoApply = await getAutoApplySetting();
    if (!autoApply) {
      promptContainer.dataset.systemPromptOpened = 'true';
      return;
    }
  
    const systemInstructionsButton = document.querySelector('button[aria-label="System instructions"]');
    const systemInstructionsTextarea = document.querySelector('textarea[aria-label="System instructions"]');
  
    if (systemInstructionsButton && !systemInstructionsTextarea) {
      systemInstructionsButton.click();
      promptContainer.dataset.systemPromptOpened = 'true';
    }
  }

  function setupSystemInstructionsObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          
          if (node.matches && node.matches('textarea[aria-label="System instructions"]')) {
            applySystemInstructionsToTextarea();
          } else if (node.querySelectorAll) {
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

    setTimeout(() => {
      applySystemInstructionsToTextarea();
    }, 1000);
  }

  function truncateUserMessages() {
    const userMessages = document.querySelectorAll('[data-turn-role="User"]');
    userMessages.forEach(message => {
      const turnContent = message.querySelector('.turn-content');
      if (turnContent) {
        const text = turnContent.textContent || turnContent.innerText;
        const words = text.trim().split(/\s+/);
        
        if (words.length > 10) {
          const truncatedText = words.slice(0, 10).join(' ');
          turnContent.innerHTML = `<span>${truncatedText}...</span>`;
        }
      }
    });
  }

  function setupUserMessageObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          
          if (node.hasAttribute && node.hasAttribute('data-turn-role') && node.getAttribute('data-turn-role') === 'User') {
            truncateUserMessages();
          }
          
          if (node.querySelectorAll) {
            const userMessages = node.querySelectorAll('[data-turn-role="User"]');
            if (userMessages.length > 0) {
              truncateUserMessages();
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      truncateUserMessages();
    }, 1000);
  }

  const observer = new MutationObserver((mutations) => {
    initializeSidebar();
    autoOpenAndApplySystemInstructions();
    
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== 1) return;

        if (node.matches && node.matches('div.actions, .actions-container')) {
          enhanceActionBarWithVscodeButton(node);
        } else if (node.querySelectorAll) {
          node.querySelectorAll('div.actions, .actions-container').forEach(enhanceActionBarWithVscodeButton);
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
  loadIDEPreference(); 
  setupTextSelectionListener(); 
  setupSystemInstructionsObserver(); 
  setupUserMessageObserver(); 
  
  if (window.AIStudioMessages) {
    window.AIStudioMessages.init();
  }
  
  if (window.AIStudioAccordion) {
    window.AIStudioAccordion.init();
  }
  
  if (window.AIResponseMonitor) {
    window.AIResponseMonitor.start();
  }
  
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
  