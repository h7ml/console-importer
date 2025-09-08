// 简单直接的页面注入脚本
(function () {
  'use strict';

  console.log('[Console Importer] Injected script starting...');

  // 获取配置
  const config = window.__consoleImporterConfig || {};
  const providers = config.providers || [];

  console.log('[Console Importer] Config found:', config);
  console.log('[Console Importer] Providers:', providers);

  // 从配置中构建 CDN 提供商列表
  const getEnabledProviders = () => {
    console.log('[Console Importer] Getting enabled providers from:', providers);
    const enabledProviders = providers
      .filter((p) => p.enabled)
      .sort((a, b) => a.priority - b.priority)
      .map((p) => ({
        url: p.jsTemplate,
        name: p.name,
        cssUrl: p.cssTemplate,
      }));

    console.log('[Console Importer] Enabled providers:', enabledProviders);

    // 如果没有配置或没有启用的提供商，使用默认值
    if (enabledProviders.length === 0) {
      console.log('[Console Importer] No enabled providers, using defaults');
      return [
        {
          url: 'https://cdn.jsdelivr.net/npm/{package}@{version}',
          name: 'jsDelivr',
          cssUrl: 'https://cdn.jsdelivr.net/npm/{package}@{version}',
        },
        {
          url: 'https://unpkg.com/{package}@{version}',
          name: 'unpkg',
          cssUrl: 'https://unpkg.com/{package}@{version}',
        },
        {
          url: 'https://esm.sh/{package}@{version}',
          name: 'esm.sh',
          cssUrl: 'https://esm.sh/{package}@{version}',
        },
        {
          url: 'https://cdn.skypack.dev/{package}@{version}',
          name: 'Skypack',
          cssUrl: 'https://cdn.skypack.dev/{package}@{version}',
        },
      ];
    }

    return enabledProviders;
  };

  // 获取 ESM 提供商
  const getESMProviders = () => {
    const esmProviders = providers
      .filter((p) => p.enabled && p.supportESM)
      .sort((a, b) => a.priority - b.priority)
      .map((p) => ({
        url: p.jsTemplate,
        name: p.name,
      }));

    // 如果没有 ESM 提供商，使用默认值
    if (esmProviders.length === 0) {
      return [
        { url: 'https://esm.sh/{package}@{version}', name: 'esm.sh' },
        { url: 'https://cdn.skypack.dev/{package}@{version}', name: 'Skypack' },
        { url: 'https://unpkg.com/{package}@{version}?module', name: 'unpkg' },
      ];
    }

    return esmProviders;
  };

  // API 端点
  const SEARCH_API = 'https://api.npms.io/v2/search';
  const VERSIONS_API = 'https://registry.npmjs.org/{package}';
  const JSDELIVR_VERSIONS_API = 'https://api.jsdelivr.com/v1/packages/npm/{package}';

  // 创建完整的 Console Importer 实现
  const consoleImporter = {
    async loadScript(url) {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => resolve({ success: true, url });
        script.onerror = () => {
          script.remove();
          resolve({ success: false, url, error: 'Failed to load script' });
        };
        document.head.appendChild(script);
      });
    },

    async loadCSS(url) {
      return new Promise((resolve) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        link.onload = () => resolve({ success: true, url });
        link.onerror = () => {
          link.remove();
          resolve({ success: false, url, error: 'Failed to load CSS' });
        };
        document.head.appendChild(link);
      });
    },

    async loadESM(url) {
      try {
        const module = await import(url);
        return { success: true, url, module };
      } catch (error) {
        return { success: false, url, error: error.message };
      }
    },

    buildUrl(template, packageName, version = 'latest') {
      return template.replace('{package}', packageName).replace('{version}', version);
    },

    parsePackage(packageStr) {
      const match = packageStr.match(/^([^@]+)(?:@(.+))?$/);
      if (!match) throw new Error(`Invalid package format: ${packageStr}`);
      return { name: match[1], version: match[2] };
    },

    async resolveVersion(packageName, requestedVersion) {
      // 如果请求的是 'latest'，尝试获取实际的最新版本号
      if (!requestedVersion || requestedVersion === 'latest') {
        try {
          const versions = await this.getVersions(packageName);
          if (versions.length > 0) {
            return versions[0]; // 返回最新版本
          }
        } catch (error) {
          // 如果获取版本失败，继续使用 'latest'
        }
        return 'latest';
      }
      return requestedVersion;
    },

    async tryProviders(packageName, version, type = 'js', customProviders = null) {
      const providers = customProviders || getEnabledProviders();
      // 解析实际版本号
      const resolvedVersion = await this.resolveVersion(packageName, version);

      for (const provider of providers) {
        try {
          const urlTemplate = type === 'css' && provider.cssUrl ? provider.cssUrl : provider.url;
          const url = this.buildUrl(urlTemplate, packageName, resolvedVersion);
          const result = type === 'css' ? await this.loadCSS(url) : await this.loadScript(url);

          if (result.success) {
            console.log(`✅ Loaded ${packageName}@${resolvedVersion} from ${provider.name}`);
            console.log(`   URL: ${url}`);
            return { ...result, version: resolvedVersion, provider: provider.name };
          }
        } catch (error) {
          continue;
        }
      }

      const errorMsg = `❌ Failed to load ${packageName}@${resolvedVersion} from all CDNs`;
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    },

    async searchPackages(query) {
      try {
        const response = await fetch(`${SEARCH_API}?q=${encodeURIComponent(query)}&size=10`);
        if (!response.ok) throw new Error('Search failed');

        const data = await response.json();
        return data.results.map((result) => ({
          name: result.package.name,
          version: result.package.version,
          description: result.package.description,
          keywords: result.package.keywords,
          score: Math.round(result.score.final * 100),
        }));
      } catch (error) {
        console.error('Search failed:', error);
        return [];
      }
    },

    async getVersions(packageName) {
      try {
        // 先尝试 jsDelivr API（更快）
        const jsdelivrUrl = JSDELIVR_VERSIONS_API.replace('{package}', packageName);
        let response = await fetch(jsdelivrUrl);

        if (response.ok) {
          const data = await response.json();
          return data.versions || [];
        }

        // 回退到 npm registry
        const npmUrl = VERSIONS_API.replace('{package}', packageName);
        response = await fetch(npmUrl);

        if (!response.ok) throw new Error('Package not found');

        const data = await response.json();
        return Object.keys(data.versions || {}).reverse(); // 最新版本在前
      } catch (error) {
        console.error(`Failed to get versions for ${packageName}:`, error);
        return [];
      }
    },
  };

  // 创建 $i 函数
  async function $i(packageStr, version) {
    const { name, version: parsedVersion } = consoleImporter.parsePackage(packageStr);
    const targetVersion = version || parsedVersion || 'latest';
    return await consoleImporter.tryProviders(name, targetVersion, 'js');
  }

  // ESM 导入
  $i.esm = async function (packageStr, version) {
    const { name, version: parsedVersion } = consoleImporter.parsePackage(packageStr);
    const targetVersion = version || parsedVersion || 'latest';
    const resolvedVersion = await consoleImporter.resolveVersion(name, targetVersion);

    const esmProviders = getESMProviders();
    for (const provider of esmProviders) {
      try {
        const url = consoleImporter.buildUrl(provider.url, name, resolvedVersion);
        const result = await consoleImporter.loadESM(url);
        if (result.success) {
          console.log(`✅ Loaded ESM ${name}@${resolvedVersion} from ${provider.name}`);
          console.log(`   URL: ${url}`);
          return { ...result, version: resolvedVersion, provider: provider.name };
        }
      } catch (error) {
        continue;
      }
    }

    const errorMsg = `❌ Failed to load ESM ${name}@${resolvedVersion}`;
    console.error(errorMsg);
    return { success: false, error: errorMsg };
  };

  // CSS 导入
  $i.css = async function (packageStr, version) {
    const { name, version: parsedVersion } = consoleImporter.parsePackage(packageStr);
    const targetVersion = version || parsedVersion || 'latest';
    return await consoleImporter.tryProviders(name, targetVersion, 'css');
  };

  // 搜索功能
  $i.search = async function (query) {
    console.log(`🔍 Searching for "${query}"...`);
    const results = await consoleImporter.searchPackages(query);

    if (results.length === 0) {
      console.log('No packages found.');
      return [];
    }

    console.table(
      results.map((pkg) => ({
        Name: pkg.name,
        Version: pkg.version,
        Description: pkg.description?.substring(0, 50) + '...',
        Score: pkg.score + '%',
      }))
    );

    console.log(`\nFound ${results.length} packages. Use $i('package-name') to import.`);
    return results;
  };

  // 版本查询
  $i.versions = async function (packageName) {
    console.log(`📦 Getting versions for "${packageName}"...`);
    const versions = await consoleImporter.getVersions(packageName);

    if (versions.length === 0) {
      console.log('No versions found or package does not exist.');
      return [];
    }

    console.log(`Available versions (showing latest 20):`);
    const displayVersions = versions.slice(0, 20);
    displayVersions.forEach((version, index) => {
      const label = index === 0 ? ' (latest)' : '';
      console.log(`  ${version}${label}`);
    });

    if (versions.length > 20) {
      console.log(`... and ${versions.length - 20} more versions`);
    }

    console.log(`\nUse $i('${packageName}@version') to import a specific version.`);
    return versions;
  };

  // 帮助信息
  $i.help = function () {
    console.log(`
🚀 Console Importer v1.0.0

Basic Usage:
  $i('lodash')                    // Import latest lodash
  $i('lodash', '4.17.21')         // Import specific version  
  $i('lodash@4.17.21')            // npm-style version

Advanced Usage:
  $i.esm('react')                 // Import as ES module
  $i.css('bootstrap')             // Import CSS
  
Search & Discovery:
  $i.search('react')              // Search npm packages
  $i.versions('lodash')           // List available versions
  
Utilities:
  $i.help()                       // Show this help
  $i.debug()                      // Show current configuration

CDN Sources (auto-fallback):
  • jsDelivr • unpkg • esm.sh • Skypack

Examples:
  $i('jquery')                    // Load jQuery
  $i('lodash@4.17.21')            // Load specific version
  $i.esm('lit')                   // Load as ES module
  $i.css('bootstrap@5.3.0')       // Load CSS
  $i.search('vue')                // Search for Vue packages
  $i.versions('react')            // Show React versions
    `);
  };

  // 配置
  $i.config = function () {
    console.log('Open the Console Importer extension popup to configure settings.');
  };

  // 调试函数，显示当前配置
  $i.debug = function () {
    console.log('[Console Importer] Debug Information:');
    console.log('- Config:', config);
    console.log('- Providers:', providers);
    console.log('- Enabled providers:', getEnabledProviders());
  };

  // 注入到全局
  if (window.$i) {
    console.$i = $i;
    console.log('[Console Importer] $i already exists, available as console.$i');
  } else {
    window.$i = $i;
  }
  console.$i = $i;

  console.log('[Console Importer] Ready! Type $i.help() to get started.');
})();
