import { useState, useEffect } from 'react';
import logo from '@/assets/text-logo.svg';
import type { ConsoleImporterConfig, CDNProvider } from '../../types';
import { DEFAULT_CONFIG } from '../../config/providers';
import { t, detectLanguage } from '../../utils/i18n';

export const App = () => {
  const [config, setConfig] = useState<ConsoleImporterConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState('en');
  const [newCustomSource, setNewCustomSource] = useState({
    name: '',
    jsTemplate: 'https://your-cdn.com/{package}@{version}',
    cssTemplate: 'https://your-cdn.com/{package}@{version}',
    description: '',
  });
  const [editingProvider, setEditingProvider] = useState<CDNProvider | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [testResults, setTestResults] = useState<{
    [key: string]: 'success' | 'error' | 'loading';
  }>({});

  useEffect(() => {
    const detectedLang = detectLanguage();
    setLang(detectedLang);
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const result = await chrome.storage.sync.get('consoleImporterConfig');
      if (result.consoleImporterConfig) {
        // Properly merge providers array
        const storedConfig = result.consoleImporterConfig;
        const mergedConfig = {
          ...DEFAULT_CONFIG,
          ...storedConfig,
          providers: storedConfig.providers || DEFAULT_CONFIG.providers,
        };
        setConfig(mergedConfig);
      } else {
        setConfig(DEFAULT_CONFIG);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
      setConfig(DEFAULT_CONFIG);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (newConfig: ConsoleImporterConfig) => {
    try {
      await chrome.storage.sync.set({ consoleImporterConfig: newConfig });
      setConfig(newConfig);
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  };

  const toggleProvider = (providerId: string) => {
    const currentEnabledCount = config.providers.filter((p) => p.enabled).length;

    // 找到要切换的提供商
    const provider = config.providers.find((p) => p.id === providerId);
    if (!provider) return;

    // 如果要禁用，检查是否还有其他启用的提供商
    if (provider.enabled && currentEnabledCount <= 1) {
      alert(
        lang === 'zh' ? '至少需要保留一个 CDN 源！' : 'At least one CDN source must be enabled!'
      );
      return;
    }

    const newProviders = config.providers.map((p) =>
      p.id === providerId ? { ...p, enabled: !p.enabled } : p
    );
    saveConfig({ ...config, providers: newProviders });
  };

  const updateProviderPriority = (providerId: string, direction: 'up' | 'down') => {
    const providers = [...config.providers];
    const index = providers.findIndex((p) => p.id === providerId);

    if (direction === 'up' && index > 0) {
      [providers[index], providers[index - 1]] = [providers[index - 1], providers[index]];
    } else if (direction === 'down' && index < providers.length - 1) {
      [providers[index], providers[index + 1]] = [providers[index + 1], providers[index]];
    }

    // 重新设置优先级
    providers.forEach((provider, idx) => {
      provider.priority = idx + 1;
    });

    saveConfig({ ...config, providers });
  };

  const addCustomSource = () => {
    if (!newCustomSource.name || !newCustomSource.jsTemplate) return;

    const customProvider: CDNProvider = {
      id: `custom-${Date.now()}`,
      name: newCustomSource.name,
      description: newCustomSource.description || 'Custom CDN source',
      baseUrl: '',
      enabled: true,
      priority: config.providers.length + 1,
      jsTemplate: newCustomSource.jsTemplate,
      cssTemplate: newCustomSource.cssTemplate,
      supportESM: false,
      supportVersions: false,
      region: 'global',
    };

    const newProviders = [...config.providers, customProvider];
    saveConfig({ ...config, providers: newProviders });

    setNewCustomSource({
      name: '',
      jsTemplate: 'https://your-cdn.com/{package}@{version}',
      cssTemplate: 'https://your-cdn.com/{package}@{version}',
      description: '',
    });
  };

  const removeCustomSource = (providerId: string) => {
    const newProviders = config.providers.filter((p) => p.id !== providerId);
    saveConfig({ ...config, providers: newProviders });
  };

  const startEditProvider = (provider: CDNProvider) => {
    setEditingProvider({ ...provider });
    setShowEditModal(true);
  };

  const cancelEdit = () => {
    setEditingProvider(null);
    setShowEditModal(false);
  };

  const saveEditedProvider = () => {
    if (!editingProvider) return;

    // 验证必填字段
    if (!editingProvider.name.trim()) {
      alert(lang === 'zh' ? '名称不能为空！' : 'Name cannot be empty!');
      return;
    }
    if (!editingProvider.jsTemplate.trim()) {
      alert(lang === 'zh' ? 'JS 模板不能为空！' : 'JS template cannot be empty!');
      return;
    }
    if (!editingProvider.cssTemplate.trim()) {
      alert(lang === 'zh' ? 'CSS 模板不能为空！' : 'CSS template cannot be empty!');
      return;
    }

    // 验证模板格式
    if (!editingProvider.jsTemplate.includes('{package}')) {
      alert(
        lang === 'zh'
          ? 'JS 模板必须包含 {package} 占位符！'
          : 'JS template must contain {package} placeholder!'
      );
      return;
    }
    if (!editingProvider.cssTemplate.includes('{package}')) {
      alert(
        lang === 'zh'
          ? 'CSS 模板必须包含 {package} 占位符！'
          : 'CSS template must contain {package} placeholder!'
      );
      return;
    }

    const newProviders = config.providers.map((p) =>
      p.id === editingProvider.id ? editingProvider : p
    );
    saveConfig({ ...config, providers: newProviders });
    cancelEdit();
  };

  const runTest = async (testName: string, testFunction: () => Promise<void>) => {
    setTestResults((prev) => ({ ...prev, [testName]: 'loading' }));
    try {
      await testFunction();
      setTestResults((prev) => ({ ...prev, [testName]: 'success' }));
    } catch (error) {
      console.error(`Test ${testName} failed:`, error);
      setTestResults((prev) => ({ ...prev, [testName]: 'error' }));
    }
  };

  const testBasicImport = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) throw new Error('No active tab found');

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async () => {
        try {
          await (window as any).$i('lodash');
          if (typeof (window as any)._ !== 'undefined') {
            console.log('✅ Basic import test passed: Lodash loaded successfully');
            return true;
          }
          throw new Error('Lodash not loaded');
        } catch (error) {
          console.error('❌ Basic import test failed:', error);
          throw error;
        }
      },
    });
  };

  const testCDNSpecific = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) throw new Error('No active tab found');

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async () => {
        try {
          await (window as any).$i.jsdelivr('moment');
          if (typeof (window as any).moment !== 'undefined') {
            console.log('✅ CDN-specific test passed: Moment loaded from jsDelivr');
            return true;
          }
          throw new Error('Moment not loaded from jsDelivr');
        } catch (error) {
          console.error('❌ CDN-specific test failed:', error);
          throw error;
        }
      },
    });
  };

  const testESMImport = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) throw new Error('No active tab found');

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async () => {
        try {
          const dayjs = await (window as any).$i.esm('dayjs');
          if (dayjs && typeof dayjs === 'function') {
            console.log('✅ ESM import test passed: dayjs loaded as module');
            console.log('Current time:', dayjs().format('YYYY-MM-DD HH:mm:ss'));
            return true;
          }
          throw new Error('dayjs ESM not loaded');
        } catch (error) {
          console.error('❌ ESM import test failed:', error);
          throw error;
        }
      },
    });
  };

  const testCSSImport = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) throw new Error('No active tab found');

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async () => {
        try {
          await (window as any).$i.css('animate.css@4.1.1');
          const animateCSS = document.querySelector('link[href*="animate.css"]');
          if (animateCSS) {
            console.log('✅ CSS import test passed: Animate.css loaded');

            // Create test element
            const testEl = document.createElement('div');
            testEl.innerHTML = '🎉 CSS Test Success!';
            testEl.style.cssText =
              'position:fixed;top:20px;right:20px;padding:20px;background:#4ade80;color:white;border-radius:8px;z-index:9999;font-weight:bold;';
            testEl.className = 'animate__animated animate__bounceIn';
            document.body.appendChild(testEl);

            setTimeout(() => testEl.remove(), 3000);
            return true;
          }
          throw new Error('Animate.css not loaded');
        } catch (error) {
          console.error('❌ CSS import test failed:', error);
          throw error;
        }
      },
    });
  };

  const testSearch = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) throw new Error('No active tab found');

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async () => {
        try {
          const results = await (window as any).$i.search('react');
          if (results && Array.isArray(results) && results.length > 0) {
            console.log('✅ Search test passed: Found', results.length, 'packages for "react"');
            return true;
          }
          throw new Error('Search returned no results');
        } catch (error) {
          console.error('❌ Search test failed:', error);
          throw error;
        }
      },
    });
  };

  const runAllTests = async () => {
    const tests = [
      { name: 'basic', fn: testBasicImport },
      { name: 'cdn-specific', fn: testCDNSpecific },
      { name: 'esm', fn: testESMImport },
      { name: 'css', fn: testCSSImport },
      { name: 'search', fn: testSearch },
    ];

    for (const test of tests) {
      await runTest(test.name, test.fn);
      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500">{t('loading', lang)}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <img className="h-8" src={logo} alt="Logo" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {t('console_importer', lang)}
                </h1>
                <p className="text-sm text-gray-500">{t('advanced_settings', lang)}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Global Settings */}
            <section>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {t('global_settings', lang)}
              </h2>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.autoFallback}
                    onChange={(e) => saveConfig({ ...config, autoFallback: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-700">
                      {t('auto_fallback', lang)}
                    </div>
                    <div className="text-xs text-gray-500">{t('auto_fallback_desc', lang)}</div>
                  </div>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.showNotifications}
                    onChange={(e) => saveConfig({ ...config, showNotifications: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-700">
                      {t('show_notifications', lang)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {t('show_notifications_desc', lang)}
                    </div>
                  </div>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.cacheEnabled}
                    onChange={(e) => saveConfig({ ...config, cacheEnabled: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-700">
                      {t('enable_caching', lang)}
                    </div>
                    <div className="text-xs text-gray-500">{t('enable_caching_desc', lang)}</div>
                  </div>
                </label>
              </div>
            </section>

            {/* CDN Providers */}
            <section>
              <h2 className="text-lg font-medium text-gray-900 mb-4">{t('cdn_providers', lang)}</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-4">{t('cdn_providers_desc', lang)}</p>

                <div className="space-y-2">
                  {config.providers.map((provider, index) => (
                    <div
                      key={provider.id}
                      className="bg-white rounded border p-3 flex items-center gap-3 hover:shadow-sm transition-shadow"
                    >
                      <input
                        type="checkbox"
                        checked={provider.enabled}
                        onChange={() => toggleProvider(provider.id)}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{provider.name}</span>
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">
                            {provider.region}
                          </span>
                          {provider.supportESM && (
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded">
                              ESM
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{provider.description}</div>
                        <div className="text-xs text-gray-400 mt-1">{provider.jsTemplate}</div>
                      </div>

                      <div className="flex gap-1">
                        <button
                          onClick={() => startEditProvider(provider)}
                          className="p-1 text-blue-400 hover:text-blue-600"
                          title={lang === 'zh' ? '编辑' : 'Edit'}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => updateProviderPriority(provider.id, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => updateProviderPriority(provider.id, 'down')}
                          disabled={index === config.providers.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          ↓
                        </button>
                        {provider.id.startsWith('custom-') && (
                          <button
                            onClick={() => removeCustomSource(provider.id)}
                            className="p-1 text-red-400 hover:text-red-600"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Add Custom Source */}
            <section>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {t('add_custom_source', lang)}
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('custom_source_name', lang)}
                    </label>
                    <input
                      type="text"
                      value={newCustomSource.name}
                      onChange={(e) =>
                        setNewCustomSource({ ...newCustomSource, name: e.target.value })
                      }
                      placeholder={t('custom_source_name_placeholder', lang)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('custom_source_description', lang)}
                    </label>
                    <input
                      type="text"
                      value={newCustomSource.description}
                      onChange={(e) =>
                        setNewCustomSource({ ...newCustomSource, description: e.target.value })
                      }
                      placeholder={t('custom_source_description_placeholder', lang)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('js_template', lang)}
                    <span className="text-xs text-gray-500 ml-2">
                      {t('js_template_desc', lang)}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={newCustomSource.jsTemplate}
                    onChange={(e) =>
                      setNewCustomSource({ ...newCustomSource, jsTemplate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('css_template', lang)}
                  </label>
                  <input
                    type="text"
                    value={newCustomSource.cssTemplate}
                    onChange={(e) =>
                      setNewCustomSource({ ...newCustomSource, cssTemplate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <button
                  onClick={addCustomSource}
                  disabled={!newCustomSource.name || !newCustomSource.jsTemplate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('add_custom_source_btn', lang)}
                </button>
              </div>
            </section>

            {/* Testing Section */}
            <section>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {lang === 'zh' ? '🧪 功能测试' : '🧪 Feature Testing'}
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-4">
                  {lang === 'zh'
                    ? '在当前标签页中测试 Console Importer 的各种功能。确保当前标签页已经加载了扩展。'
                    : 'Test various Console Importer features in the current tab. Make sure the extension is loaded in the current tab.'}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                  {[
                    {
                      key: 'basic',
                      label: lang === 'zh' ? '基础导入' : 'Basic Import',
                      desc: 'Test $i()',
                    },
                    {
                      key: 'cdn-specific',
                      label: lang === 'zh' ? 'CDN 指定' : 'CDN-Specific',
                      desc: 'Test $i.jsdelivr()',
                    },
                    { key: 'esm', label: 'ESM', desc: 'Test $i.esm()' },
                    { key: 'css', label: 'CSS', desc: 'Test $i.css()' },
                    {
                      key: 'search',
                      label: lang === 'zh' ? '搜索' : 'Search',
                      desc: 'Test $i.search()',
                    },
                  ].map((test) => (
                    <button
                      key={test.key}
                      onClick={() =>
                        runTest(
                          test.key,
                          test.key === 'basic'
                            ? testBasicImport
                            : test.key === 'cdn-specific'
                              ? testCDNSpecific
                              : test.key === 'esm'
                                ? testESMImport
                                : test.key === 'css'
                                  ? testCSSImport
                                  : testSearch
                        )
                      }
                      disabled={testResults[test.key] === 'loading'}
                      className={`p-3 rounded border text-left transition-colors ${
                        testResults[test.key] === 'success'
                          ? 'bg-green-50 border-green-200 text-green-800'
                          : testResults[test.key] === 'error'
                            ? 'bg-red-50 border-red-200 text-red-800'
                            : testResults[test.key] === 'loading'
                              ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{test.label}</div>
                          <div className="text-xs text-gray-500">{test.desc}</div>
                        </div>
                        <div className="text-lg">
                          {testResults[test.key] === 'loading'
                            ? '⏳'
                            : testResults[test.key] === 'success'
                              ? '✅'
                              : testResults[test.key] === 'error'
                                ? '❌'
                                : '🔘'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={runAllTests}
                    disabled={Object.values(testResults).includes('loading')}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {lang === 'zh' ? '🚀 运行所有测试' : '🚀 Run All Tests'}
                  </button>
                  <button
                    onClick={() => setTestResults({})}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    {lang === 'zh' ? '🔄 重置结果' : '🔄 Reset Results'}
                  </button>
                </div>

                {Object.keys(testResults).length > 0 && (
                  <div className="mt-4 p-3 bg-white rounded border">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      {lang === 'zh' ? '测试状态：' : 'Test Status:'}
                    </div>
                    <div className="text-xs text-gray-600">
                      {lang === 'zh'
                        ? '请查看浏览器开发者工具控制台获取详细结果。'
                        : 'Check the browser console for detailed test results.'}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Usage Examples */}
            <section>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {t('usage_examples', lang)}
              </h2>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm space-y-2">
                <div>// {t('basic_usage', lang)}</div>
                <div className="ml-2">$i('lodash')</div>
                <div className="ml-2">$i('jquery@3.6.0')</div>

                <div className="pt-2">// {t('advanced_features', lang)}</div>
                <div className="ml-2">$i.esm('lit') // {t('es_modules', lang)}</div>
                <div className="ml-2">$i.css('bootstrap') // {t('css_imports', lang)}</div>
                <div className="ml-2">$i.search('react') // {t('search_packages', lang)}</div>
                <div className="ml-2">$i.versions('lodash') // {t('list_versions', lang)}</div>

                <div className="pt-2">
                  // {lang === 'zh' ? 'CDN 指定导入' : 'CDN-specific imports'}
                </div>
                <div className="ml-2">$i.jsdelivr('axios') // From jsDelivr</div>
                <div className="ml-2">$i.unpkg.css('animate.css') // CSS from unpkg</div>
                <div className="ml-2">$i.skypack.esm('lit-element') // ESM from Skypack</div>

                <div className="pt-2">// {t('get_help', lang)}</div>
                <div className="ml-2">$i.help() // {t('show_all_commands', lang)}</div>
              </div>
            </section>

            {/* Copy-Paste Examples */}
            <section>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {lang === 'zh' ? '📋 一键复制示例' : '📋 Copy-Paste Examples'}
              </h2>
              <div className="space-y-4">
                {[
                  {
                    title:
                      lang === 'zh' ? '🎨 Bootstrap + 动画演示' : '🎨 Bootstrap + Animation Demo',
                    code: `// Complete Bootstrap + Animate.css demo
await $i.css('bootstrap@5.3.0')
await $i.css('animate.css@4.1.1')

// Create demo modal
const modalHTML = \`
  <div class="modal fade" id="demoModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content animate__animated animate__bounceIn">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">🎉 Console Importer Demo</h5>
        </div>
        <div class="modal-body">
          <div class="alert alert-success">✅ Bootstrap and Animate.css loaded!</div>
        </div>
      </div>
    </div>
  </div>\`
document.body.insertAdjacentHTML('beforeend', modalHTML)
await $i('bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js')
new bootstrap.Modal(document.getElementById('demoModal')).show()`,
                  },
                  {
                    title: lang === 'zh' ? '📊 ECharts 图表演示' : '📊 ECharts Chart Demo',
                    code: `// Complete ECharts demo
await $i('echarts')

let container = document.getElementById('echarts-demo')
if (!container) {
  container = document.createElement('div')
  container.id = 'echarts-demo'
  container.style.cssText = 'width:800px;height:400px;margin:20px;border:1px solid #ccc;'
  document.body.appendChild(container)
}

const chart = echarts.init(container)
chart.setOption({
  title: { text: 'Console Importer Demo Chart' },
  xAxis: { data: ['Jan', 'Feb', 'Mar', 'Apr', 'May'] },
  yAxis: {},
  series: [{ type: 'bar', data: [120, 200, 150, 80, 170] }]
})`,
                  },
                  {
                    title: lang === 'zh' ? '⚛️ React 组件演示' : '⚛️ React Component Demo',
                    code: `// React hooks demo
const React = await $i.esm('react@18')
const ReactDOM = await $i.esm('react-dom@18/client')
const { useState } = React

let container = document.getElementById('react-demo')
if (!container) {
  container = document.createElement('div')
  container.id = 'react-demo'
  container.style.margin = '20px'
  document.body.appendChild(container)
}

const Counter = () => {
  const [count, setCount] = useState(0)
  return React.createElement('div', null,
    React.createElement('h2', null, 'React Counter'),
    React.createElement('p', null, \`Count: \${count}\`),
    React.createElement('button', { onClick: () => setCount(count + 1) }, '+')
  )
}

ReactDOM.createRoot(container).render(React.createElement(Counter))`,
                  },
                ].map((example, index) => (
                  <div key={index} className="bg-white border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">{example.title}</h3>
                      <button
                        onClick={(e) => {
                          navigator.clipboard.writeText(example.code);
                          // Show copy feedback
                          const btn = e.target as HTMLButtonElement;
                          const originalText = btn.textContent;
                          btn.textContent = '✅ Copied!';
                          btn.className = btn.className.replace(
                            'bg-blue-600 hover:bg-blue-700',
                            'bg-green-600'
                          );
                          setTimeout(() => {
                            btn.textContent = originalText;
                            btn.className = btn.className.replace(
                              'bg-green-600',
                              'bg-blue-600 hover:bg-blue-700'
                            );
                          }, 2000);
                        }}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        📋 Copy
                      </button>
                    </div>
                    <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto text-gray-700">
                      <code>{example.code}</code>
                    </pre>
                  </div>
                ))}
              </div>
            </section>

            {/* Usage Examples */}
            <section style={{ display: 'none' }}>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {t('usage_examples', lang)}
              </h2>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                <div>// {t('basic_usage', lang)}</div>
                <div>$i('lodash')</div>
                <div>$i('jquery@3.6.0')</div>
                <br />
                <div>// {t('advanced_features', lang)}</div>
                <div>$i.esm('lit') // {t('es_modules', lang)}</div>
                <div>$i.css('bootstrap') // {t('css_imports', lang)}</div>
                <div>$i.search('react') // {t('search_packages', lang)}</div>
                <div>$i.versions('lodash') // {t('list_versions', lang)}</div>
                <br />
                <div>// {t('get_help', lang)}</div>
                <div>$i.help() // {t('show_all_commands', lang)}</div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Edit Provider Modal */}
      {showEditModal && editingProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {lang === 'zh'
                  ? `编辑 CDN 提供商: ${editingProvider.name}`
                  : `Edit CDN Provider: ${editingProvider.name}`}
              </h2>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {lang === 'zh' ? '名称' : 'Name'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingProvider.name}
                  onChange={(e) => setEditingProvider({ ...editingProvider, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder={lang === 'zh' ? '输入 CDN 名称' : 'Enter CDN name'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {lang === 'zh' ? '描述' : 'Description'}
                </label>
                <input
                  type="text"
                  value={editingProvider.description || ''}
                  onChange={(e) =>
                    setEditingProvider({ ...editingProvider, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder={lang === 'zh' ? '输入描述信息' : 'Enter description'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {lang === 'zh' ? 'JS 模板' : 'JS Template'}{' '}
                  <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">
                    {lang === 'zh'
                      ? '使用 {package} 和 {version} 占位符'
                      : 'Use {package} and {version} placeholders'}
                  </span>
                </label>
                <input
                  type="text"
                  value={editingProvider.jsTemplate}
                  onChange={(e) =>
                    setEditingProvider({ ...editingProvider, jsTemplate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://cdn.example.com/{package}@{version}"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {lang === 'zh' ? 'CSS 模板' : 'CSS Template'}{' '}
                  <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">
                    {lang === 'zh'
                      ? '使用 {package} 和 {version} 占位符'
                      : 'Use {package} and {version} placeholders'}
                  </span>
                </label>
                <input
                  type="text"
                  value={editingProvider.cssTemplate}
                  onChange={(e) =>
                    setEditingProvider({ ...editingProvider, cssTemplate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://cdn.example.com/{package}@{version}"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {lang === 'zh' ? '基础 URL' : 'Base URL'}
                </label>
                <input
                  type="text"
                  value={editingProvider.baseUrl || ''}
                  onChange={(e) =>
                    setEditingProvider({ ...editingProvider, baseUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://cdn.example.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {lang === 'zh' ? '地区' : 'Region'}
                  </label>
                  <select
                    value={editingProvider.region || 'global'}
                    onChange={(e) =>
                      setEditingProvider({
                        ...editingProvider,
                        region: e.target.value as 'global' | 'china',
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="global">{lang === 'zh' ? '全球' : 'Global'}</option>
                    <option value="china">{lang === 'zh' ? '中国' : 'China'}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingProvider.supportESM || false}
                      onChange={(e) =>
                        setEditingProvider({ ...editingProvider, supportESM: e.target.checked })
                      }
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {lang === 'zh' ? '支持 ESM' : 'Support ESM'}
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingProvider.supportVersions !== false}
                      onChange={(e) =>
                        setEditingProvider({
                          ...editingProvider,
                          supportVersions: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {lang === 'zh' ? '支持版本查询' : 'Support Versions'}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={cancelEdit}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
              >
                {lang === 'zh' ? '取消' : 'Cancel'}
              </button>
              <button
                onClick={saveEditedProvider}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                {lang === 'zh' ? '保存' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
