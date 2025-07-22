// C:/Users/furkan.cakir/Desktop/FurkanPRS/Kodlar/test/AiStudioAccordion/chrome_extension/src/accordion.js
(function() {
    'use strict';

    let uniqueIdCounter = 0;

    function forceLoadAndGetContent(preElement, buttonElement) {
        return new Promise((resolve) => {
            const wrapper = preElement.closest('.kod-blok-akordiyon-sarmalayici');
            if (!wrapper) {
                resolve(preElement.textContent || '');
                return;
            }
    
            buttonElement.classList.add('processing');
            buttonElement.disabled = true;
    
            const wasCollapsed = preElement.classList.contains('kod-blok-icerik-kapali');
            if (wasCollapsed) {
                preElement.classList.add('kod-blok-icerik-acik');
                preElement.classList.remove('kod-blok-icerik-kapali');
            }
    
            let lastScrollHeight = 0;
            let stableCount = 0;
            const maxStableChecks = 5;
            const maxTimeout = 10000;
            let startTime = Date.now();
            
            const scrollInterval = setInterval(() => {
                preElement.scrollTop = preElement.scrollHeight;
    
                if (preElement.scrollHeight === lastScrollHeight) {
                    stableCount++;
                    if (stableCount >= maxStableChecks) {
                        clearInterval(scrollInterval);
                        
                        setTimeout(() => {
                            preElement.scrollTop = preElement.scrollHeight;
                            setTimeout(() => {
                                const fullContent = preElement.textContent || '';
                                buttonElement.classList.remove('processing');
                                resolve(fullContent);
                            }, 100);
                        }, 200);
                    }
                } else {
                    lastScrollHeight = preElement.scrollHeight;
                    stableCount = 0;
                }
                
                if (Date.now() - startTime > maxTimeout) {
                    clearInterval(scrollInterval);
                    preElement.scrollTop = preElement.scrollHeight;
                    setTimeout(() => {
                        const fullContent = preElement.textContent || '';
                        buttonElement.classList.remove('processing');
                        resolve(fullContent);
                    }, 100);
                }
            }, 150);
        });
    }

    function collapseAccordion(preElement) {
        const wrapper = preElement.closest('.kod-blok-akordiyon-sarmalayici');
        if (!wrapper) return;

        const toggleButton = wrapper.querySelector('.kod-blok-akordiyon-dugme');
        const closeBtn = wrapper.querySelector('.kod-blok-bottom-dugme');

        preElement.classList.remove('kod-blok-icerik-acik');
        preElement.classList.add('kod-blok-icerik-kapali');
        preElement.scrollTop = 0;

        if (toggleButton) {
            toggleButton.textContent = '▼';
            toggleButton.setAttribute('aria-expanded', 'false');
            toggleButton.setAttribute('title', 'Kodu Genişlet');
        }
        if (closeBtn) {
            closeBtn.style.display = 'none';
        }
    }
    
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
        wrapper.style.position = 'relative';

        const toggleButton = document.createElement('button');
        toggleButton.classList.add('kod-blok-akordiyon-dugme');
        toggleButton.textContent = '▼';
        toggleButton.setAttribute('aria-expanded', 'false');
        toggleButton.setAttribute('aria-controls', preId);
        toggleButton.setAttribute('title', 'Kodu Genişlet');

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
            collapseAccordion(preElement);
            wrapper.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
            });
        }

        toggleButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const isExpanded = preElement.classList.toggle('kod-blok-icerik-acik');
            preElement.classList.toggle('kod-blok-icerik-kapali', !isExpanded);
            
            this.textContent = isExpanded ? '▲' : '▼';
            this.setAttribute('aria-expanded', String(isExpanded));
            this.setAttribute('title', isExpanded ? 'Kodu Daralt' : 'Kodu Genişlet');
            
            closeBtn.style.display = isExpanded ? 'block' : 'none';
            
            if (isExpanded) {
                preElement.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start', 
                    inline: 'end' 
                });
            }
        });

        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            collapse();
        });
    }

    function processAllPreElements() {
        document.querySelectorAll('pre').forEach(processPreElement);
    }

    function init() {
        processAllPreElements();

        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.tagName === 'PRE') {
                                processPreElement(node);
                            }
                            else if (node.querySelectorAll) {
                                node.querySelectorAll('pre').forEach(processPreElement);
                            }
                        }
                    });
                }
            });
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    function cleanup() {
        document.querySelectorAll('.kod-blok-akordiyon-islendi').forEach(function(element) {
            element.classList.remove('kod-blok-akordiyon-islendi');
        });
    }

    window.AIStudioAccordion = {
        init: init,
        cleanup: cleanup,
        processAllPreElements: processAllPreElements,
        forceLoadAndGetContent: forceLoadAndGetContent,
        collapseAccordion: collapseAccordion
    };

})();