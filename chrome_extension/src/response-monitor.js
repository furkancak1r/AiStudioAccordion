// chrome_extension/src/response-monitor.js
let currentResponseState = null;
let notificationAudio = null;

function initNotificationSound() {
  try {
    // Wait a bit for notification-sound.js to load
    const checkAudioData = () => {
      if (typeof window !== 'undefined' && window.notificationAudioData) {
        notificationAudio = new Audio(window.notificationAudioData);
        notificationAudio.volume = 0.5;
        console.log('Bildirim sesi başarıyla yüklendi.');
      } else {
        console.warn('Bildirim sesi verisi bulunamadı.');
      }
    };
    
    // Check immediately and after a short delay
    checkAudioData();
    setTimeout(checkAudioData, 100);
  } catch (error) {
    console.warn('Bildirim sesi yüklenemedi:', error);
  }
}

function playNotificationSound() {
  if (notificationAudio) {
    try {
      notificationAudio.currentTime = 0;
      notificationAudio.play().catch(e => console.warn('Ses çalamadı:', e));
    } catch (error) {
      console.warn('Ses çalma hatası:', error);
    }
  }
}

function checkResponseStatus() {
  const spans = document.querySelectorAll('span');
  let foundStatus = null;
  
  spans.forEach(span => {
    const text = span.textContent.trim();
    if (text === 'Ctrl' || text === 'Stop') {
      foundStatus = text;
    }
  });
  
  if (foundStatus !== currentResponseState) {
    if (currentResponseState === 'Stop' && foundStatus === 'Ctrl') {
      playNotificationSound();
    }
    
    currentResponseState = foundStatus;
    
  }
}

function startResponseMonitoring() {
  initNotificationSound();
  
  const observer = new MutationObserver((mutations) => {
    let shouldCheck = false;
    
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            if (node.tagName === 'SPAN' || node.querySelector && node.querySelector('span')) {
              shouldCheck = true;
            }
          }
        });
      } else if (mutation.type === 'characterData') {
        const parent = mutation.target.parentNode;
        if (parent && parent.tagName === 'SPAN') {
          shouldCheck = true;
        }
      }
    });
    
    if (shouldCheck) {
      setTimeout(checkResponseStatus, 100);
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
  
  setInterval(checkResponseStatus, 1000);
  
}

if (typeof window !== 'undefined') {
  window.AIResponseMonitor = {
    start: startResponseMonitoring,
    playSound: playNotificationSound
  };
}
