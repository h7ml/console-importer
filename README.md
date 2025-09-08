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

#### 🎯 One-Click Testing Examples
The following examples are designed to work immediately on any webpage. Copy and paste into your browser console:

#### 📊 Data Visualization with ECharts

```javascript
// Complete working example - creates a chart in the page
await $i('echarts')

// Create container if it doesn't exist
let container = document.getElementById('echarts-demo')
if (!container) {
  container = document.createElement('div')
  container.id = 'echarts-demo'
  container.style.cssText = 'width:800px;height:400px;margin:20px;border:1px solid #ccc;'
  document.body.appendChild(container)
}

// Initialize chart
const myChart = echarts.init(container)

// Configure and display chart
const option = {
  title: { text: 'Console Importer Demo Chart' },
  tooltip: { trigger: 'axis' },
  legend: { data: ['Sales', 'Profit'] },
  xAxis: { data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
  yAxis: {},
  series: [
    { name: 'Sales', type: 'bar', data: [120, 200, 150, 80, 70, 110] },
    { name: 'Profit', type: 'line', data: [20, 50, 30, 15, 25, 40] }
  ]
}

myChart.setOption(option)
console.log('📊 ECharts demo created! Check the chart above.')
```

#### 🎨 UI Enhancement with Bootstrap + Animations

```javascript
// Import Bootstrap CSS and Animate.css
await $i.css('bootstrap@5.3.0')
await $i.css('animate.css@4.1.1')

// Create a demo modal
const modalHTML = `
  <div class="modal fade" id="demoModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content animate__animated animate__bounceIn">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">🎉 Console Importer Demo</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div class="alert alert-success animate__animated animate__pulse animate__infinite">
            ✅ Bootstrap and Animate.css successfully loaded!
          </div>
          <p>This modal demonstrates:</p>
          <ul>
            <li>Bootstrap 5 styling</li>
            <li>CSS animations with animate.css</li>
            <li>Responsive design</li>
          </ul>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary" id="animateBtn">Animate!</button>
        </div>
      </div>
    </div>
  </div>
`

document.body.insertAdjacentHTML('beforeend', modalHTML)

// Import Bootstrap JS for modal functionality
await $i('bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js')

// Show modal and add animation handler
const modal = new bootstrap.Modal(document.getElementById('demoModal'))
modal.show()

document.getElementById('animateBtn')?.addEventListener('click', () => {
  const content = document.querySelector('#demoModal .modal-content')
  content.className = 'modal-content animate__animated animate__tada'
  setTimeout(() => {
    content.className = 'modal-content animate__animated animate__bounceIn'
  }, 1000)
})

console.log('🎨 Bootstrap + Animate.css demo created!')
```

#### ⚛️ React Components with Hooks

```javascript
// Import React and ReactDOM
const React = await $i.esm('react@18')
const ReactDOM = await $i.esm('react-dom@18/client')
const { useState, useEffect } = React

// Create container
let container = document.getElementById('react-demo')
if (!container) {
  container = document.createElement('div')
  container.id = 'react-demo'
  container.style.cssText = 'margin:20px;padding:20px;border:2px solid #61dafb;border-radius:8px;'
  document.body.appendChild(container)
}

// Counter component with hooks
const Counter = () => {
  const [count, setCount] = useState(0)
  const [message, setMessage] = useState('Welcome to Console Importer!')
  
  useEffect(() => {
    if (count > 0) setMessage(`You clicked ${count} times!`)
  }, [count])
  
  return React.createElement('div', { style: { textAlign: 'center', fontFamily: 'Arial' } },
    React.createElement('h2', { style: { color: '#61dafb' } }, 'React Demo'),
    React.createElement('p', null, message),
    React.createElement('div', { style: { fontSize: '48px', margin: '20px 0' } }, count),
    React.createElement('div', null,
      React.createElement('button', {
        onClick: () => setCount(count - 1),
        style: { margin: '0 10px', padding: '8px 16px', fontSize: '16px' }
      }, '➖'),
      React.createElement('button', {
        onClick: () => setCount(0),
        style: { margin: '0 10px', padding: '8px 16px', fontSize: '16px' }
      }, '🔄'),
      React.createElement('button', {
        onClick: () => setCount(count + 1),
        style: { margin: '0 10px', padding: '8px 16px', fontSize: '16px' }
      }, '➕')
    )
  )
}

// Render component
const root = ReactDOM.createRoot(container)
root.render(React.createElement(Counter))
console.log('⚛️ React counter demo created!')
```

