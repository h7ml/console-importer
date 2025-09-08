export interface CDNProvider {
  id: string;
  name: string;
  description: string;
  baseUrl: string;
  enabled: boolean;
  priority: number;
  jsTemplate: string;
  cssTemplate: string;
  searchApi?: string;
  versionsApi?: string;
  packageInfoApi?: string;
  supportESM?: boolean;
  supportVersions?: boolean;
  region?: 'global' | 'china';
}

export interface PackageInfo {
  name: string;
  version?: string;
  description?: string;
  versions?: string[];
  cdn?: string;
}

export interface ImportResult {
  success: boolean;
  url?: string;
  provider?: string;
  error?: string;
  element?: HTMLElement;
}

export interface ConsoleImporterConfig {
  defaultProvider: string;
  providers: CDNProvider[];
  autoFallback: boolean;
  showNotifications: boolean;
  cacheEnabled: boolean;
  cacheTime: number;
}

export interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}
