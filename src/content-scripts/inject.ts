// 注入页面脚本到 main world
async function injectPageScript() {
  try {
    console.log('[Console Importer] Content script requesting config...');
    // 从扩展获取配置
    const response = await chrome.runtime.sendMessage({ action: 'getConfig' });
    const config = response?.config || null;
    console.log('[Console Importer] Received config:', config);

    // 先注入配置数据
    if (config) {
      const configScript = document.createElement('script');
      configScript.textContent = `
        window.__consoleImporterConfig = ${JSON.stringify(config)};
        console.log('[Console Importer] Config injected:', window.__consoleImporterConfig);
      `;
      (document.head || document.documentElement).appendChild(configScript);
      configScript.remove();
    }
  } catch (error) {
    console.warn('[Console Importer] Failed to load config:', error);
  }

  // 然后注入主脚本
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('static/js/injected-script.js');
  script.onload = function () {
    // 脚本加载完成后移除
    (this as HTMLScriptElement).remove();
  };
  (document.head || document.documentElement).appendChild(script);
}

// 立即注入
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectPageScript);
} else {
  injectPageScript();
}