#### 🌐 HTTP Requests with Axios

```javascript
// Import Axios
const axios = await $i.esm('axios')

// Create demo container
let container = document.getElementById('axios-demo')
if (!container) {
  container = document.createElement('div')
  container.id = 'axios-demo'
  container.style.cssText = 'margin:20px;padding:20px;border:1px solid #00d4ff;border-radius:8px;font-family:Arial;'
  document.body.appendChild(container)
}

container.innerHTML = `
  <h3 style="color:#00d4ff;">🌐 Axios HTTP Demo</h3>
  <button id="fetchBtn" style="padding:8px 16px;margin-right:10px;">Fetch Random User</button>
  <button id="fetchJokeBtn" style="padding:8px 16px;">Fetch Dad Joke</button>
  <div id="result" style="margin-top:15px;padding:10px;background:#f5f5f5;border-radius:4px;">Click a button to fetch data</div>
`

// Fetch random user data
document.getElementById('fetchBtn').addEventListener('click', async () => {
  const result = document.getElementById('result')
  result.innerHTML = '🔄 Loading...'
  
  try {
    const response = await axios.get('https://jsonplaceholder.typicode.com/users/1')
    const user = response.data
    result.innerHTML = `
      <h4>👤 User Information:</h4>
      <p><strong>Name:</strong> ${user.name}</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Company:</strong> ${user.company.name}</p>
      <p><strong>Website:</strong> ${user.website}</p>
    `
  } catch (error) {
    result.innerHTML = `❌ Error: ${error.message}`
  }
})

// Fetch dad joke
document.getElementById('fetchJokeBtn').addEventListener('click', async () => {
  const result = document.getElementById('result')
  result.innerHTML = '🔄 Loading joke...'
  
  try {
    const response = await axios.get('https://icanhazdadjoke.com/', {
      headers: { 'Accept': 'application/json' }
    })
    result.innerHTML = `
      <h4>😂 Dad Joke:</h4>
      <p style="font-style:italic;font-size:16px;">${response.data.joke}</p>
    `
  } catch (error) {
    result.innerHTML = `❌ Error: ${error.message}`
  }
})

console.log('🌐 Axios demo created! Try fetching some data.')
```

#### 🎮 3D Graphics with Three.js

```javascript
// Import Three.js
const THREE = await $i.esm('three@0.150.0')

// Create container
let container = document.getElementById('threejs-demo')
if (!container) {
  container = document.createElement('div')
  container.id = 'threejs-demo'
  container.style.cssText = 'width:600px;height:400px;margin:20px;border:2px solid #ff6b35;border-radius:8px;'
  document.body.appendChild(container)
}

// Create scene, camera, renderer
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, 600/400, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(600, 400)
renderer.setClearColor(0x222222)
container.appendChild(renderer.domElement)

// Create rotating cube
const geometry = new THREE.BoxGeometry(2, 2, 2)
const material = new THREE.MeshPhongMaterial({ 
  color: 0xff6b35,
  shininess: 100
})
const cube = new THREE.Mesh(geometry, material)
scene.add(cube)

// Add lighting
const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(5, 5, 5)
scene.add(light)
scene.add(new THREE.AmbientLight(0x404040, 0.4))

camera.position.z = 5

// Animation loop
function animate() {
  requestAnimationFrame(animate)
  cube.rotation.x += 0.01
  cube.rotation.y += 0.01
  renderer.render(scene, camera)
}
animate()

console.log('🎮 Three.js rotating cube demo created!')
```

#### 🚀 CDN-Specific Import Examples

