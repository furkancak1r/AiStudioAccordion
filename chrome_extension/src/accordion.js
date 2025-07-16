// accordion.js - Code block accordion functionality (based on working old version)

(function() {
    'use strict';

    let uniqueIdCounter = 0;
    
    // Process a single pre element
    function processPreElement(preElement) {
        // Skip if element doesn't exist or doesn't have attributes
        if (!preElement || !preElement.attributes) return;
        
        // Skip if already processed
        if (preElement.classList.contains('kod-blok-akordiyon-islendi')) return;
        
        // Check for _ngcontent-ng-c attributes (AI Studio specific)
        let hasNgContent = false;
        for (const attr of preElement.attributes) {
            if (attr.name.startsWith('_ngcontent-ng-c')) {
                hasNgContent = true;
                break;
            }
        }
        if (!hasNgContent) return;

        // Generate unique ID for this pre element
        uniqueIdCounter++;
        const preId = `kod-blok-icerik-${uniqueIdCounter}`;
        preElement.id = preId;

        // Create wrapper div
        const wrapper = document.createElement('div');
        wrapper.classList.add('kod-blok-akordiyon-sarmalayici');
        wrapper.style.position = 'relative'; // Ensure positioning for buttons

        // Create top toggle button
        const toggleButton = document.createElement('button');
        toggleButton.classList.add('kod-blok-akordiyon-dugme');
        toggleButton.textContent = '▼';
        toggleButton.setAttribute('aria-expanded', 'false');
        toggleButton.setAttribute('aria-controls', preId);
        toggleButton.setAttribute('title', 'Kodu Genişlet');

        // Create bottom close button
        const closeBtn = document.createElement('button');
        closeBtn.classList.add('kod-blok-bottom-dugme');
        closeBtn.textContent = '▲';
        closeBtn.setAttribute('title', 'Kodu Kapat');
        closeBtn.style.display = 'none'; // Hidden by default

        // Insert wrapper before pre element
        preElement.parentNode.insertBefore(wrapper, preElement);
        
        // Build structure: wrapper > [toggleButton, preElement, closeBtn]
        wrapper.appendChild(toggleButton);
        wrapper.appendChild(preElement);
        wrapper.appendChild(closeBtn);

        // Set initial state - collapsed
        preElement.classList.add('kod-blok-icerik-kapali');
        preElement.classList.add('kod-blok-akordiyon-islendi'); // Mark as processed

        // Collapse function
        function collapse() {
            preElement.classList.remove('kod-blok-icerik-acik');
            preElement.classList.add('kod-blok-icerik-kapali');
            toggleButton.textContent = '▼';
            toggleButton.setAttribute('aria-expanded', 'false');
            toggleButton.setAttribute('title', 'Kodu Genişlet');
            closeBtn.style.display = 'none';
            
            // Smooth scroll to top of element
            preElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }

        // Top button click handler - toggle expand/collapse
        toggleButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Toggle the expanded state
            const isExpanded = preElement.classList.toggle('kod-blok-icerik-acik');
            preElement.classList.toggle('kod-blok-icerik-kapali', !isExpanded);
            
            // Update button appearance and state
            toggleButton.textContent = isExpanded ? '▲' : '▼';
            toggleButton.setAttribute('aria-expanded', String(isExpanded));
            toggleButton.setAttribute('title', isExpanded ? 'Kodu Daralt' : 'Kodu Genişlet');
            
            // Show/hide bottom button
            closeBtn.style.display = isExpanded ? 'block' : 'none';
            
            // If expanding, scroll to show the content
            if (isExpanded) {
                preElement.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start', 
                    inline: 'end' 
                });
            }
        });

        // Bottom button click handler - always collapse
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            collapse();
        });
    }

    // Process all existing pre elements
    function processAllPreElements() {
        document.querySelectorAll('pre').forEach(processPreElement);
    }

    // Initialize accordion functionality
    function init() {
        // Process existing pre elements
        processAllPreElements();

        // Set up mutation observer to handle dynamically added elements
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if the added node is a pre element
                            if (node.tagName === 'PRE') {
                                processPreElement(node);
                            }
                            // Check if the added node contains pre elements
                            else if (node.querySelectorAll) {
                                node.querySelectorAll('pre').forEach(processPreElement);
                            }
                        }
                    });
                }
            });
        });

        // Start observing
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    // Cleanup function
    function cleanup() {
        // Remove processed class from all elements for re-processing if needed
        document.querySelectorAll('.kod-blok-akordiyon-islendi').forEach(function(element) {
            element.classList.remove('kod-blok-akordiyon-islendi');
        });
    }

    // Export functions to global scope
    window.AIStudioAccordion = {
        init: init,
        cleanup: cleanup,
        processAllPreElements: processAllPreElements
    };

})();