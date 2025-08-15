const STORAGE_KEY = 'selectedIDE';
const SYSTEM_INSTRUCTIONS_KEY = 'systemInstructions';
const AUTO_APPLY_KEY = 'autoApplySystemInstructions';
const MAX_INSTRUCTIONS_SIZE = 50000; // 50KB limit

document.addEventListener('DOMContentLoaded', function() {
    const ideOptions = document.querySelectorAll('.ide-option');
    const systemInstructionsTextarea = document.getElementById('systemInstructions');
    const saveInstructionsBtn = document.getElementById('saveInstructions');
    const clearInstructionsBtn = document.getElementById('clearInstructions');
    const autoApplyToggle = document.getElementById('autoApplyToggle');
    
    chrome.storage.local.get([STORAGE_KEY, SYSTEM_INSTRUCTIONS_KEY, AUTO_APPLY_KEY], function(result) {
        const selectedIDE = result[STORAGE_KEY] || 'cursor';
        updateSelectedVisuals(selectedIDE);
        
        if (result[SYSTEM_INSTRUCTIONS_KEY] && systemInstructionsTextarea) {
            systemInstructionsTextarea.value = result[SYSTEM_INSTRUCTIONS_KEY];
        }
        
        if (autoApplyToggle) {
            autoApplyToggle.checked = result[AUTO_APPLY_KEY] !== false;
        }
    });
    
    ideOptions.forEach(option => {
        option.addEventListener('click', function() {
            const selectedIDE = this.dataset.ide;
            updateSelectedVisuals(selectedIDE);
            
            chrome.storage.local.set({[STORAGE_KEY]: selectedIDE}, function() {
                if (chrome.runtime.lastError) {
                    console.error('IDE tercihi kaydedilemedi:', chrome.runtime.lastError);
                }
            });
        });
    });
    
    if (autoApplyToggle) {
        autoApplyToggle.addEventListener('change', function() {
            const isEnabled = this.checked;
            
            chrome.storage.local.set({[AUTO_APPLY_KEY]: isEnabled}, function() {
                if (chrome.runtime.lastError) {
                    console.error('Otomatik uygulama ayarı kaydedilemedi:', chrome.runtime.lastError);
                } else {
                    showToggleFeedback(isEnabled);
                }
            });
        });
    }
    
    if (saveInstructionsBtn) {
        saveInstructionsBtn.addEventListener('click', function() {
            const instructions = systemInstructionsTextarea.value.trim();
            
            const size = new Blob([instructions]).size;
            if (size > MAX_INSTRUCTIONS_SIZE) {
                alert('Sistem talimatları çok büyük. Lütfen daha kısa talimatlar girin.');
                return;
            }
            
            chrome.storage.local.set({[SYSTEM_INSTRUCTIONS_KEY]: instructions}, function() {
                if (chrome.runtime.lastError) {
                    console.error('Sistem talimatları kaydedilemedi:', chrome.runtime.lastError);
                    alert('Sistem talimatları kaydedilemedi. Lütfen tekrar deneyin.');
                } else {
                    showSaveFeedback();
                }
            });
        });
    }
    
    if (clearInstructionsBtn) {
        clearInstructionsBtn.addEventListener('click', function() {
            systemInstructionsTextarea.value = '';
            
            chrome.storage.local.remove([SYSTEM_INSTRUCTIONS_KEY], function() {
                if (chrome.runtime.lastError) {
                    console.error('Sistem talimatları temizlenemedi:', chrome.runtime.lastError);
                } else {
                    showClearFeedback();
                }
            });
        });
    }
});

function updateSelectedVisuals(selectedIDE) {
    document.querySelectorAll('.ide-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    const selectedOption = document.querySelector(`.ide-option[data-ide="${selectedIDE}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }
}

function showSaveFeedback() {
    const saveBtn = document.getElementById('saveInstructions');
    const originalText = saveBtn.textContent;
    
    saveBtn.textContent = '✅ Kaydedildi!';
    saveBtn.style.background = '#48bb78';
    
    setTimeout(() => {
        saveBtn.textContent = originalText;
        saveBtn.style.background = '#48bb78';
    }, 2000);
}

function showClearFeedback() {
    const clearBtn = document.getElementById('clearInstructions');
    const originalText = clearBtn.textContent;
    
    clearBtn.textContent = '✅ Temizlendi!';
    clearBtn.style.background = '#48bb78';
    
    setTimeout(() => {
        clearBtn.textContent = originalText;
        clearBtn.style.background = '#f56565';
    }, 2000);
}

function showToggleFeedback(isEnabled) {
    const description = document.querySelector('.toggle-description');
    if (!description) return;

    const originalText = description.textContent;
    const originalColor = description.style.color;

    description.textContent = isEnabled ? 'Ayarlar kaydedildi: Otomatik uygulama AÇIK.' : 'Ayarlar kaydedildi: Otomatik uygulama KAPALI.';
    description.style.color = '#48bb78';
    
    setTimeout(() => {
        description.textContent = originalText;
        description.style.color = originalColor;
    }, 2000);
}
  