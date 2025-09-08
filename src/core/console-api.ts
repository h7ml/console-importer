import { ConsoleImporter } from './importer';
import type { ImportResult } from '../types';

// 创建全局实例
const importer = new ConsoleImporter();

// 定义 $i 函数及其方法
interface ConsoleImporterFunction {
  (packageName: string, version?: string): Promise<ImportResult>;
  esm: (packageName: string, version?: string) => Promise<ImportResult>;
  css: (packageName: string, version?: string) => Promise<ImportResult>;
  search?: (packageName: string) => Promise<any>;
  versions?: (packageName: string) => Promise<string[]>;
  help: () => void;
  config: () => void;
}

const $i: ConsoleImporterFunction = async (packageName: string, version?: string) => {
  return await importer.import(packageName, version);
};

// ESM 导入
$i.esm = async (packageName: string, version?: string) => {
  return await importer.importESM(packageName, version);
};

// CSS 导入
$i.css = async (packageName: string, version?: string) => {
  return await importer.importCSS(packageName, version);
};

// 帮助信息
$i.help = () => {
  const helpText = `
🚀 Console Importer v1.0.0

Basic Usage:
  $i('lodash')                    // Import latest lodash
  $i('lodash', '4.17.21')         // Import specific version
  $i('lodash@4.17.21')            // npm-style version

Advanced Usage:
  $i.esm('react')                 // Import as ES module
  $i.css('bootstrap')             // Import CSS
  $i.search('react')              // Search packages
  $i.versions('lodash')           // List available versions

Utilities:
  $i.help()                       // Show this help
  $i.config()                     // Open configuration

Features:
  ✅ Multiple CDN sources with auto-fallback
  ✅ Smart version resolution
  ✅ ES modules support
  ✅ CSS imports
  ✅ Package search
  ✅ Configurable providers

CDN Sources:
  • jsDelivr (Global)
  • unpkg (Global) 
  • esm.sh (ESM-focused)
  • Skypack (Modern web apps)
  • 字节跳动 CDN (China)
  • BootCDN (China)
  • 七牛云 CDN (China)
  `;

  console.log(helpText);
};

// 配置管理
$i.config = () => {
  // 打开扩展设置页面
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.sendMessage({ action: 'openOptions' });
  } else {
    console.log('Configuration available in extension popup/options');
  }
};

// 使用 script 标签注入到页面上下文
function injectScript() {
  const script = document.createElement('script');
  script.textContent = `
    (function() {
      // 创建 $i 函数的字符串表示
      const $iCode = ${JSON.stringify($i.toString())};
      const esmCode = ${JSON.stringify($i.esm.toString())};
      const cssCode = ${JSON.stringify($i.css.toString())};
      const helpCode = ${JSON.stringify($i.help.toString())};
      const configCode = ${JSON.stringify($i.config.toString())};
      
      // 重新创建函数
      eval('window.$i = ' + $iCode);
      eval('window.$i.esm = ' + esmCode);
      eval('window.$i.css = ' + cssCode);
      eval('window.$i.help = ' + helpCode);
      eval('window.$i.config = ' + configCode);
      
      // 也添加到 console 对象
      console.$i = window.$i;
      
      console.log('[Console Importer] Successfully injected $i function. Type $i.help() to get started!');
    })();
  `;

  (document.head || document.documentElement).appendChild(script);
  script.remove();
}

// 等待 DOM 加载后注入
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectScript);
} else {
  injectScript();
}

export { $i };
export default importer;
