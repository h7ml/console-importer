import { useState, useEffect } from 'react';
import logo from '@/assets/text-logo.svg';
import type { ConsoleImporterConfig } from '../../types';
import { DEFAULT_CONFIG } from '../../config/providers';
import { t, detectLanguage } from '../../utils/i18n';

export const App = () => {
  const [config, setConfig] = useState<ConsoleImporterConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState('en');

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

  const openOptionsPage = () => {
    chrome.runtime.openOptionsPage();
  };

  if (loading) {
    return (
      <div className="min-w-96 min-h-32 flex-center">
        <div className="text-slate-500">{t('loading', lang)}</div>
      </div>
    );
  }

  return (
    <div className="w-96 p-4">
      <div className="flex items-center gap-3 mb-4">
        <img className="h-8" src={logo} alt="Logo" />
        <div>
          <h1 className="text-lg font-semibold text-slate-800">{t('console_importer', lang)}</h1>
          <p className="text-sm text-slate-500">v1.1.0</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-medium text-slate-700 mb-2">{t('quick_settings', lang)}</h2>

          <label className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={config.autoFallback}
              onChange={(e) => saveConfig({ ...config, autoFallback: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">{t('auto_fallback', lang)}</span>
          </label>

          <label className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={config.showNotifications}
              onChange={(e) => saveConfig({ ...config, showNotifications: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">{t('show_notifications', lang)}</span>
          </label>
        </div>

        <div>
          <h2 className="text-sm font-medium text-slate-700 mb-2">
            {t('active_cdn_providers', lang)}
          </h2>
          <div className="space-y-1 max-h-40 overflow-y-auto pr-2">
            {config.providers
              .filter((p) => p.region === 'global' || lang === 'zh')
              .map((provider) => (
                <label
                  key={provider.id}
                  className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 p-1 rounded"
                >
                  <input
                    type="checkbox"
                    checked={provider.enabled}
                    onChange={() => toggleProvider(provider.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span
                    className={`flex-1 ${provider.enabled ? 'text-slate-700' : 'text-slate-400'}`}
                  >
                    {provider.name}
                    <span className="text-xs text-slate-400 ml-1">
                      (
                      {provider.region === 'global'
                        ? lang === 'zh'
                          ? '全球'
                          : 'global'
                        : lang === 'zh'
                          ? '中国'
                          : 'china'}
                      )
                    </span>
                  </span>
                </label>
              ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <button
              onClick={openOptionsPage}
              className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              {t('advanced_settings', lang)}
            </button>
            <button
              onClick={() => window.open('https://github.com/h7ml/console-importer')}
              className="px-3 py-2 border border-slate-300 rounded hover:bg-slate-50 transition-colors"
            >
              {t('help_docs', lang)}
            </button>
          </div>

          <div className="mt-3 text-xs text-slate-500 text-center">
            Type <code className="bg-slate-100 px-1 rounded">$i.help()</code> in console to get
            started
          </div>
        </div>
      </div>
    </div>
  );
};
