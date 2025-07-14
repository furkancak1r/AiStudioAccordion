// popup.js
const STORAGE_KEY = 'selectedIDE';

document.addEventListener('DOMContentLoaded', function() {
    const ideOptions = document.querySelectorAll('.ide-option');
    
    // Load current selection if exists
    chrome.storage.local.get([STORAGE_KEY], function(result) {
        if (result[STORAGE_KEY]) {
            // If IDE is already selected, show current selection and close
            showCurrentSelection(result[STORAGE_KEY]);
        } else {
            // Show selection interface
            showSelectionInterface();
        }
    });
    
    // Handle IDE selection
    ideOptions.forEach(option => {
        option.addEventListener('click', function() {
            const selectedIDE = this.dataset.ide;
            
            // Add selection animation
            this.classList.add('selecting');
            
            // Save selection
            chrome.storage.local.set({[STORAGE_KEY]: selectedIDE}, function() {
                console.log('IDE tercihi kaydedildi:', selectedIDE);
                
                // Show success feedback
                showSuccessMessage(selectedIDE);
                
                // Close popup after short delay
                setTimeout(() => {
                    window.close();
                }, 1000);
            });
        });
    });
});

function showCurrentSelection(selectedIDE) {
    const container = document.querySelector('.popup-container');
    const ideName = selectedIDE === 'cursor' ? 'Cursor' : 'Visual Studio Code';
    
    container.innerHTML = `
        <div class="popup-header">
            <h2>✅ IDE Ayarlandı</h2>
            <p>Şu anda <strong>${ideName}</strong> kullanıyorsunuz.</p>
        </div>
        <div style="text-align: center; padding: 20px;">
            <div style="margin-bottom: 16px;">
                ${selectedIDE === 'cursor' ? 
                    '<svg width="48" height="48" viewBox="0 0 24 24" fill="#00d4aa"><path d="M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10S2 17.52 2 12zm4.64-1.96l3.54 3.54c.78.78 2.05.78 2.83 0l7.07-7.07c.78-.78.78-2.05 0-2.83L16.54 1.96c-.78-.78-2.05-.78-2.83 0L6.64 9.04c-.78.78-.78 2.05 0 2.83z"/></svg>' :
                    '<svg width="48" height="48" viewBox="0 0 24 24" fill="#0078d4"><path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352z"/></svg>'
                }
            </div>
            <button id="changeIDE" style="
                background: #4299e1; 
                color: white; 
                border: none; 
                padding: 8px 16px; 
                border-radius: 8px; 
                cursor: pointer;
                font-size: 12px;
                transition: background 0.2s;
            ">
                Değiştir
            </button>
        </div>
    `;
    
    // Handle change button with proper event listeners
    const changeBtn = document.getElementById('changeIDE');
    if (changeBtn) {
        // Add hover effects
        changeBtn.addEventListener('mouseenter', function() {
            this.style.background = '#3182ce';
        });
        changeBtn.addEventListener('mouseleave', function() {
            this.style.background = '#4299e1';
        });
        
        // Add click handler
        changeBtn.addEventListener('click', function() {
            chrome.storage.local.remove([STORAGE_KEY], function() {
                location.reload();
            });
        });
    }
}

function showSelectionInterface() {
    // Default interface is already loaded
    // Just ensure cursor is pre-selected visually
    const cursorOption = document.querySelector('.cursor-option');
    if (cursorOption) {
        cursorOption.style.borderColor = '#3182ce';
        cursorOption.style.background = '#ebf8ff';
    }
}

function showSuccessMessage(selectedIDE) {
    const container = document.querySelector('.popup-container');
    const ideName = selectedIDE === 'cursor' ? 'Cursor' : 'Visual Studio Code';
    
    container.innerHTML = `
        <div class="popup-header">
            <h2>🎉 Başarılı!</h2>
            <p><strong>${ideName}</strong> seçildi ve kaydedildi.</p>
        </div>
        <div style="text-align: center; padding: 30px;">
            <div style="
                width: 60px; 
                height: 60px; 
                background: #48bb78; 
                border-radius: 50%; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                margin: 0 auto 16px;
                animation: checkPulse 0.6s ease-in-out;
            ">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
            </div>
            <p style="color: #718096; font-size: 14px;">Artık kodları ${ideName}'a gönderebilirsiniz!</p>
        </div>
    `;
    
    // Add success animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes checkPulse {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}