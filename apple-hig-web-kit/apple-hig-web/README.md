# apple-hig-web

A Claude Code / Cowork **skill** for building web UIs (HTML / CSS / React) that follow
Apple's Human Interface Guidelines for **iOS, iPadOS, and macOS** — including the 2025
**Liquid Glass** design language.

Point Claude at this folder (or install the packaged `.skill`) and ask it to build an
Apple-style interface. It will use the bundled design tokens, component styles, and
React components, and consult the references for exact specs.

## What's inside

```
apple-hig-web/
├── SKILL.md                 # how Claude uses the skill (read this first)
├── references/
│   ├── foundations.md       # color, type, spacing, radii, materials, dark mode
│   ├── components.md         # specs for every control (iOS + macOS)
│   ├── patterns.md           # navigation, modality, forms, feedback, loading…
│   ├── liquid-glass.md       # the 2025 glass language + how to build it on the web
│   └── accessibility.md      # contrast, Dynamic Type, targets, reduced-motion, RTL
├── assets/
│   ├── tokens.css            # all design tokens as CSS variables (light + dark)
│   ├── apple-hig.css         # component classes built on the tokens
│   └── components.jsx         # matching React components (no dependencies)
└── examples/
    └── demo.html             # self-contained iOS + macOS demo — open in a browser
```

## Quick start (use the kit directly)

```html
<link rel="stylesheet" href="assets/tokens.css" />   <!-- tokens first -->
<link rel="stylesheet" href="assets/apple-hig.css" /> <!-- then components -->

<button class="hig-btn hig-btn--filled hig-btn--lg">Continue</button>
<nav class="hig-tabbar glass"> … </nav>
```

```jsx
import { Button, NavigationBar, TabBar, List, Row, Toggle } from "./assets/components.jsx";
```

- Dark mode is automatic (`prefers-color-scheme`); force it with
  `<html data-hig-theme="dark">`.
- Desktop density/type: `<html data-hig-platform="macos">`.
- Open `examples/demo.html` to see it all working.

## Notes

- The San Francisco font is **not** bundled — it's licensed by Apple for Apple
  platforms. The token font stack resolves to SF automatically on Apple devices and
  falls back gracefully elsewhere.
- Specs are synthesized from Apple's HIG; the live guidelines remain authoritative:
  https://developer.apple.com/design/human-interface-guidelines
