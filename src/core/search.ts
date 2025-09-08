import type { CDNProvider, PackageInfo } from '../types';

export class SearchService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5分钟

  async searchPackage(packageName: string, providers: CDNProvider[]): Promise<PackageInfo[]> {
    const cacheKey = `search:${packageName}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    const results: PackageInfo[] = [];

    for (const provider of providers) {
      if (!provider.searchApi) continue;

      try {
        const result = await this.searchFromProvider(packageName, provider);
        if (result) results.push(result);
      } catch (error) {
        console.warn(`Search failed for ${provider.name}:`, error);
      }
    }

    this.cache.set(cacheKey, { data: results, timestamp: Date.now() });
    return results;
  }

  async getVersions(packageName: string, providers: CDNProvider[]): Promise<string[]> {
    const cacheKey = `versions:${packageName}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    for (const provider of providers) {
      if (!provider.versionsApi) continue;

      try {
        const versions = await this.getVersionsFromProvider(packageName, provider);
        if (versions.length > 0) {
          this.cache.set(cacheKey, { data: versions, timestamp: Date.now() });
          return versions;
        }
      } catch (error) {
        console.warn(`Version fetch failed for ${provider.name}:`, error);
      }
    }

    return [];
  }

  private async searchFromProvider(
    packageName: string,
    provider: CDNProvider
  ): Promise<PackageInfo | null> {
    const url = provider.searchApi!.replace('{package}', packageName);

    try {
      const response = await fetch(url);
      if (!response.ok) return null;

      const data = await response.json();

      // 根据不同 CDN 的 API 格式解析
      switch (provider.id) {
        case 'jsdelivr':
          return this.parseJsDelivrSearch(data, packageName);
        case 'bootcdn':
          return this.parseBootCDNSearch(data, packageName);
        default:
          return null;
      }
    } catch (error) {
      return null;
    }
  }

  private async getVersionsFromProvider(
    packageName: string,
    provider: CDNProvider
  ): Promise<string[]> {
    const url = provider.versionsApi!.replace('{package}', packageName);

    try {
      const response = await fetch(url);
      if (!response.ok) return [];

      const data = await response.json();

      // 根据不同 CDN 的 API 格式解析
      switch (provider.id) {
        case 'jsdelivr':
          return this.parseJsDelivrVersions(data);
        case 'bootcdn':
          return this.parseBootCDNVersions(data);
        default:
          return [];
      }
    } catch (error) {
      return [];
    }
  }

  private parseJsDelivrSearch(data: any, packageName: string): PackageInfo | null {
    if (!data || !data.versions) return null;

    return {
      name: packageName,
      version: data.versions[0],
      description: data.description,
      versions: data.versions.slice(0, 10), // 最多返回10个版本
      cdn: 'jsdelivr',
    };
  }

  private parseBootCDNSearch(data: any, packageName: string): PackageInfo | null {
    if (!data || !data.version) return null;

    return {
      name: packageName,
      version: data.version,
      description: data.description,
      versions: [data.version],
      cdn: 'bootcdn',
    };
  }

  private parseJsDelivrVersions(data: any): string[] {
    if (!data || !data.versions) return [];
    return data.versions.slice(0, 20); // 最多返回20个版本
  }

  private parseBootCDNVersions(data: any): string[] {
    if (!data || !data.assets) return [];
    return data.assets.map((asset: any) => asset.version).slice(0, 20);
  }
}
