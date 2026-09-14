# Pinned Tabs Row

An [Obsidian](https://obsidian.md) plugin that shows pinned tabs in a separate row above the tab bar, like VS Code and IntelliJ.

## Features

- Pinned tabs get their own row on top of the tab bar; unpinned tabs stay in the row below
- **Compact pinned tabs** option: pinned tabs collapse into an icon-only strip (VS Code style)
- Pinned and unpinned rows scroll horizontally when full — no layout shifts, no tab reordering side effects
- Commands:
  - **Pin or unpin current tab** — toggle pin without touching the mouse
  - **Unpin all tabs** — clear the pinned row in one shot

## How it works

Pure CSS. Obsidian marks pinned tabs with a `.mod-pinned` status icon inside the tab header, which enables `:has(.mod-pinned)` selectors. When a tab is pinned, the tab bar switches from flexbox to a CSS grid with three rows:

```
pinned tabs    ← grid row 1
─────────────  ← grid row 2 (divider, rendered via ::before)
unpinned tabs  ← grid row 3
```

Tab headers are never moved in the DOM, so Obsidian's own tab rendering (`updateTabDisplay`) cannot interfere — no flicker, no disappearing tabs, no fighting with drag-and-drop.

The plugin's JavaScript is minimal: it toggles two body classes for the settings (enabled / compact) and registers a few commands.

## Requirements

- Obsidian 1.13.0 or later (needs `:has()` support)
- Desktop or mobile — the layout adapts automatically

## Installation

1. Open **Settings → Community plugins**
2. Select **Browse**, search for **Pinned Tabs Row**
3. Install and enable the plugin

## Usage

- Right-click a tab → **Pin** (or run **Pin or unpin current tab**)
- Pinned tabs jump to their own row on top
- Click the pin icon on a pinned tab to unpin it
- Optional: enable **Compact pinned tabs** in plugin settings for an icon-only pinned strip

## Development

```bash
npm install
npm run dev     # watch mode
npm run build   # production build
npm run lint    # eslint
```

## Releasing

1. Bump `version` in `manifest.json` and add the matching entry to `versions.json`
2. `npm run build`
3. Tag the release with the exact version (no `v` prefix) and attach `main.js`, `manifest.json`, `styles.css`