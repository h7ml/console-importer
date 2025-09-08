import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { webxPlugin } from '@webx-kit/rsbuild-plugin';

export default defineConfig({
  plugins: [
    pluginReact(),
    webxPlugin({
      background: './src/background/index.ts',
      contentScripts: {
        import: './src/content-scripts/inject.ts',
        matches: ['<all_urls>'],
        runAt: 'document_start',
      },
      pages: {
        options: './src/pages/options/index.tsx',
        popup: './src/pages/popup/index.tsx',
      },
    }),
  ],
  output: {
    copy: [
      {
        from: './public',
        to: './public',
      },
      {
        from: './src/content-scripts/injected-script.js',
        to: './static/js/injected-script.js',
      },
    ],
  },
  tools: {
    postcss: {
      postcssOptions: {
        plugins: [require('@tailwindcss/postcss')],
      },
    },
  },
});
