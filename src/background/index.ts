import { DEFAULT_CONFIG } from '../config/providers';

// 监听来自 content script 的消息
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'getConfig') {
    chrome.storage.sync.get('consoleImporterConfig', (result) => {
      let config;
      if (result.consoleImporterConfig && result.consoleImporterConfig.providers) {
        // Use stored config if it has providers
        config = result.consoleImporterConfig;
      } else {
        // Use default config
        config = DEFAULT_CONFIG;
      }
      console.log('[Console Importer] Background sending config:', config);
      sendResponse({ config });
    });
    return true; // 表示异步响应
  }

  if (request.action === 'openOptions') {
    chrome.runtime.openOptionsPage();
  }
});

console.log('[Console Importer] Background script loaded');
