# Console Importer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/h7ml/console-importer/workflows/CI/badge.svg)](https://github.com/h7ml/console-importer/actions)
[![Release](https://img.shields.io/github/v/release/h7ml/console-importer)](https://github.com/h7ml/console-importer/releases)

[English](./README.md) | [简体中文](./README.zh-CN.md)

一个强大的 Chrome 扩展，允许开发者通过简单的命令直接从浏览器控制台导入 JavaScript 和 CSS 库。作为原版 Console Importer 扩展的现代化替代品构建。

## ✨ 特性

- 🚀 **快速导入**：使用 `$i('包名')` 导入任何 npm 包
- 🌐 **多个 CDN 源**：在 jsDelivr、unpkg、esm.sh、Skypack 等之间自动切换
- 📦 **版本管理**：指定精确版本或使用最新版
- 🎨 **CSS 支持**：使用 `$i.css('包名')` 导入 CSS 文件
- 📚 **ESM 支持**：使用 `$i.esm('包名')` 导入 ES 模块
- 🔍 **包搜索**：使用 `$i.search('关键词')` 搜索 npm 包
- 📋 **版本列表**：使用 `$i.versions('包名')` 列出所有版本
- 🌍 **国际化**：完整支持中英文
- ⚡ **智能回退**：一个 CDN 失败时自动尝试其他 CDN
- 🎯 **自定义 CDN 源**：添加您自己的 CDN 提供商

## 📥 安装

### 从 Chrome 网上应用店
即将推出...

### 从源代码安装

1. 克隆此仓库：
   ```bash
   git clone https://github.com/h7ml/console-importer.git
   cd console-importer
   ```

2. 安装依赖：
   ```bash
   pnpm install
   ```

3. 构建扩展：
   ```bash
   pnpm run build
   ```

4. 在 Chrome 中加载：
   - 打开 Chrome 并导航到 `chrome://extensions/`
   - 启用"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择 `dist` 文件夹

### 从发布版本安装

1. 从 [Releases](https://github.com/h7ml/console-importer/releases) 下载最新版本
2. 解压 zip 文件
3. 打开 Chrome 并导航到 `chrome://extensions/`
4. 启用"开发者模式"
5. 点击"加载已解压的扩展程序"
6. 选择解压后的文件夹

## 🚀 使用方法

### 基础导入

```javascript
// 导入最新版本
await $i('lodash')
// 现在使用 lodash
_.chunk(['a', 'b', 'c', 'd'], 2)

// 导入特定版本
await $i('jquery@3.6.0')
// 现在使用 jQuery
$('body').css('background', '#f0f0f0')

// 使用版本参数导入
await $i('moment', '2.29.4')
moment().format('YYYY-MM-DD')
```

### ES 模块

```javascript
// 作为 ES 模块导入
const { html, render } = await $i.esm('lit')

// 使用导入的模块
render(html`<h1>你好世界</h1>`, document.body)

// 导入 React
const React = await $i.esm('react')
const ReactDOM = await $i.esm('react-dom')
```

### CSS 导入

```javascript
// 导入 CSS 框架
await $i.css('bootstrap')
// CSS 自动应用到页面

// 导入特定版本
await $i.css('animate.css@4.1.1')
// 现在使用 animate.css 的类
document.querySelector('.my-element').classList.add('animate__animated', 'animate__bounce')

// 导入 CSS
await $i.css('tailwindcss')
```

### 搜索包

```javascript
// 搜索包
await $i.search('react')
// 显示匹配包的表格及评分

// 搜索结果包括：
// - 包名
// - 最新版本
// - 描述
// - 评分（相关性）
```

### 列出版本

```javascript
// 获取包的所有版本
await $i.versions('vue')
// 按降序列出所有可用版本

// 检查特定包的版本
await $i.versions('lodash')
// 显示所有 lodash 版本
```

### 帮助

```javascript
// 显示所有可用命令
$i.help()

// 调试当前配置
$i.debug()
// 显示：
// - 当前 CDN 配置
// - 启用的提供商
// - 优先级顺序
```

### 实际应用示例

#### 使用 ECharts 进行数据可视化

```javascript
// 导入 ECharts
await $i('echarts')

// 初始化 ECharts 实例
var myChart = echarts.init(document.getElementById('chart-container'));
// 如果没有容器，可以使用 body
// var myChart = echarts.init(document.getElementsByTagName('html')[0]);

// 指定图表的配置项和数据
var option = {
  title: {
    text: 'ECharts 入门示例'
  },
  tooltip: {},
  legend: {
    data: ['销量']
  },
  xAxis: {
    data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
  },
  yAxis: {},
  series: [
    {
      name: '销量',
      type: 'bar',
      data: [5, 20, 36, 10, 10, 20]
    }
  ]
};

// 使用刚指定的配置项和数据显示图表
myChart.setOption(option);
```

#### 其他流行库示例

```javascript
// 导入 Chart.js 用于图表
await $i('chart.js')

// 导入 D3.js 用于数据可视化
await $i('d3')

// 导入 Three.js 用于 3D 图形
await $i('three')

// 导入 Axios 用于 HTTP 请求
await $i('axios')

// 导入 Day.js 用于日期处理
await $i('dayjs')
```

## ⚙️ 配置

### 快速设置（弹窗）

点击扩展图标访问快速设置：
- 切换 CDN 提供商开关
- 启用/禁用自动回退
- 控制通知
- 快速链接到高级设置

### 高级设置

通过弹窗 → "高级设置"或右键点击扩展图标访问：
- **拖动重新排序** CDN 提供商（优先级顺序）
- **启用/禁用**单个 CDN 源
- **添加自定义 CDN 源**使用您自己的 URL 模板
- **全局设置**：
  - 自动回退：失败时自动尝试下一个 CDN
  - 显示通知：显示导入成功/失败通知
  - 启用缓存：缓存成功的导入以加快重新加载

### CDN 提供商

默认提供商包括：

#### 全球 CDN
- **jsDelivr** - 快速、可靠的全球 CDN，支持 npm
- **unpkg** - npm 上所有内容的 CDN
- **esm.sh** - 专为 ES 模块构建的现代 CDN
- **Skypack** - 为现代浏览器优化
- **cdnjs** - 社区驱动的 CDN

#### 地区 CDN（中国）
- **BootCDN** - 在中国流行，快速稳定
- **字节跳动 CDN** - 字节跳动的公共 CDN
- **七牛云 CDN** - 七牛云静态文件 CDN

### 自定义 CDN 配置

在高级设置中添加您自己的 CDN 源：
- **名称**：CDN 的显示名称
- **JS 模板**：JavaScript 文件的 URL 模板
- **CSS 模板**：CSS 文件的 URL 模板
- **描述**：CDN 的简要描述

模板变量：
- `{package}` - 包名
- `{version}` - 包版本

示例：
```
https://my-cdn.com/npm/{package}@{version}/dist/index.js
```

## 🛠️ 开发

### 前置要求
- Node.js >= 18
- pnpm >= 8

### 设置

```bash
# 克隆仓库
git clone https://github.com/h7ml/console-importer.git
cd console-importer

# 安装依赖
pnpm install

# 开发构建（监视模式）
pnpm run dev

# 生产构建
pnpm run build

# 格式化代码
pnpm run format
```

### 项目结构

```
src/
├── background/          # 后台服务工作器
├── config/             # 默认配置
├── content-scripts/    # 内容脚本和注入脚本
├── core/               # 核心功能
│   ├── importer.ts     # 主要导入逻辑
│   ├── console-api.ts  # $i API 实现
│   └── search.ts       # 包搜索功能
├── pages/              # UI 页面
│   ├── popup/          # 扩展弹窗
│   └── options/        # 选项页面
├── types/              # TypeScript 类型定义
└── utils/              # 实用函数
```

### 关键技术

- **WebX Kit**：Chrome 扩展开发框架
- **React**：UI 组件
- **TypeScript**：类型安全
- **Tailwind CSS**：样式
- **Rsbuild**：构建工具

## 🔧 API 参考

### `$i(package, version?)`
导入 JavaScript 库。

**参数：**
- `package` (string)：npm 包名或 `包名@版本`
- `version` (string, 可选)：版本覆盖

**返回：** Promise<ImportResult>

**示例：**
```javascript
await $i('lodash')
await $i('jquery', '3.6.0')
await $i('react@18.2.0')
```

### `$i.esm(package, version?)`
作为 ES 模块导入。

**参数：**
- `package` (string)：npm 包名
- `version` (string, 可选)：版本

**返回：** 带有模块导出的 Promise

**示例：**
```javascript
const { useState } = await $i.esm('react')
const Vue = await $i.esm('vue@3')
```

### `$i.css(package, version?)`
导入 CSS 文件。

**参数：**
- `package` (string)：包名
- `version` (string, 可选)：版本

**返回：** Promise<ImportResult>

**示例：**
```javascript
await $i.css('bootstrap')
await $i.css('animate.css', '4.1.1')
```

### `$i.search(query)`
搜索 npm 包。

**参数：**
- `query` (string)：搜索词

**返回：** Promise<SearchResult[]>

**示例：**
```javascript
const results = await $i.search('react')
// 返回包含名称、版本、描述、评分的包数组
```

### `$i.versions(package)`
列出包的所有版本。

**参数：**
- `package` (string)：包名

**返回：** Promise<string[]>

**示例：**
```javascript
const versions = await $i.versions('lodash')
// 返回 ['4.17.21', '4.17.20', ...]
```

### `$i.help()`
显示帮助信息。

**返回：** void

### `$i.debug()`
显示当前配置和调试信息。

**返回：** void

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

1. Fork 仓库
2. 创建您的功能分支（`git checkout -b feature/amazing-feature`）
3. 提交您的更改（`git commit -m 'feat: 添加很棒的功能'`）
4. 推送到分支（`git push origin feature/amazing-feature`）
5. 打开 Pull Request

详细指南请参阅 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 📝 许可证

本项目根据 MIT 许可证授权 - 有关详细信息，请参阅 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- 原版 [Console Importer](https://github.com/pd4d10/console-importer) 作者 pd4d10
- [WebX Kit](https://github.com/tmkx/webx-kit) 作者 [@tmkx](https://github.com/tmkx) - 现代化 Chrome 扩展开发框架
- 所有 CDN 提供商的优秀服务
- 开源社区

## 📞 支持

- **错误报告**：[GitHub Issues](https://github.com/h7ml/console-importer/issues)
- **功能请求**：[GitHub Discussions](https://github.com/h7ml/console-importer/discussions)
- **安全问题**：请直接通过邮件发送安全问题

## 🔗 链接

- [Chrome 网上应用店](#)（即将推出）
- [GitHub 仓库](https://github.com/h7ml/console-importer)
- [发布说明](https://github.com/h7ml/console-importer/releases)
- [原版 Console Importer](https://github.com/pd4d10/console-importer)