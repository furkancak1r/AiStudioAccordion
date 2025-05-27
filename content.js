(() => {
  let uniqueIdCounter = 0;

  function processPreElement(preElement) {
    if (!preElement || !preElement.attributes) return;
    if (preElement.classList.contains('kod-blok-akordiyon-islendi')) return;

    let hasNgContent = false;
    for (const attr of preElement.attributes) {
      if (attr.name.startsWith('_ngcontent-ng-c')) {
        hasNgContent = true;
        break;
      }
    }
    if (!hasNgContent) return;

    uniqueIdCounter++;
    const preId = `kod-blok-icerik-${uniqueIdCounter}`;
    preElement.id = preId;

    const wrapper = document.createElement('div');
    wrapper.classList.add('kod-blok-akordiyon-sarmalayici');

    const toggleButton = document.createElement('button');
    toggleButton.classList.add('kod-blok-akordiyon-dugme');
    toggleButton.textContent = '▼';
    toggleButton.setAttribute('aria-expanded', 'false');
    toggleButton.setAttribute('aria-controls', preId);
    toggleButton.setAttribute('title', 'Kodu Genişlet/Daralt');

    const closeBtn = document.createElement('button');
    closeBtn.classList.add('kod-blok-bottom-dugme');
    closeBtn.textContent = '▲';
    closeBtn.setAttribute('title', 'Kodu Kapat');
    closeBtn.style.display = 'none';

    preElement.parentNode.insertBefore(wrapper, preElement);
    wrapper.appendChild(toggleButton);
    wrapper.appendChild(preElement);
    wrapper.appendChild(closeBtn);

    preElement.classList.add('kod-blok-icerik-kapali');
    preElement.classList.add('kod-blok-akordiyon-islendi');

    function collapse() {
      preElement.classList.remove('kod-blok-icerik-acik');
      preElement.classList.add('kod-blok-icerik-kapali');
      toggleButton.textContent = '▼';
      toggleButton.setAttribute('aria-expanded', 'false');
      closeBtn.style.display = 'none';
      preElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    toggleButton.addEventListener('click', () => {
      const isExpanded = preElement.classList.toggle('kod-blok-icerik-acik');
      preElement.classList.toggle('kod-blok-icerik-kapali', !isExpanded);
      toggleButton.textContent = isExpanded ? '▲' : '▼';
      toggleButton.setAttribute('aria-expanded', String(isExpanded));
      closeBtn.style.display = isExpanded ? 'block' : 'none';
      if (isExpanded) {
        preElement.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'end' });
      }
    });

    closeBtn.addEventListener('click', collapse);
  }

  const initialPreElements = document.querySelectorAll('pre');
  initialPreElements.forEach(pre => processPreElement(pre));

  const observer = new MutationObserver(mutations => {
    mutations.forEach(m => {
      if (m.type === 'childList') {
        m.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === 'PRE') processPreElement(node);
            else if (node.querySelectorAll) node.querySelectorAll('pre').forEach(pre => processPreElement(pre));
          }
        });
      }
    });
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
})();

