# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome extension called "Console Importer" that allows developers to import JavaScript and CSS libraries directly from the browser console using simple commands like `$i('package-name')`.

## Build and Development Commands

```bash
# Install dependencies (uses pnpm)
pnpm install

# Run development server with hot reload
pnpm run dev

# Build production extension
pnpm run build

# Type checking
pnpm run lint:type

# Format code
pnpm run format

# Check formatting
pnpm run format:check
```

After building, the extension files are in the `dist/` directory. Load this directory as an unpacked extension in Chrome.

## Architecture Overview

### Message Flow Architecture

The extension uses a three-layer architecture for injecting the `$i` API into web pages:

1. **Background Service Worker** (`src/background/index.ts`)
   - Handles configuration storage/retrieval
   - Responds to messages from content scripts

2. **Content Script** (`src/content-scripts/inject.ts`)
   - Runs in the context of web pages
   - Fetches configuration from background script
   - Injects configuration and the main script into the page

3. **Injected Script** (`src/content-scripts/injected-script.js`)
   - Runs in the page's main world (has access to page's window object)
   - Implements the actual `$i` API
   - Reads configuration from `window.__consoleImporterConfig`

This architecture is necessary because Chrome extensions have isolated contexts - content scripts can't directly modify the page's window object.

### Core Components

**CDN Provider System** (`src/types/index.ts` + `src/config/providers.ts`)
- Defines multiple CDN sources with priority ordering
- Supports automatic fallback when one CDN fails
- Configurable through UI with drag-to-reorder functionality

**Import Logic** (`src/core/importer.ts`)
- Handles the actual script/CSS loading with fallback mechanism
- Supports different import types: regular JS, ESM, CSS
- Implements version resolution and caching

**UI Pages** (React + Tailwind CSS)
- **Popup** (`src/pages/popup/`): Quick settings and CDN toggles
- **Options** (`src/pages/options/`): Advanced configuration

### WebX Kit Configuration

The project uses WebX Kit for Chrome extension development. Key configuration in `rsbuild.config.ts`:
- Background script entry point
- Content script configuration with `<all_urls>` match pattern
- Page entries for popup and options
- Special handling for `injected-script.js` (copied as static resource)

### Manifest V3 Structure

The manifest (`src/manifest.ts`) defines:
- Required permissions: `storage`, `activeTab`
- Host permissions for all CDN domains
- Content script injection on all URLs
- Web accessible resources for injected scripts

### Internationalization

The extension supports English and Chinese through:
- `src/utils/i18n.ts`: Translation system
- Auto-detects browser language
- All UI strings are internationalized

### Critical Implementation Details

1. **Configuration Passing**: The configuration must be injected into the page before the main script loads. This is done by creating a script element that sets `window.__consoleImporterConfig`.

2. **CDN Template System**: Each CDN provider has `jsTemplate` and `cssTemplate` strings with `{package}` and `{version}` placeholders.

3. **Version Resolution**: When importing with 'latest', the system attempts to fetch actual version numbers from CDN APIs before falling back to the 'latest' tag.

4. **Provider Priority**: Users can drag-to-reorder CDN providers in the options page. The order determines the fallback sequence.

5. **CDN-Specific Methods**: The system dynamically creates methods for each enabled CDN provider (e.g., `$i.jsdelivr()`, `$i.unpkg.css()`, `$i.skypack.esm()`). Method names are normalized from provider names by removing special characters and converting to lowercase.

## Testing Changes

When testing the extension:
1. Run `pnpm run build`
2. Go to `chrome://extensions/`
3. Click "Reload" on the Console Importer extension
4. Open any webpage and check the console for "[Console Importer] Ready!" message
5. Test with commands like `$i('lodash')` or `$i.help()`
6. Test CDN-specific methods like `$i.jsdelivr('jquery')` or `$i.unpkg.css('bootstrap')`
7. Use `$i.debug()` to see current configuration and available methods

## Common Issues

1. **Configuration not applying**: Check that the background script is sending config and the content script is properly injecting it before the main script loads.

2. **$i is not defined**: Ensure the content script is running at `document_start` and the injected script is properly loaded.

3. **CDN failures**: Check host permissions in manifest for new CDN domains.