// messages.js - User message truncation for better performance

(function() {
    'use strict';

    // Constants
    const TRUNCATE_LENGTH = 10; // Show only first 10 words
    const MESSAGE_STATE_KEY = 'aistudio-message-states';
    const DEBOUNCE_DELAY = 100;
    const MAX_MESSAGES = 50; // Reduced from 100
    const MAX_STORAGE_SIZE = 1000000; // 1MB limit (reduced from 5MB)

    // Store original messages
    const messageStates = new Map();
    let debounceTimer = null;
    let observer = null;

    // Import truncateText from ui module
    const truncateText = (text, wordLimit = TRUNCATE_LENGTH) => {
        const words = text.trim().split(/\s+/);
        if (words.length <= wordLimit) return text;
        return words.slice(0, wordLimit).join(' ') + '...';
    };

    // Save message states to sessionStorage with better error handling
    function saveMessageStates() {
        try {
            // Check current storage size first
            const currentData = sessionStorage.getItem(MESSAGE_STATE_KEY);
            if (currentData) {
                const currentSize = new Blob([currentData]).size;
                if (currentSize > MAX_STORAGE_SIZE) {
                    clearOldMessageStates();
                }
            }

            const states = {};
            messageStates.forEach((value, key) => {
                // Limit individual message size
                if (value.originalText && value.originalText.length > 1000) {
                    value.originalText = value.originalText.substring(0, 1000) + '...';
                }
                states[key] = value;
            });
            
            const dataToSave = JSON.stringify(states);
            const newSize = new Blob([dataToSave]).size;
            
            // Final size check
            if (newSize > MAX_STORAGE_SIZE) {
                clearOldMessageStates();
                // Try again with reduced data
                const reducedStates = {};
                const entries = Array.from(messageStates.entries()).slice(0, 25);
                entries.forEach(([key, value]) => {
                    reducedStates[key] = value;
                });
                sessionStorage.setItem(MESSAGE_STATE_KEY, JSON.stringify(reducedStates));
            } else {
                sessionStorage.setItem(MESSAGE_STATE_KEY, dataToSave);
            }
        } catch (e) {
            console.warn('Failed to save message states, clearing old data:', e);
            clearOldMessageStates();
            try {
                // Try with minimal data
                const minimalStates = {};
                const entries = Array.from(messageStates.entries()).slice(0, 10);
                entries.forEach(([key, value]) => {
                    minimalStates[key] = value;
                });
                sessionStorage.setItem(MESSAGE_STATE_KEY, JSON.stringify(minimalStates));
            } catch (e2) {
                console.error('Failed to save message states after cleanup:', e2);
                // Last resort: clear everything
                messageStates.clear();
                sessionStorage.removeItem(MESSAGE_STATE_KEY);
            }
        }
    }

    // Load message states from sessionStorage
    function loadMessageStates() {
        try {
            const saved = sessionStorage.getItem(MESSAGE_STATE_KEY);
            if (saved) {
                const states = JSON.parse(saved);
                Object.entries(states).forEach(([key, value]) => {
                    messageStates.set(key, value);
                });
                
                // Clean up if too many messages loaded
                if (messageStates.size > MAX_MESSAGES) {
                    clearOldMessageStates();
                }
            }
        } catch (e) {
            console.error('Failed to load message states:', e);
            clearOldMessageStates();
        }
    }

    // Clear old message states to free up storage
    function clearOldMessageStates() {
        try {
            // Keep only the most recent messages
            const entries = Array.from(messageStates.entries());
            if (entries.length > MAX_MESSAGES) {
                const sortedEntries = entries.sort((a, b) => {
                    // Sort by timestamp if available, otherwise keep newer entries
                    const aTime = a[1].timestamp || 0;
                    const bTime = b[1].timestamp || 0;
                    return bTime - aTime;
                });
                
                messageStates.clear();
                sortedEntries.slice(0, MAX_MESSAGES).forEach(([key, value]) => {
                    messageStates.set(key, value);
                });
            }
            
            // Clear from sessionStorage
            sessionStorage.removeItem(MESSAGE_STATE_KEY);
        } catch (e) {
            console.error('Failed to clear old message states:', e);
            // Last resort: clear everything
            messageStates.clear();
            sessionStorage.removeItem(MESSAGE_STATE_KEY);
        }
    }

    // Generate unique ID for message element
    function getMessageId(element) {
        // Try to use existing ID or generate based on content
        if (element.id) return element.id;
        
        // Get parent turn ID if available
        const turnElement = element.closest('ms-chat-turn');
        if (turnElement && turnElement.id) {
            return `msg-${turnElement.id}`;
        }
        
        // Fallback to content hash (shorter)
        const content = element.textContent || '';
        return `msg-${content.substring(0, 30).replace(/\s+/g, '-')}`;
    }

    // Toggle message expansion
    function toggleMessage(element, messageId) {
        const state = messageStates.get(messageId);
        if (!state) return;

        state.isExpanded = !state.isExpanded;
        
        // Update display
        if (state.isExpanded) {
            element.textContent = state.originalText;
            element.classList.add('aistudio-message-expanded');
            element.classList.remove('aistudio-message-truncated');
        } else {
            element.textContent = state.truncatedText;
            element.classList.add('aistudio-message-truncated');
            element.classList.remove('aistudio-message-expanded');
        }

        // Debounce save to reduce storage writes
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        debounceTimer = setTimeout(() => {
            saveMessageStates();
        }, 500);
    }

    // Process a single message element
    function processMessage(element) {
        // Skip if already processed
        if (element.hasAttribute('data-truncated')) return;

        const messageId = getMessageId(element);
        const originalText = element.textContent || '';
        
        // Skip short messages
        const wordCount = originalText.trim().split(/\s+/).length;
        if (wordCount <= TRUNCATE_LENGTH) return;

        // Truncate text
        const truncatedText = truncateText(originalText, TRUNCATE_LENGTH);
        
        // Store state (limit text size)
        const state = {
            originalText: originalText.length > 1000 ? originalText.substring(0, 1000) + '...' : originalText,
            truncatedText,
            isExpanded: false,
            timestamp: Date.now()
        };
        messageStates.set(messageId, state);

        // Apply truncation
        element.textContent = truncatedText;
        element.setAttribute('data-truncated', 'true');
        element.classList.add('aistudio-message-truncated');
        
        // Add click handler
        element.style.cursor = 'pointer';
        element.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMessage(element, messageId);
        });

        // Don't save immediately, let debounce handle it
    }

    // Find and process all user messages
    function processUserMessages() {
        // Clear existing timer
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        // Debounce to avoid processing during rapid updates
        debounceTimer = setTimeout(() => {
            // Find user message elements based on the example HTML structure
            // Looking for user chat turns with text content
            const userMessages = document.querySelectorAll(
                'ms-chat-turn[class*="user"] .turn-content div[class*="text-container"],' +
                'ms-chat-turn .user-prompt-container .turn-content div[class*="text-container"],' +
                '.chat-turn-container.user .turn-content div[class*="text-container"],' +
                '.user-prompt-container .turn-content .very-large-text-container'
            );

            userMessages.forEach(processMessage);
            
            // Save after processing all messages
            setTimeout(() => {
                saveMessageStates();
            }, 100);
        }, DEBOUNCE_DELAY);
    }

    // Restore message states after page updates
    function restoreMessageStates() {
        messageStates.forEach((state, messageId) => {
            const elements = document.querySelectorAll(`[data-truncated="true"]`);
            elements.forEach(element => {
                if (getMessageId(element) === messageId) {
                    if (state.isExpanded) {
                        element.textContent = state.originalText;
                        element.classList.add('aistudio-message-expanded');
                        element.classList.remove('aistudio-message-truncated');
                    }
                }
            });
        });
    }

    // Initialize message monitoring
    function init() {
        // Clear any corrupted storage first
        try {
            sessionStorage.removeItem(MESSAGE_STATE_KEY);
        } catch (e) {
            console.warn('Failed to clear storage on init:', e);
        }
        
        // Load saved states
        loadMessageStates();

        // Process existing messages
        processUserMessages();

        // Set up mutation observer
        observer = new MutationObserver((mutations) => {
            let shouldProcess = false;

            mutations.forEach(mutation => {
                // Check for new nodes
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if it's a message container or contains messages
                        if (node.classList && (
                            node.classList.contains('chat-turn-container') ||
                            node.classList.contains('turn-content') ||
                            node.classList.contains('user-prompt-container') ||
                            node.tagName === 'MS-CHAT-TURN' ||
                            (node.querySelector && (
                                node.querySelector('.turn-content') ||
                                node.querySelector('.user-prompt-container') ||
                                node.querySelector('ms-chat-turn')
                            ))
                        )) {
                            shouldProcess = true;
                        }
                    }
                });

                // Check for text changes in existing messages
                if (mutation.type === 'characterData' || mutation.type === 'childList') {
                    const target = mutation.target;
                    if (target.nodeType === Node.TEXT_NODE) {
                        // For text nodes, check parent element
                        const container = target.parentElement?.closest('.turn-content, .user-prompt-container, ms-chat-turn');
                        if (container) {
                            shouldProcess = true;
                        }
                    } else if (target.nodeType === Node.ELEMENT_NODE) {
                        // For element nodes, use closest directly
                        const container = target.closest('.turn-content, .user-prompt-container, ms-chat-turn');
                        if (container) {
                            shouldProcess = true;
                        }
                    }
                }
            });

            if (shouldProcess) {
                processUserMessages();
                // Also restore states in case AI Studio recreated elements
                restoreMessageStates();
            }
        });

        // Observe the entire document for changes
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });

        // Periodically check for state restoration (fallback for aggressive DOM updates)
        setInterval(() => {
            restoreMessageStates();
        }, 2000);

        // More frequent cleanup to prevent storage issues
        setInterval(() => {
            if (messageStates.size > 25) {
                clearOldMessageStates();
            }
        }, 15000); // Every 15 seconds
    }

    // Clean up function
    function cleanup() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        if (debounceTimer) {
            clearTimeout(debounceTimer);
            debounceTimer = null;
        }
    }

    // Export functions
    window.AIStudioMessages = {
        init,
        cleanup,
        processUserMessages,
        toggleMessage,
        clearOldMessageStates
    };
})();