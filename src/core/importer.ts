import type { CDNProvider, ImportResult, CacheEntry, ConsoleImporterConfig } from '../types';
import { DEFAULT_CONFIG } from '../config/providers';

export class ConsoleImporter {
  private config: ConsoleImporterConfig;
  private cache = new Map<string, CacheEntry>();

  constructor() {
    this.config = DEFAULT_CONFIG;
    this.loadConfig();
  }

  private async loadConfig(): Promise<void> {
    try {
      const result = await chrome.storage.sync.get('consoleImporterConfig');
      if (result.consoleImporterConfig) {
        this.config = { ...DEFAULT_CONFIG, ...result.consoleImporterConfig };
      }
    } catch (error) {
      console.warn('Failed to load config, using defaults:', error);
    }
  }

  private async saveConfig(): Promise<void> {
    try {
      await chrome.storage.sync.set({ consoleImporterConfig: this.config });
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  }

  private parsePackage(packageStr: string): { name: string; version?: string } {
    const match = packageStr.match(/^([^@]+)(?:@(.+))?$/);
    if (!match) throw new Error(`Invalid package format: ${packageStr}`);
    return { name: match[1], version: match[2] };
  }

  private buildUrl(
    provider: CDNProvider,
    packageName: string,
    version = 'latest',
    type: 'js' | 'css' = 'js'
  ): string {
    const template = type === 'js' ? provider.jsTemplate : provider.cssTemplate;
    return template.replace('{package}', packageName).replace('{version}', version);
  }

  private getEnabledProviders(): CDNProvider[] {
    return this.config.providers.filter((p) => p.enabled).sort((a, b) => a.priority - b.priority);
  }

  private async loadScript(url: string): Promise<ImportResult> {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = url;
      script.type = 'text/javascript';

      script.onload = () => {
        resolve({
          success: true,
          url,
          element: script,
        });
      };

      script.onerror = () => {
        script.remove();
        resolve({
          success: false,
          url,
          error: 'Failed to load script',
        });
      };

      document.head.appendChild(script);
    });
  }

  private async loadESM(url: string): Promise<ImportResult> {
    try {
      const module = await import(url);
      return {
        success: true,
        url,
        element: module,
      };
    } catch (error) {
      return {
        success: false,
        url,
        error: error instanceof Error ? error.message : 'Failed to load ES module',
      };
    }
  }

  private async loadCSS(url: string): Promise<ImportResult> {
    return new Promise((resolve) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;

      link.onload = () => {
        resolve({
          success: true,
          url,
          element: link,
        });
      };

      link.onerror = () => {
        link.remove();
        resolve({
          success: false,
          url,
          error: 'Failed to load CSS',
        });
      };

      document.head.appendChild(link);
    });
  }

  async import(packageStr: string, version?: string): Promise<ImportResult> {
    const { name, version: parsedVersion } = this.parsePackage(packageStr);
    const targetVersion = version || parsedVersion || 'latest';
    const providers = this.getEnabledProviders();

    for (const provider of providers) {
      try {
        const url = this.buildUrl(provider, name, targetVersion, 'js');
        const result = await this.loadScript(url);

        if (result.success) {
          this.showNotification(`✅ Loaded ${name}@${targetVersion} from ${provider.name}`);
          return { ...result, provider: provider.name };
        }
      } catch (error) {
        console.warn(`Failed to load from ${provider.name}:`, error);
      }
    }

    const errorMsg = `Failed to load ${name}@${targetVersion} from all providers`;
    this.showNotification(`❌ ${errorMsg}`, 'error');
    return { success: false, error: errorMsg };
  }

  async importESM(packageStr: string, version?: string): Promise<ImportResult> {
    const { name, version: parsedVersion } = this.parsePackage(packageStr);
    const targetVersion = version || parsedVersion || 'latest';
    const providers = this.getEnabledProviders().filter((p) => p.supportESM);

    for (const provider of providers) {
      try {
        const url = this.buildUrl(provider, name, targetVersion, 'js');
        const result = await this.loadESM(url);

        if (result.success) {
          this.showNotification(`✅ Loaded ESM ${name}@${targetVersion} from ${provider.name}`);
          return { ...result, provider: provider.name };
        }
      } catch (error) {
        console.warn(`Failed to load ESM from ${provider.name}:`, error);
      }
    }

    const errorMsg = `Failed to load ESM ${name}@${targetVersion} from all providers`;
    this.showNotification(`❌ ${errorMsg}`, 'error');
    return { success: false, error: errorMsg };
  }

  async importCSS(packageStr: string, version?: string): Promise<ImportResult> {
    const { name, version: parsedVersion } = this.parsePackage(packageStr);
    const targetVersion = version || parsedVersion || 'latest';
    const providers = this.getEnabledProviders();

    for (const provider of providers) {
      try {
        const url = this.buildUrl(provider, name, targetVersion, 'css');
        const result = await this.loadCSS(url);

        if (result.success) {
          this.showNotification(`✅ Loaded CSS ${name}@${targetVersion} from ${provider.name}`);
          return { ...result, provider: provider.name };
        }
      } catch (error) {
        console.warn(`Failed to load CSS from ${provider.name}:`, error);
      }
    }

    const errorMsg = `Failed to load CSS ${name}@${targetVersion} from all providers`;
    this.showNotification(`❌ ${errorMsg}`, 'error');
    return { success: false, error: errorMsg };
  }

  private showNotification(message: string, type: 'success' | 'error' = 'success'): void {
    if (!this.config.showNotifications) return;

    console.log(`[Console Importer] ${message}`);

    // 创建简单的通知
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      background: ${type === 'success' ? '#10b981' : '#ef4444'};
      color: white;
      border-radius: 8px;
      font-family: monospace;
      font-size: 14px;
      z-index: 999999;
      max-width: 400px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}
