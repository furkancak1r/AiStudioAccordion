let currentResponseState = null;
let notificationAudio = null;
let completionAudio = null;

function createAudioFromData(dataUri, name) {
    if (!dataUri || dataUri.endsWith('xxx')) {
        return null;
    }
    
    const audio = new Audio();
    audio.onerror = (e) => {
        console.error(`${name} sesi yüklenemedi.`, e);
    };
    audio.src = dataUri;
    audio.load();
    
    return audio;
}

function initNotificationSound() {
    if (typeof window !== 'undefined') {
        notificationAudio = createAudioFromData(window.notificationAudioData, 'Bildirim Sesi');
        if (notificationAudio) {
            notificationAudio.volume = 0.5;
        }

        completionAudio = createAudioFromData(window.completionAudioData, 'Tamamlanma Sesi');
        if (completionAudio) {
            completionAudio.volume = 0.5;
        }
    }
}

function playNotificationSound() {
  if (notificationAudio) {
    try {
      notificationAudio.currentTime = 0;
      notificationAudio.play().catch(e => console.warn('Bildirim sesi çalamadı:', e));
    } catch (error) {
      console.warn('Bildirim sesi çalma hatası:', error);
    }
  }
}

function playCompletionSound() {
  if (completionAudio) {
    try {
      completionAudio.currentTime = 0;
      completionAudio.play().catch(e => console.warn('Tamamlanma sesi çalamadı:', e));
    } catch (error) {
      console.warn('Tamamlanma sesi çalma hatası:', error);
    }
  }
}

function primeAudio() {
  const prime = (audio) => {
    if (audio) {
      const originalVolume = audio.volume;
      audio.volume = 0;
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise.then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.volume = originalVolume;
        }).catch(() => {
          audio.volume = originalVolume;
        });
      }
    }
  };

  prime(notificationAudio);
  prime(completionAudio);
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
      if (window.AIStudioHandlers && typeof window.AIStudioHandlers.handleResponseCompletion === 'function') {
        window.AIStudioHandlers.handleResponseCompletion();
      }
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
    playSound: playNotificationSound,
    playCompletionSound: playCompletionSound,
    primeAudio: primeAudio
  };
}
  