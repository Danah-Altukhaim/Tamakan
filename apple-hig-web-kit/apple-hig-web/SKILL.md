---
name: apple-hig-web
description: >-
  Build web UIs (HTML/CSS/React) that look and behave like native Apple
  apps, following Apple's Human Interface Guidelines (HIG) for iOS, iPadOS,
  and macOS — including the 2025 "Liquid Glass" design language. Use this
  skill whenever the user wants an Apple-style, iOS-style, iPhone/iPad-style,
  macOS-style, or "Liquid Glass" interface; mentions the Human Interface
  Guidelines or HIG; asks to make a website/app/component "look like Apple,"
  match the System (San Francisco) font, use Apple system colors, build an
  Apple-looking navigation bar, tab bar, sidebar, sheet, toggle, segmented
  control, settings list, or alert; or wants a design reviewed/audited against
  Apple's guidelines. Trigger even when the user doesn't say "HIG" explicitly
  but clearly wants an Apple aesthetic on the web. Ships ready-to-use CSS
  design tokens, a component stylesheet, and React components.
---

# Apple HIG for the Web

Build web interfaces that feel genuinely native to Apple's platforms — not a vague
"clean and minimal" look, but the specific type ramp, color semantics, spacing
rhythm, control shapes, materials, and interaction patterns Apple specifies in the
Human Interface Guidelines. This skill translates those native conventions into
HTML, CSS, and React.

It covers **iOS / iPadOS** and **macOS**, and the **Liquid Glass** material system
Apple introduced in 2025 (iOS 26 / iPadOS 26 / macOS Tahoe and later).

## How to use this skill

1. **Identify the target.** Is the user building an iOS/iPhone-style screen, an
   iPad layout, or a macOS desktop-style app? The same tokens apply, but density,
   type sizes, and chrome differ. See `references/platforms` notes inside
   `references/foundations.md` and `references/components.md`.
2. **Start from the kit, don't reinvent it.** The bundled assets are the source of
   truth. Link `assets/tokens.css` first (it defines every design token as a CSS
   custom property, with automatic light/dark via `prefers-color-scheme`), then
   `assets/apple-hig.css` (component classes built on those tokens). For React,
   import from `assets/components.jsx`.
3. **Read the relevant reference before building a component from scratch.** Each
   reference file has the exact specs (sizes, colors, behavior). Don't guess
   numbers — Apple's values are specific and getting them wrong is what makes a
   clone look "off."
4. **Respect accessibility from the start**, not as a cleanup pass. Liquid Glass in
   particular fails badly if you ignore `prefers-reduced-transparency` and
   contrast. See `references/accessibility.md`.
5. **Verify** the result against the checklist at the end of this file.

## What to read when

| You are doing… | Read |
| --- | --- |
| Picking colors, type, spacing, radii, materials, dark mode | `references/foundations.md` |
| Building a specific control (button, nav bar, tab bar, list, sheet, toggle, field, alert, sidebar…) | `references/components.md` |
| Designing a flow (navigation, modality, onboarding, search, settings, forms, loading) | `references/patterns.md` |
| Anything translucent / glassy / "frosted" / the new Apple look | `references/liquid-glass.md` |
| Contrast, Dynamic Type, hit targets, reduced motion, VoiceOver, RTL | `references/accessibility.md` |

Bundled implementation (in `assets/`):

- **`tokens.css`** — all design tokens (color, type ramp, spacing, radii, shadows, materials, Liquid Glass) as CSS variables. Light + dark.
- **`apple-hig.css`** — component classes (`.hig-btn`, `.hig-navbar`, `.hig-tabbar`, `.hig-list`, `.hig-sheet`, `.hig-toggle`, `.hig-segmented`, `.hig-field`, `.hig-card`, `.glass`, …) built only from tokens.
- **`components.jsx`** — framework-light React components that emit the same classes.
- **`examples/demo.html`** — a self-contained page showing an iOS screen and a macOS window. Open it to see the system working; copy from it.

