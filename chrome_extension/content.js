// C:/Users/furkan.cakir/Desktop/FurkanPRS/Kodlar/test/AiStudioAccordion/chrome_extension/content.js
(() => {
  const modules = [
    'modules/accordion.js',
    'modules/copyButton.js',
    'modules/userMessageTruncator.js',
    'modules/planManager.js'
  ];

  function injectScript(filePath) {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL(filePath);
    script.type = 'module';
    (document.head || document.documentElement).appendChild(script);
    script.onload = () => {
      script.remove();
    };
  }

  modules.forEach(injectScript);
})();