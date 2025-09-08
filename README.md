# Console Importer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/h7ml/console-importer/workflows/CI/badge.svg)](https://github.com/h7ml/console-importer/actions)
[![Release](https://img.shields.io/github/v/release/h7ml/console-importer)](https://github.com/h7ml/console-importer/releases)

[English](./README.md) | [简体中文](./README.zh-CN.md)

A powerful Chrome extension that allows developers to import JavaScript and CSS libraries directly from the browser console with a simple command. Built as a modern replacement for the original Console Importer extension.

## ✨ Features

- 🚀 **Quick Import**: Import any npm package with `$i('package-name')`
- 🌐 **Multiple CDN Sources**: Automatic fallback between jsDelivr, unpkg, esm.sh, Skypack, and more
- 📦 **Version Management**: Specify exact versions or use latest
- 🎨 **CSS Support**: Import CSS files with `$i.css('package-name')`
- 📚 **ESM Support**: Import ES modules with `$i.esm('package-name')`
- 🔍 **Package Search**: Search npm packages with `$i.search('keyword')`
- 📋 **Version Listing**: List all versions with `$i.versions('package-name')`
- 🌍 **Internationalization**: Full support for English and Chinese
- ⚡ **Smart Fallback**: Automatically tries multiple CDNs if one fails
- 🎯 **Custom CDN Sources**: Add your own CDN providers

## 📥 Installation

### From Chrome Web Store
Coming soon...

### From Source

1. Clone this repository:
   ```bash
   git clone https://github.com/h7ml/console-importer.git
   cd console-importer
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Build the extension:
   ```bash
   pnpm run build
   ```

4. Load in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

### From Release

1. Download the latest release from [Releases](https://github.com/h7ml/console-importer/releases)
2. Extract the zip file
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode"
5. Click "Load unpacked"
6. Select the extracted folder

## 🚀 Usage

### Basic Import

```javascript
// Import latest version
await $i('lodash')
// Now use lodash
_.chunk(['a', 'b', 'c', 'd'], 2)

// Import specific version
await $i('jquery@3.6.0')
// Now use jQuery
$('body').css('background', '#f0f0f0')

// Import with version parameter
await $i('moment', '2.29.4')
moment().format('YYYY-MM-DD')
```

### ES Modules

```javascript
// Import as ES module
const { html, render } = await $i.esm('lit')

// Use the imported modules
render(html`<h1>Hello World</h1>`, document.body)

// Import React
const React = await $i.esm('react')
const ReactDOM = await $i.esm('react-dom')
```

### CSS Import

```javascript
// Import CSS framework
await $i.css('bootstrap')
// CSS is automatically applied to the page

// Import with version
await $i.css('animate.css@4.1.1')
// Now use animate.css classes
document.querySelector('.my-element').classList.add('animate__animated', 'animate__bounce')

// Import CSS from specific CDN
await $i.css('tailwindcss')
```

### Search Packages

```javascript
// Search for packages
await $i.search('react')
// Shows a table of matching packages with scores

// Search results include:
// - Package name
// - Latest version
// - Description
// - Score (relevance)
```

### List Versions

```javascript
// Get all versions of a package
await $i.versions('vue')
// Lists all available versions in descending order

// Check specific package versions
await $i.versions('lodash')
// Shows all lodash versions
```

### Help

```javascript
// Show all available commands
$i.help()

// Debug current configuration
$i.debug()
// Shows:
// - Current CDN configuration
// - Enabled providers
// - Priority order
```

### Real-world Examples

#### Data Visualization with ECharts

```javascript
// Import ECharts
await $i('echarts')

// Initialize ECharts instance
var myChart = echarts.init(document.getElementById('chart-container'));
// If no container, use body
// var myChart = echarts.init(document.body);

// Configure chart
var option = {
  title: {
    text: 'ECharts Example'
  },
  tooltip: {},
  legend: {
    data: ['Sales']
  },
  xAxis: {
    data: ['Shirts', 'Sweaters', 'Chiffon', 'Pants', 'Heels', 'Socks']
  },
  yAxis: {},
  series: [
    {
      name: 'Sales',
      type: 'bar',
      data: [5, 20, 36, 10, 10, 20]
    }
  ]
};

// Display chart
myChart.setOption(option);
```

#### Other Popular Libraries

```javascript
// Import Chart.js for charts
await $i('chart.js')

// Import D3.js for data visualization
await $i('d3')

// Import Three.js for 3D graphics
await $i('three')

// Import Axios for HTTP requests
await $i('axios')

// Import Day.js for date manipulation
await $i('dayjs')
```

## ⚙️ Configuration

### Quick Settings (Popup)

Click the extension icon to access quick settings:
- Toggle CDN providers on/off
- Enable/disable auto-fallback
- Control notifications
- Quick link to advanced settings

### Advanced Settings

Access via popup → "Advanced Settings" or right-click the extension icon:
- **Drag to reorder** CDN providers (priority order)
- **Enable/disable** individual CDN sources
- **Add custom CDN sources** with your own URL templates
- **Global settings**:
  - Auto-fallback: Automatically try next CDN on failure
  - Show notifications: Display import success/failure notifications
  - Enable caching: Cache successful imports for faster reloading

### CDN Providers

Default providers include:

#### Global CDNs
- **jsDelivr** - Fast, reliable, global CDN with npm support
- **unpkg** - The CDN for everything on npm
- **esm.sh** - Modern CDN built for ES modules
- **Skypack** - Optimized for modern browsers
- **cdnjs** - Community-driven CDN

#### Regional CDNs (China)
- **BootCDN** - Popular in China, fast and stable
- **字节跳动 CDN** - ByteDance's public CDN
- **七牛云 CDN** - Qiniu Cloud static file CDN

### Custom CDN Configuration

Add your own CDN sources in Advanced Settings:
- **Name**: Display name for your CDN
- **JS Template**: URL template for JavaScript files
- **CSS Template**: URL template for CSS files
- **Description**: Brief description of the CDN

Template variables:
- `{package}` - Package name
- `{version}` - Package version

Example:
```
https://my-cdn.com/npm/{package}@{version}/dist/index.js
```

## 🛠️ Development

### Prerequisites
- Node.js >= 18
- pnpm >= 8

### Setup

```bash
# Clone repository
git clone https://github.com/h7ml/console-importer.git
cd console-importer

# Install dependencies
pnpm install

# Development build with watch
pnpm run dev

# Production build
pnpm run build

# Format code
pnpm run format
```

### Project Structure

```
src/
├── background/          # Background service worker
├── config/             # Default configurations
├── content-scripts/    # Content scripts and injected scripts
├── core/               # Core functionality
│   ├── importer.ts     # Main import logic
│   ├── console-api.ts  # $i API implementation
│   └── search.ts       # Package search functionality
├── pages/              # UI pages
│   ├── popup/          # Extension popup
│   └── options/        # Options page
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

### Key Technologies

- **WebX Kit**: Chrome extension development framework
- **React**: UI components
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Rsbuild**: Build tool

## 🔧 API Reference

### `$i(package, version?)`
Import a JavaScript library.

**Parameters:**
- `package` (string): npm package name or `package@version`
- `version` (string, optional): Version override

**Returns:** Promise<ImportResult>

**Example:**
```javascript
await $i('lodash')
await $i('jquery', '3.6.0')
await $i('react@18.2.0')
```

### `$i.esm(package, version?)`
Import as ES module.

**Parameters:**
- `package` (string): npm package name
- `version` (string, optional): Version

**Returns:** Promise with module exports

**Example:**
```javascript
const { useState } = await $i.esm('react')
const Vue = await $i.esm('vue@3')
```

### `$i.css(package, version?)`
Import CSS file.

**Parameters:**
- `package` (string): Package name
- `version` (string, optional): Version

**Returns:** Promise<ImportResult>

**Example:**
```javascript
await $i.css('bootstrap')
await $i.css('animate.css', '4.1.1')
```

### `$i.search(query)`
Search npm packages.

**Parameters:**
- `query` (string): Search term

**Returns:** Promise<SearchResult[]>

**Example:**
```javascript
const results = await $i.search('react')
// Returns array of packages with name, version, description, score
```

### `$i.versions(package)`
List all versions of a package.

**Parameters:**
- `package` (string): Package name

**Returns:** Promise<string[]>

**Example:**
```javascript
const versions = await $i.versions('lodash')
// Returns ['4.17.21', '4.17.20', ...]
```

### `$i.help()`
Show help information.

**Returns:** void

### `$i.debug()`
Show current configuration and debug info.

**Returns:** void

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Original [Console Importer](https://github.com/pd4d10/console-importer) by pd4d10
- All CDN providers for their excellent services
- The open-source community

## 📞 Support

- **Bug Reports**: [GitHub Issues](https://github.com/h7ml/console-importer/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/h7ml/console-importer/discussions)
- **Security Issues**: Please email security concerns directly

## 🔗 Links

- [Chrome Web Store](#) (Coming soon)
- [GitHub Repository](https://github.com/h7ml/console-importer)
- [Release Notes](https://github.com/h7ml/console-importer/releases)
- [Original Console Importer](https://github.com/pd4d10/console-importer)