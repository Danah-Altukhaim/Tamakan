# Accessibility

Accessibility isn't a layer you add at the end — Apple builds it into every component,
and a clone that ignores it isn't a faithful clone. This is doubly true for Liquid
Glass, whose translucency actively works against legibility if unmanaged. Bake these
in from the first commit.

## The system preferences you must honor

Apple users can set system preferences that your web UI should mirror through CSS
media queries:

| Apple setting | Web media query | What to do |
| --- | --- | --- |
| Reduce Transparency | `prefers-reduced-transparency: reduce` | Replace glass/materials with **opaque** fills; drop `backdrop-filter`. |
| Increase Contrast | `prefers-contrast: more` | Stronger borders/separators, darker text, opaque surfaces, remove low-contrast translucency. |
| Reduce Motion | `prefers-reduced-motion: reduce` | Replace slides/scales/parallax with cross-fades or nothing; stop the liquid morphing. |
| Dark/Light appearance | `prefers-color-scheme` | Use the semantic tokens (already wired). |

The bundled `tokens.css` / `apple-hig.css` implement all four. If you write custom
glass or motion, **add the fallbacks** (see `liquid-glass.md`).

```css
@media (prefers-reduced-transparency: reduce), (prefers-contrast: more) {
  .glass { background: var(--hig-bg-elevated); backdrop-filter: none; }
}
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: .001ms !important; animation-iteration-count: 1 !important;
    transition-duration: .001ms !important; scroll-behavior: auto !important;
  }
}
```

## Color contrast

Target **WCAG 2.1 AA** (Apple's own minimum bar):

- **Body text:** contrast ratio ≥ **4.5:1** against its background.
- **Large text** (≥ 24px, or ≥ 19px bold): ≥ **3:1**.
- **Non-text** (icons, control borders, focus rings, meaningful graphics): ≥ **3:1**.
- Check **both light and dark** mode — passing one doesn't guarantee the other.
- Over glass/photos, contrast must hold against the *worst-case* backdrop pixel —
  that's why Clear glass needs a scrim. When in doubt, measure against the lightest and
  darkest content the glass could sit over.

Secondary/tertiary label colors are translucent by design; they pass on standard
backgrounds but **re-check them on tinted or glass surfaces**.

## Never rely on color alone

Color must not be the *only* way information is conveyed (a meaningful fraction of
users can't distinguish certain hues). Pair color with a glyph, text, shape, or
position: a red destructive button also says "Delete"; an error field also shows an
icon and a message; a selected tab is tinted **and** can carry a filled icon variant.

## Hit targets & pointers

- **Touch:** every interactive element needs a **≥ 44×44px** target with enough spacing
  that neighbors aren't mis-tapped. A small visual glyph still needs the 44px hit area
  (pad it; the padding can be invisible).
- **Pointer (macOS):** targets can be smaller (~28px) but keep ≥ ~20px and don't crowd.
- Make the **whole row** tappable in lists, not just the text.

## Dynamic Type / text scaling

Apple users scale system text up or down, and apps are expected to reflow, not
truncate. On the web:

- Define the type ramp in **`rem`** and keep one root font-size so browser zoom and
  user font-size settings scale everything.
- Avoid fixed-height containers around text; let them grow. Never clip essential text;
  allow wrapping.
- Test at ~130–200% text size — layouts should reflow gracefully (stack instead of
  truncate).

## Keyboard & focus

- Everything operable by pointer/touch must be operable by **keyboard**. Use semantic
  elements (`<button>`, `<a>`, `<input>`, `<select>`) so they're focusable and
  actionable for free.
- Provide a **visible focus indicator** — a tint-colored ring (`outline` or
  `box-shadow`). Don't remove outlines without replacing them. Use `:focus-visible` so
  the ring shows for keyboard users without cluttering mouse clicks.
- Logical **tab order** (DOM order = visual order); manage focus when opening sheets,
  menus, and alerts (move focus in, trap it while open, restore it on close).
- Support expected keys: Esc closes modals/menus; Enter/Space activate; arrows move
  within segmented controls, menus, and sliders.

## Screen readers (VoiceOver / web)

- Use **semantic HTML** first; reach for ARIA only to fill gaps. A real `<button>`
  beats a `<div role="button">`.
- Give every control an accessible **name** (visible label, `aria-label`, or
  `aria-labelledby`) and, where useful, a value/state (`aria-checked`,
  `aria-selected`, `aria-expanded`, `aria-current`).
- Icon-only buttons **must** have an `aria-label`.
- Announce dynamic changes with `aria-live` (e.g. a "Message sent" banner, validation
  errors, async results).
- Mark decorative imagery/icons `aria-hidden="true"`; give meaningful images real
  `alt` text.
- Structure with landmarks/headings (`<header> <nav> <main>`, `<h1>`…`<h6>`) so users
  can navigate by region and heading.

## Right-to-left (RTL)

Apple mirrors most layouts for RTL languages (Arabic, Hebrew). On the web:

- Set `dir="rtl"` and use **logical CSS properties** (`margin-inline-start`,
  `padding-inline-end`, `inset-inline-start`, `text-align: start`) instead of
  hard-coded left/right.
- Mirror directional glyphs (back chevrons, disclosure arrows, progress) but **not**
  things that are intrinsically L-to-R (media transport, clocks, most numerals).

## Quick audit checklist

- [ ] Text ≥ 4.5:1 (≥ 3:1 large); icons/borders/focus ≥ 3:1; verified in light **and** dark.
- [ ] No information conveyed by color alone.
- [ ] All targets ≥ 44px on touch; whole rows tappable.
- [ ] Type in `rem`; reflows at 200% without truncation.
- [ ] Visible `:focus-visible` ring on every interactive element; logical tab order.
- [ ] Modals/menus trap and restore focus; Esc closes.
- [ ] Icon-only controls have `aria-label`; dynamic updates use `aria-live`.
- [ ] `prefers-reduced-transparency`, `prefers-contrast`, `prefers-reduced-motion`,
      `prefers-color-scheme` all handled.
- [ ] RTL mirrors correctly with logical properties.