// New Sidebar Feature for Triple Backtick Code Blocks
(() => {
  let sidebarInitialized = false;
  let sidebarToggleBtn;
  let sidebarContainer;
  let snippetsListContainer;
  let fullPreviewContainer;
  let fullPreviewContentElement;
  let fullPreviewCopyBtnElement;

  const SIDEBAR_ID = 'backtick-sidebar-container-fwk';
  const TOGGLE_BTN_ID = 'backtick-sidebar-toggle-btn-fwk';
  const SNIPPETS_LIST_ID = 'backtick-sidebar-snippets-list-fwk';
  const FULL_PREVIEW_ID = 'backtick-sidebar-full-preview-fwk';
  const FULL_PREVIEW_CONTENT_ID = 'backtick-sidebar-full-preview-content-fwk';
  const FULL_PREVIEW_COPY_BTN_ID = 'backtick-sidebar-full-preview-copy-btn-fwk';
  const FULL_PREVIEW_CLOSE_BTN_ID = 'backtick-sidebar-full-preview-close-btn-fwk';

  // Draggability state variables
  let dragOffsetX, dragOffsetY;
  let activeDragElement = null;

  function startDrag(e, element) {
    // Only drag with the primary mouse button (usually left)
    if (e.button !== 0) return;
    e.preventDefault(); // Prevent text selection during drag and other default actions

    activeDragElement = element;
    element.style.cursor = 'grabbing'; // Indicate dragging

    const rect = element.getBoundingClientRect();

    // If 'left' is not set (i.e., it's likely positioned by 'right' from CSS or no saved 'left'),
    // explicitly set 'left' and 'top' from current geometry.
    // This transitions from 'right' positioning to 'left' positioning for dragging.
    if (!element.style.left || element.style.left === 'auto') {
      element.style.left = `${rect.left}px`;
    }
    if (!element.style.top || element.style.top === 'auto') {
      element.style.top = `${rect.top}px`;
    }
    // Ensure 'left' takes precedence by clearing 'right' if it was set by CSS.
    element.style.right = 'auto';

    dragOffsetX = e.clientX - parseFloat(element.style.left);
    dragOffsetY = e.clientY - parseFloat(element.style.top);

    document.addEventListener('mousemove', dragActiveElement);
    document.addEventListener('mouseup', stopDragActiveElement);
    // Add mouseleave on document to catch cases where mouse leaves window during drag
    document.addEventListener('mouseleave', stopDragActiveElementIfMouseLeftWindow);
  }

  function dragActiveElement(e) {
    if (!activeDragElement) return;
    e.preventDefault();

    let newLeft = e.clientX - dragOffsetX;
    let newTop = e.clientY - dragOffsetY;

    // Constrain to viewport
    const elWidth = activeDragElement.offsetWidth;
    const elHeight = activeDragElement.offsetHeight;
    newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - elWidth));
    newTop = Math.max(0, Math.min(newTop, window.innerHeight - elHeight));

    activeDragElement.style.left = `${newLeft}px`;
    activeDragElement.style.top = `${newTop}px`;
  }

  function stopDragActiveElement() {
    if (!activeDragElement) return;
    activeDragElement.style.cursor = 'grab'; // Reset cursor

    // Save position to localStorage
    localStorage.setItem('sidebarToggleBtnTopFwk', activeDragElement.style.top);
    localStorage.setItem('sidebarToggleBtnLeftFwk', activeDragElement.style.left);

    document.removeEventListener('mousemove', dragActiveElement);
    document.removeEventListener('mouseup', stopDragActiveElement);
    document.removeEventListener('mouseleave', stopDragActiveElementIfMouseLeftWindow);
    activeDragElement = null;
  }
  
  function stopDragActiveElementIfMouseLeftWindow(e) {
    // Check if the mouse has truly left the document window
    if (!e.relatedTarget && !e.toElement) {
        stopDragActiveElement();
    }
  }

  function makeDraggable(element) {
    element.addEventListener('mousedown', (e) => startDrag(e, element));
    element.style.cursor = 'grab'; // Initial cursor
  }

  function createSidebarElements() {
    if (document.getElementById(TOGGLE_BTN_ID)) return;

    sidebarToggleBtn = document.createElement('button');
    sidebarToggleBtn.id = TOGGLE_BTN_ID;
    sidebarToggleBtn.innerHTML = '{}';
    sidebarToggleBtn.title = 'Kod Parçacıkları Kenar Çubuğunu Aç/Kapat (Taşımak için sürükleyin)';
    sidebarToggleBtn.addEventListener('click', toggleSidebar);

    // Load saved position or use CSS default
    const savedTop = localStorage.getItem('sidebarToggleBtnTopFwk');
    const savedLeft = localStorage.getItem('sidebarToggleBtnLeftFwk');

    if (savedTop && savedLeft) {
      sidebarToggleBtn.style.top = savedTop;
      sidebarToggleBtn.style.left = savedLeft;
      sidebarToggleBtn.style.right = 'auto'; // Ensure 'left' takes precedence
    } else {
      // CSS will handle initial position (top: 10px; right: 10px;)
      // No explicit setting needed here for default if CSS is in place.
    }

    document.body.appendChild(sidebarToggleBtn);
    makeDraggable(sidebarToggleBtn); // Make the button draggable

    sidebarContainer = document.createElement('div');
    sidebarContainer.id = SIDEBAR_ID;
    sidebarContainer.style.display = 'none';

    const header = document.createElement('div');
    header.className = 'sidebar-header-fwk';
    const title = document.createElement('h3');
    title.textContent = 'Algılanan Kod Parçacıkları';
    header.appendChild(title);

    const closeSidebarBtn = document.createElement('button');
    closeSidebarBtn.textContent = '✕';
    closeSidebarBtn.className = 'sidebar-main-close-btn-fwk';
    closeSidebarBtn.title = 'Kenar Çubuğunu Kapat';
    closeSidebarBtn.onclick = () => {
      sidebarContainer.style.display = 'none';
      if (sidebarToggleBtn) sidebarToggleBtn.classList.remove('active');
      if (fullPreviewContainer) fullPreviewContainer.style.display = 'none';
      if (snippetsListContainer) snippetsListContainer.style.display = 'block';
    };
    header.appendChild(closeSidebarBtn);
    sidebarContainer.appendChild(header);

    snippetsListContainer = document.createElement('div');
    snippetsListContainer.id = SNIPPETS_LIST_ID;
    sidebarContainer.appendChild(snippetsListContainer);

    fullPreviewContainer = document.createElement('div');
    fullPreviewContainer.id = FULL_PREVIEW_ID;
    fullPreviewContainer.style.display = 'none';

    const previewHeader = document.createElement('div');
    previewHeader.className = 'preview-header-fwk';
    const previewTitle = document.createElement('h4');
    previewTitle.textContent = 'Kod Önizleme';
    previewHeader.appendChild(previewTitle);
    
    const previewControls = document.createElement('div');
    previewControls.className = 'preview-controls-fwk';

    const previewCloseBtn = document.createElement('button');
    previewCloseBtn.id = FULL_PREVIEW_CLOSE_BTN_ID;
    previewCloseBtn.textContent = 'Listeye Dön';
    previewCloseBtn.onclick = () => {
      fullPreviewContainer.style.display = 'none';
      if (snippetsListContainer) snippetsListContainer.style.display = 'block';
    };
    previewControls.appendChild(previewCloseBtn);

    fullPreviewCopyBtnElement = document.createElement('button');
    fullPreviewCopyBtnElement.id = FULL_PREVIEW_COPY_BTN_ID;
    fullPreviewCopyBtnElement.className = 'copy-btn-fwk';
    fullPreviewCopyBtnElement.textContent = 'Kodu Kopyala';
    previewControls.appendChild(fullPreviewCopyBtnElement);
    previewHeader.appendChild(previewControls);
    fullPreviewContainer.appendChild(previewHeader);

    fullPreviewContentElement = document.createElement('pre');
    fullPreviewContentElement.id = FULL_PREVIEW_CONTENT_ID;
    fullPreviewContainer.appendChild(fullPreviewContentElement);

    sidebarContainer.appendChild(fullPreviewContainer);
    document.body.appendChild(sidebarContainer);
    sidebarInitialized = true;
  }

  function toggleSidebar() {
    if (!sidebarInitialized) {
        init(); 
    }

    if (sidebarContainer.style.display === 'none') {
      sidebarContainer.style.display = 'block'; 
      sidebarToggleBtn.classList.add('active');
      scanAndDisplaySnippets();
      fullPreviewContainer.style.display = 'none'; 
      snippetsListContainer.style.display = 'block'; 
    } else {
      sidebarContainer.style.display = 'none';
      sidebarToggleBtn.classList.remove('active');
    }
  }

  function extractSnippets() {
    const snippets = [];
    const regex = /```([\s\S]*?)```/g;
    const pageText = document.body.innerText;
    let match;
    let idCounter = 0;

    while ((match = regex.exec(pageText)) !== null) {
      let rawContentInsideBackticks = match[1]; 
      
      if (typeof rawContentInsideBackticks !== 'string') {
          rawContentInsideBackticks = '';
      }

      let codeToStore = rawContentInsideBackticks.trim();
      const lines = codeToStore.split('\n');

      if (lines.length > 0) {
        const firstLine = lines[0].trim(); 
        if (lines.length > 1 && 
            firstLine.length > 0 && 
            firstLine.length < 25 &&
            /^[a-zA-Z0-9_+\-#]*$/.test(firstLine)
            ) {
          codeToStore = lines.slice(1).join('\n').trim();
        }
      }
      const finalSnippetText = '\n' + codeToStore;

      snippets.push({
        id: `snippet-${Date.now()}-${idCounter++}`,
        fullText: finalSnippetText,
        preview: finalSnippetText.substring(0, 101) + (finalSnippetText.length > 101 ? '...' : '')
      });
    }
    return snippets;
  }


  function scanAndDisplaySnippets() {
    if (!snippetsListContainer) return;
    snippetsListContainer.innerHTML = ''; 
    const snippets = extractSnippets();

    if (snippets.length === 0) {
      snippetsListContainer.innerHTML = '<p class="no-snippets-message-fwk">Bu sayfada üçlü backtick (```) ile çevrili kod bloğu bulunamadı.</p>';
      return;
    }

    snippets.forEach(snippet => {
      const card = document.createElement('div');
      card.className = 'code-card-fwk';
      card.onclick = () => displayFullSnippet(snippet);

      const previewPre = document.createElement('pre');
      previewPre.className = 'code-card-preview-fwk';
      previewPre.textContent = snippet.preview;
      card.appendChild(previewPre);

      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-btn-fwk code-card-copy-btn-fwk';
      copyBtn.textContent = 'Kopyala';
      copyBtn.onclick = (e) => {
        e.stopPropagation(); 
        copyToClipboard(snippet.fullText, copyBtn);
      };
      card.appendChild(copyBtn);
      snippetsListContainer.appendChild(card);
    });
  }

  function displayFullSnippet(snippet) {
    if (!fullPreviewContainer || !fullPreviewContentElement || !snippetsListContainer) return;
    
    fullPreviewContentElement.textContent = snippet.fullText;
    fullPreviewCopyBtnElement.onclick = () => copyToClipboard(snippet.fullText, fullPreviewCopyBtnElement);
    
    snippetsListContainer.style.display = 'none'; 
    fullPreviewContainer.style.display = 'block'; 
    fullPreviewContainer.scrollTop = 0; 
  }

  function copyToClipboard(text, buttonElement) {
    const textToCopy = text.startsWith('\n') ? text.substring(1) : text;
    navigator.clipboard.writeText(textToCopy).then(() => {
      const originalText = buttonElement.textContent;
      buttonElement.textContent = 'Kopyalandı!';
      buttonElement.disabled = true;
      setTimeout(() => {
        buttonElement.textContent = originalText;
        buttonElement.disabled = false;
      }, 2000);
    }).catch(err => {
      console.error('Metin kopyalanamadı: ', err);
      const originalText = buttonElement.textContent;
      buttonElement.textContent = 'Başarısız!';
      setTimeout(() => { buttonElement.textContent = originalText; buttonElement.disabled = false; }, 2000);
    });
  }

  function init() {
    if (sidebarInitialized) return;
    createSidebarElements();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init(); 
  }
})();