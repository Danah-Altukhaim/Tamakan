# Foundations

The atomic design decisions: color, typography, layout, materials, icons, motion,
and dark mode. Every component inherits from these. All values are exposed as CSS
variables in `assets/tokens.css`; this file explains what they are and how to use
them.

## Table of contents

1. [Color](#color)
2. [Typography](#typography)
3. [Layout & spacing](#layout--spacing)
4. [Corner radius & shape](#corner-radius--shape)
5. [Materials & vibrancy](#materials--vibrancy)
6. [Elevation & shadow](#elevation--shadow)
7. [Icons (SF Symbols on the web)](#icons-sf-symbols-on-the-web)
8. [Dark mode](#dark-mode)
9. [Motion](#motion)
10. [iOS vs macOS](#ios-vs-macos)

---

## Color

Apple's color system is **semantic**, not literal. You rarely pick "a gray" — you
pick a *role* (`label`, `separator`, `systemBackground`) and the system supplies the
right value for the current appearance (light/dark) and context. Reproduce that on
the web with two layers of tokens: raw palette values, and semantic roles that point
at them and flip in dark mode.

### System (tint) colors

These are the accent colors. Blue is the default tint. Each has a light and a dark
value; the dark value is slightly brighter so it holds up on black.

| Role | Light | Dark |
| --- | --- | --- |
| Blue (default tint) | `#007AFF` | `#0A84FF` |
| Green | `#34C759` | `#30D158` |
| Indigo | `#5856D6` | `#5E5CE6` |
| Orange | `#FF9500` | `#FF9F0A` |
| Pink | `#FF2D55` | `#FF375F` |
| Purple | `#AF52DE` | `#BF5AF2` |
| Red | `#FF3B30` | `#FF453A` |
| Teal | `#30B0C7` | `#40C8E0` |
| Cyan | `#32ADE6` | `#64D2FF` |
| Mint | `#00C7BE` | `#63E6E2` |
| Yellow | `#FFCC00` | `#FFD60A` |
| Brown | `#A2845E` | `#AC8E68` |
| Gray | `#8E8E93` | `#8E8E93` |

Use tint for: the primary action, selected states, links, switches that are on,
and interactive text. Keep one tint per app unless there's a strong reason. Red is
reserved for destructive actions; green for success/affirmative; yellow/orange for
warnings.

### Gray ramp

Six grays, lightest-to-darkest in light mode (they invert in dark mode). Use for
fills, dividers, and inactive elements.

| Role | Light | Dark |
| --- | --- | --- |
| systemGray | `#8E8E93` | `#8E8E93` |
| systemGray2 | `#AEAEB2` | `#636366` |
| systemGray3 | `#C7C7CC` | `#48484A` |
| systemGray4 | `#D1D1D6` | `#3A3A3C` |
| systemGray5 | `#E5E5EA` | `#2C2C2E` |
| systemGray6 | `#F2F2F7` | `#1C1C1E` |

### Label colors (text)

Text uses translucent black/white so it adapts to any background. Don't use pure
`#000`/`#fff` for body text — use these.

| Role | Light | Dark | Use |
| --- | --- | --- | --- |
| label | `rgba(0,0,0,1)` | `rgba(255,255,255,1)` | Primary text |
| secondaryLabel | `rgba(60,60,67,0.6)` | `rgba(235,235,245,0.6)` | Subtitles, captions |
| tertiaryLabel | `rgba(60,60,67,0.3)` | `rgba(235,235,245,0.3)` | Disabled, hints |
| quaternaryLabel | `rgba(60,60,67,0.18)` | `rgba(235,235,245,0.16)` | Watermark-level |
| placeholderText | `rgba(60,60,67,0.3)` | `rgba(235,235,245,0.3)` | Field placeholders |

### Separators

| Role | Light | Dark |
| --- | --- | --- |
| separator (translucent) | `rgba(60,60,67,0.29)` | `rgba(84,84,88,0.6)` |
| opaqueSeparator | `#C6C6C8` | `#38383A` |

Hairline separators are 1px (or 0.5px on retina — use `1px` and let the device
handle it). Inset list separators start at the text, not the screen edge.

### Backgrounds

Two background "systems." Use **base** backgrounds for full-screen content with
your own grouping; use **grouped** backgrounds for grouped tables / settings-style
lists (the page is the darker tone and cards sit on top in the lighter tone).

| Role | Light | Dark |
| --- | --- | --- |
| systemBackground | `#FFFFFF` | `#000000` |
| secondarySystemBackground | `#F2F2F7` | `#1C1C1E` |
| tertiarySystemBackground | `#FFFFFF` | `#2C2C2E` |
| systemGroupedBackground | `#F2F2F7` | `#000000` |
| secondarySystemGroupedBackground | `#FFFFFF` | `#1C1C1E` |
| tertiarySystemGroupedBackground | `#F2F2F7` | `#2C2C2E` |

### Fill colors

Translucent grays for small shapes layered over content (e.g. the track of a
segmented control, a search field background, a thin badge). They're translucent so
the layer beneath subtly shows through.

| Role | Light | Dark |
| --- | --- | --- |
| systemFill | `rgba(120,120,128,0.2)` | `rgba(120,120,128,0.36)` |
| secondarySystemFill | `rgba(120,120,128,0.16)` | `rgba(120,120,128,0.32)` |
| tertiarySystemFill | `rgba(118,118,128,0.12)` | `rgba(118,118,128,0.24)` |
| quaternarySystemFill | `rgba(116,116,128,0.08)` | `rgba(118,118,128,0.18)` |

---

## Typography

The system typeface is **San Francisco (SF)**. On Apple devices the font stack below
resolves to it automatically; on other platforms it falls back gracefully. **Do not
download, embed, or self-host SF Pro / SF Compact / New York** — they're licensed by
Apple for Apple platforms. Rely on `-apple-system`.

```css
/* sans (SF Pro) */ font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", system-ui, sans-serif;
/* rounded   */ font-family: "SF Pro Rounded", -apple-system, system-ui, sans-serif;
/* serif (NY)*/ font-family: ui-serif, "New York", Georgia, serif;
/* mono      */ font-family: ui-monospace, "SF Mono", Menlo, monospace;
```

SF has two optical variants the OS swaps automatically: **Text** (< 20pt, looser
spacing, taller for reading) and **Display** (≥ 20pt, tighter). On the web you
approximate this with the tracking (letter-spacing) values below.

### iOS / iPadOS text styles (Dynamic Type, default "Large" size)

| Style | Size (px) | Weight | Line height | Tracking (letter-spacing) |
| --- | --- | --- | --- | --- |
| Large Title | 34 | Regular 400 | 41 | +0.37px |
| Title 1 | 28 | Regular 400 | 34 | +0.36px |
| Title 2 | 22 | Regular 400 | 28 | +0.35px |
| Title 3 | 20 | Regular 400 | 25 | +0.38px |
| Headline | 17 | Semibold 600 | 22 | −0.43px |
| Body | 17 | Regular 400 | 22 | −0.43px |
| Callout | 16 | Regular 400 | 21 | −0.31px |
| Subheadline | 15 | Regular 400 | 20 | −0.24px |
| Footnote | 13 | Regular 400 | 18 | −0.08px |
| Caption 1 | 12 | Regular 400 | 16 | 0 |
| Caption 2 | 11 | Regular 400 | 13 | +0.07px |

Body is the workhorse (17px). Headline = body size but semibold, for the emphasized
line in a pair (e.g. a list row title over a secondary subtitle). Large Title is the
big screen heading that collapses into the nav bar title on scroll.

**Dynamic Type:** real iOS scales every style when the user changes text size. On the
web, define the ramp in `rem` (or use CSS `clamp()`), keep a single root font-size,
and never set text in fixed `px` so users can scale with browser zoom. Support at
least a comfortable large setting; never truncate essential text.

### macOS text styles (denser; AppKit)

macOS uses smaller defaults because it's a pointer/desktop environment.

| Style | Size (px) | Weight |
| --- | --- | --- |
| Large Title | 26 | Regular |
| Title 1 | 22 | Regular |
| Title 2 | 17 | Regular |
| Title 3 | 15 | Regular |
| Headline | 13 | Bold 700 |
| Body | 13 | Regular |
| Callout | 12 | Regular |
| Subheadline | 11 | Regular |
| Footnote | 10 | Regular |
| Caption 1 / 2 | 10 | Regular |

Standard macOS control label text is 13px. Switch the `--hig-platform` data-attribute
(see `tokens.css`) to remap the ramp to macOS sizes.

### Weights

ultraLight 100 · thin 200 · light 300 · regular 400 · medium 500 · semibold 600 ·
bold 700 · heavy 800 · black 900. Most UI lives in 400 (body), 500–600 (emphasis,
buttons, headers). Reserve 700+ for large display text.

---

## Layout & spacing

### The grid

Apple lays out on an **8-pt grid with 4-pt subdivisions**. Token scale:
`2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64`. Prefer multiples of 8; use 4 for tight
relationships (icon-to-label), and 2 only for hairline nudges.

### Margins & safe areas

- iOS default content margin from the screen edge: **16px** (some large-title layouts
  use 20). Use `env(safe-area-inset-*)` so content clears notches, the home
  indicator, and rounded corners. Pin bottom bars above
  `env(safe-area-inset-bottom)`.
- iPadOS and macOS use wider, often readable-width-constrained columns; don't let
  body text lines exceed ~ 60–75 characters.

### Hit targets

- **Touch (iOS/iPadOS): minimum 44×44px** for any tappable control, with adequate
  spacing so neighbors aren't mis-hit. A small glyph can be 17–24px visually but must
  carry a 44px hit area (pad it).
- **Pointer (macOS):** controls are smaller; a standard push button is ~28px tall.
  Still give click targets ≥ ~20px and don't crowd them.

### Standard metrics (iOS)

- Navigation bar height: 44 (large-title mode adds the ~52px title block below).
- Tab bar height: ~49 (+ safe-area inset). Liquid Glass tab bars float and can shrink.
- Toolbar height: 44.
- List row min height: 44 (single line); multi-line rows grow.
- Status bar: 44–59 depending on device; usually not your concern on the web.

---

## Corner radius & shape

Apple corners are **continuous** ("squircles" / superellipses), not simple circular
arcs — the curvature eases in, so they look softer. CSS `border-radius` draws
circular arcs; it's a close-enough approximation. For pixel-perfect continuous
corners, you can use an SVG/`clip-path` superellipse, but plain `border-radius` is
fine for almost everything.

Radius scale: small controls **6–8**, buttons **10–12** (or capsule), text fields
**10**, cards/containers **12–16**, sheets/large surfaces **16–20**, app-icon-like
tiles **22.4% of the side**. A **capsule** (pill) has radius = height ÷ 2.

**Concentricity rule:** when one rounded shape nests in another, their corners should
be concentric — the inner radius equals the outer radius minus the gap between them
(`inner = outer − padding`). This is core to the Liquid Glass look, where controls
nest inside rounded containers.

---

## Materials & vibrancy

Before Liquid Glass, Apple's translucent surfaces were "materials" — a blurred,
saturated sample of what's behind them, used for bars, sidebars, notification
backgrounds, and popovers. They come in levels by thickness:

| Material | Approx. web recipe |
| --- | --- |
| Ultra-thin | `backdrop-filter: blur(20px) saturate(180%)` + ~55% surface tint |
| Thin | `blur(30px) saturate(180%)` + ~65% tint |
| Regular | `blur(40px) saturate(180%)` + ~72% tint |
| Thick | `blur(50px) saturate(180%)` + ~80% tint |

"Vibrancy" is the companion effect: text and icons *on* a material are themselves
partially blended with the background so they feel embedded in the glass. Approximate
with the translucent label colors above. Always keep a solid-color fallback for
`@supports not (backdrop-filter: blur(1px))` and for reduced-transparency users.

The current system extends this into **Liquid Glass** — see `liquid-glass.md`.

---

## Elevation & shadow

Apple shadows are soft and subtle; depth comes mostly from layering and material, not
heavy drop shadows.

- Resting card / row group: `0 1px 3px rgba(0,0,0,0.1)` (light), almost none in dark.
- Floating control / popover: `0 4px 16px rgba(0,0,0,0.12)`.
- Sheet / modal: `0 -2px 24px rgba(0,0,0,0.18)` rising from the bottom.
- macOS window: a larger ambient shadow `0 22px 70px rgba(0,0,0,0.35)` plus a 1px
  border.

In dark mode, lift surfaces with a *lighter background* (elevated grays) rather than a
shadow — shadows barely read on black.

---

## Icons (SF Symbols on the web)

Apple's icon library is **SF Symbols** (thousands of glyphs, 9 weights, 3 scales,
multiple rendering modes: monochrome, hierarchical, palette, multicolor). They're
designed to sit alongside SF text and align to its baseline.

On the web you **cannot redistribute the SF Symbols font** (licensed for Apple
platforms). Options, in order of fidelity:

1. Export the specific symbols you need from Apple's SF Symbols app as SVG and inline
   them (allowed for use in your Apple-platform-adjacent product per Apple's terms —
   check the license for your use case).
2. Use a visually close open icon set (e.g. Lucide, Phosphor) sized to match.
3. Match the **weight to your text weight**, optical size to the text size, and use
   `currentColor` so the icon inherits the label color (that's how monochrome
   rendering behaves).

Sizing: an inline symbol typically matches the cap height of adjacent text; a
standalone tab-bar/toolbar glyph is ~24–28px in a 44px target.

---

## Dark mode

Dark mode is not "invert the colors." Rules:

- Use the **semantic tokens** — they already carry both appearances. Wire them to
  `@media (prefers-color-scheme: dark)` (done for you in `tokens.css`).
- In dark mode, **elevation is shown by lighter surfaces.** Base is true black
  (`#000`) on OLED iOS; cards step up through the elevated grays.
- Tint colors shift brighter (the dark column above).
- Desaturate large color fills slightly; pure saturated color vibrates on black.
- Re-check contrast in *both* modes — a pair that passes in light can fail in dark.
- Don't ship only dark or only light; support both and follow the system preference,
  optionally with a manual override.

---

## Motion

- Motion is **functional**: it shows where things come from and go (a pushed screen
  slides in from the trailing edge; a sheet rises from the bottom; a tapped item
  expands into its detail). Avoid decorative animation that competes with content.
- Use spring-like easing. A reasonable default curve is
  `cubic-bezier(0.32, 0.72, 0, 1)` over ~0.3–0.5s for transitions; quicker
  (~0.2s) for control-state changes.
- Liquid Glass elements animate fluidly — they can morph shape, and a floating bar can
  shrink/expand on scroll. Keep it smooth and brief.
- **Always honor `prefers-reduced-motion`**: replace slides/scales with a simple
  cross-fade or no animation. See `accessibility.md`.

---

## iOS vs macOS

Same tokens, different feel:

| | iOS / iPadOS | macOS |
| --- | --- | --- |
| Input | Touch (44px targets) | Pointer (denser, hover states) |
| Type | Larger (Body 17) | Smaller (Body 13) |
| Primary chrome | Bottom tab bar, top nav bar with large title | Top unified toolbar, left sidebar (source list), traffic-light window controls |
| Lists | Inset-grouped, full-width rows | Source lists, tables with columns |
| Modality | Sheets with detents, full-screen covers | Panels, popovers, separate windows |
| Hover | none | rich hover/selection feedback |

When the user says "make it look like a Mac app," switch to the macOS type sizes,
add a sidebar + toolbar window frame, tighten spacing, and add hover states. When
they say "iPhone app," go to the touch metrics, bottom tab bar, and large-title nav.