```javascript
// Test different CDN providers
console.log('Testing CDN providers...')

// jsDelivr (Global, Fast)
await $i.jsdelivr('lodash')
console.log('✅ Lodash from jsDelivr:', typeof _)

// unpkg (npm registry mirror)
const moment = await $i.unpkg.esm('moment')
console.log('✅ Moment from unpkg:', moment().format('YYYY-MM-DD'))

// Skypack (ESM optimized)
const { LitElement, html } = await $i.skypack.esm('lit')
console.log('✅ Lit from Skypack:', typeof LitElement)

// CSS from different CDNs
await $i.jsdelivr.css('animate.css@4.1.1')
console.log('✅ Animate.css loaded from jsDelivr')

// Bootstrap from unpkg
await $i.unpkg.css('bootstrap@5.3.0/dist/css/bootstrap.min.css')
console.log('✅ Bootstrap CSS loaded from unpkg')

// Test Chinese CDNs (if available)
try {
  await $i.bootcdn('jquery')
  console.log('✅ jQuery from BootCDN (China)')
} catch (e) {
  console.log('⚠️ BootCDN not available or configured')
}

console.log('🎯 All CDN tests completed!')
```

#### 📚 Popular Library Quick Tests

```javascript
// Quick test suite for popular libraries
console.log('🔍 Testing popular libraries...')

// Lodash utilities
await $i('lodash')
const testArray = [1, 2, 3, 4, 5, 6]
console.log('📦 Lodash chunk:', _.chunk(testArray, 2))

// jQuery DOM manipulation  
await $i('jquery')
$('body').css('border', '3px solid #007cba')
console.log('📦 jQuery loaded, body border added')

// Day.js date formatting
const dayjs = await $i.esm('dayjs')
console.log('📦 Day.js current time:', dayjs().format('YYYY-MM-DD HH:mm:ss'))

// Chart.js for quick chart
await $i('chart.js')
let chartContainer = document.getElementById('quick-chart')
if (!chartContainer) {
  chartContainer = document.createElement('div')
  chartContainer.innerHTML = '<canvas id="quickChart" width="400" height="200"></canvas>'
  chartContainer.style.cssText = 'margin:20px;padding:20px;border:1px solid #ff6384;'
  document.body.appendChild(chartContainer)
  
  new Chart(document.getElementById('quickChart'), {
    type: 'doughnut',
    data: {
      labels: ['Console', 'Importer', 'Demo'],
      datasets: [{ data: [30, 40, 30], backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe'] }]
    },
    options: { responsive: false }
  })
}
console.log('📦 Chart.js demo chart created')

// Animate.css with demo element
await $i.css('animate.css')
let animateDemo = document.getElementById('animate-demo')
if (!animateDemo) {
  animateDemo = document.createElement('div')
  animateDemo.id = 'animate-demo'
  animateDemo.innerHTML = '🎉 Console Importer Rocks!'
  animateDemo.style.cssText = 'font-size:24px;text-align:center;padding:20px;margin:20px;background:linear-gradient(45deg,#ff6b6b,#4ecdc4);color:white;border-radius:10px;'
  animateDemo.className = 'animate__animated animate__bounce animate__infinite'
  document.body.appendChild(animateDemo)
}
console.log('📦 Animate.css demo element created')

console.log('✅ All library tests completed! Check the page for visual demos.')
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

### CDN-Specific Methods

Each enabled CDN provider automatically gets its own methods:

#### `$i.providerName(package, version?)`
Import from a specific CDN provider.

**Parameters:**
- `package` (string): Package name
- `version` (string, optional): Version

**Returns:** Promise<ImportResult>

**Examples:**
```javascript
await $i.jsdelivr('lodash')       // From jsDelivr
await $i.unpkg('react', '18.0.0') // From unpkg
await $i.skypack('lit')           // From Skypack
```

#### `$i.providerName.css(package, version?)`
Import CSS from a specific CDN provider.

#### `$i.providerName.esm(package, version?)`
Import as ES module from a specific CDN provider (if supported).

**Available methods depend on your configured providers:**
- `$i.jsdelivr()`, `$i.jsdelivr.css()`, `$i.jsdelivr.esm()`
- `$i.unpkg()`, `$i.unpkg.css()`, `$i.unpkg.esm()`  
- `$i.skypack()`, `$i.skypack.css()`, `$i.skypack.esm()`
- `$i.bootcdn()`, `$i.bootcdn.css()` (China)
- `$i.bytedancecdn()`, `$i.bytedancecdn.css()` (China)
- Custom provider methods based on configuration

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
- [WebX Kit](https://github.com/tmkx/webx-kit) by [@tmkx](https://github.com/tmkx) - Modern Chrome extension development framework
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