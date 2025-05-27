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