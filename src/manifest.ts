import { defineManifest } from '@webx-kit/rsbuild-plugin/manifest';

export default defineManifest(() => ({
  manifest_version: 3,
  name: 'Console Importer',
  version: '1.1.0',
  description: 'Import JavaScript and CSS resources from console with multiple CDN support',
  icons: {
    16: 'public/logo.png',
    48: 'public/logo.png',
    128: 'public/logo.png',
  },
  action: {
    default_popup: 'popup.html',
  },
  options_ui: {
    page: 'options.html',
    open_in_tab: true,
  },
  permissions: ['storage', 'activeTab', 'scripting'],
  host_permissions: [
    'https://cdn.jsdelivr.net/*',
    'https://data.jsdelivr.com/*',
    'https://unpkg.com/*',
    'https://esm.sh/*',
    'https://cdn.skypack.dev/*',
    'https://lf3-cdn-tos.bytecdntp.com/*',
    'https://cdn.bootcdn.net/*',
    'https://cdn.staticfile.org/*',
    'https://api.jsdelivr.com/*',
    'https://api.bootcdn.cn/*',
    'https://registry.npmjs.org/*',
    'https://api.npms.io/*',
  ],
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['static/js/content-script.js'],
      run_at: 'document_start',
      all_frames: true,
    },
  ],
  web_accessible_resources: [
    {
      matches: ['<all_urls>'],
      resources: ['static/css/*', 'static/svg/*', 'static/js/*'],
    },
  ],
}));