## The three design principles (the "why" behind everything)

Apple's guidance reduces to three ideas. When a decision isn't covered by a spec,
fall back to these:

- **Clarity** — text is legible at every size, icons are precise, and the meaning
  of every control is obvious. Negative space and color are used to communicate,
  not decorate. If a glass effect hurts legibility, clarity wins — add opacity.
- **Deference** — the UI defers to content. Chrome is light, translucent, and gets
  out of the way; motion and depth orient the user without stealing attention.
  Content fills the screen; controls float lightly above it.
- **Depth** — distinct visual layers and realistic motion convey hierarchy. Liquid
  Glass makes this literal: controls sit on a translucent layer *above* the content
  layer, and importance is shown through depth and translucency, not just size and
  color.

## Quick token reference

Use the CSS variables; never hardcode these. Full set with dark-mode values is in
`tokens.css` and documented in `references/foundations.md`.

**Tint / system colors (light mode):** blue `#007AFF`, green `#34C759`, red
`#FF3B30`, orange `#FF9500`, yellow `#FFCC00`, pink `#FF2D55`, purple `#AF52DE`,
indigo `#5856D6`, teal `#30B0C7`, mint `#00C7BE`, cyan `#32ADE6`, brown `#A2845E`,
gray `#8E8E93`. Blue is the default tint. Dark-mode variants are brighter (e.g.
blue `#0A84FF`).

**iOS type ramp (default Dynamic Type size):** Large Title 34 / Title1 28 /
Title2 22 / Title3 20 / Headline 17 semibold / Body 17 / Callout 16 / Subheadline
15 / Footnote 13 / Caption1 12 / Caption2 11. macOS is denser (Body 13).

**System font stack:** `-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro
Display", "Helvetica Neue", system-ui, sans-serif`. On Apple hardware this renders
as San Francisco automatically — do not import or ship SF; it's licensed by Apple.

**Spacing:** 8-pt grid with 4-pt steps — 4, 8, 12, 16, 20, 24, 32, 40. Default
screen margin on iOS is 16.

**Hit targets:** minimum **44×44 px** on touch (iOS/iPadOS); ~28 px control height
on macOS (pointer).

**Corner radius:** continuous ("squircle") corners. Small controls 6–8, buttons
10–12 (or full capsule = height ÷ 2), cards 12–16, sheets 16–20. Nested shapes are
**concentric**: inner radius = outer radius − padding.

## Verification checklist

Before calling a UI "done," confirm:

- [ ] Type uses the system font stack and the named ramp — no arbitrary sizes.
- [ ] Colors come from tokens; tint is consistent; light **and** dark mode both work.
- [ ] Spacing lands on the 4/8 grid; screen margins are 16 (iOS).
- [ ] Tap targets are ≥ 44 px on touch layouts.
- [ ] Corners are continuous and concentric where nested.
- [ ] Any glass/translucent surface stays legible and degrades to a solid fill under
      `prefers-reduced-transparency` / `prefers-contrast: more`.
- [ ] Text contrast ≥ 4.5:1 (≥ 3:1 for large text); UI never relies on color alone.
- [ ] Motion respects `prefers-reduced-motion`.
- [ ] Keyboard focus is visible; interactive elements use semantic HTML/ARIA.

## Source of truth

Specs here are synthesized from Apple's Human Interface Guidelines and Liquid Glass
documentation. When in doubt, link the user to the originals:

- Human Interface Guidelines — https://developer.apple.com/design/human-interface-guidelines
- Liquid Glass overview — https://developer.apple.com/documentation/technologyoverviews/liquid-glass
- Adopting Liquid Glass — https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass
- SF Symbols — https://developer.apple.com/sf-symbols/

Apple updates the HIG regularly; treat the live site as authoritative for anything
that looks newer than this skill.
