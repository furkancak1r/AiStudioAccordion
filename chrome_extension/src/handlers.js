// chrome_extension/src/handlers.js
function addSection(content = '', startEditing = false) {
    if (isSidebarCollapsed) {
      toggleSidebar();
    }
    detectedSections.push(content);
    renderSections();
    if (startEditing) {
      const newIndex = detectedSections.length - 1;
      createEditModal(newIndex);
    }
  }
  
  function deleteSection(index) {
    detectedSections.splice(index, 1);
    renderSections();
  }
  
  function copySection(index) {
    const text = "go " + detectedSections[index];
    navigator.clipboard.writeText(text).then(() => {
      const copyBtn = body.querySelector(`[data-index='${index}'] .markdown-copy-btn-fwk`);
      if (copyBtn) {
        const originalContent = copyBtn.innerHTML;
        copyBtn.innerHTML = ICONS.save;
        copyBtn.disabled = true;
        setTimeout(() => {
          copyBtn.innerHTML = originalContent;
          copyBtn.disabled = false;
        }, 1500);
      }
    });
  }
  
  function clearAllSections() {
    if (confirm('Tüm aşamaları silmek istediğinizden emin misiniz?')) {
      detectedSections = [];
      renderSections();
    }
  }
  
  function toggleSidebar() {
    isSidebarCollapsed = !isSidebarCollapsed;
    sidebar.classList.toggle('collapsed', isSidebarCollapsed);
    toggleBtn.style.transform = isSidebarCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)';
    updateCache();
  }
  
  async function importFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        detectedSections.push(text.trim());
        renderSections();
        if (isSidebarCollapsed) {
          toggleSidebar();
        }
      } else {
        alert('Pano boş.');
      }
    } catch (err) {
      console.error('Pano okuma hatası:', err);
      alert('Panoya erişilemedi veya izin verilmedi.');
    }
  }
  
  function sendToPrompt(index) {
      const text = detectedSections[index];
      if (!text) return;
    
      const promptText = `go ${text}`;
      const textarea = document.querySelector('textarea.textarea.gmat-body-medium');
      const runButton = document.querySelector('run-button button[type="submit"]');
    
      if (textarea && runButton) {
        textarea.value = promptText;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        
        setTimeout(() => {
          if (!runButton.disabled) {
              runButton.click();
          }
        }, 100);
      } else {
        console.error('Prompt textarea veya run butonu bulunamadı.');
      }
  }