# Liquid Glass

Liquid Glass is the design language Apple introduced in 2025 (announced at WWDC on
June 9, 2025) and shipped across iOS 26, iPadOS 26, macOS Tahoe, tvOS 26, visionOS 26,
and watchOS 26. It replaces the previous flat material chrome with a dynamic,
translucent "glass" layer that refracts and reflects the content beneath it. If a
user asks for the "current," "new," "iOS 26," "glassy," or "frosted" Apple look, this
is it.

Official references: Liquid Glass overview —
https://developer.apple.com/documentation/technologyoverviews/liquid-glass ·
Adopting Liquid Glass —
https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass ·
Materials (HIG) — https://developer.apple.com/design/human-interface-guidelines/materials

## The idea

Liquid Glass treats interface chrome as a physical material with the optical
properties of glass: it's translucent, it **refracts and bends** the content behind
it (not just blurs it), it picks up light and casts subtle highlights along its
edges, and it **adapts** its own light/dark tone to keep the text and icons on top
legible. On device it also moves — reacting to scrolling and motion with a fluid,
liquid feel, and morphing shape as context changes.

Three concepts drive how you use it:

1. **Two layers: content and chrome.** Content lives on the bottom layer and fills the
   screen. Controls (bars, toolbars, tab bars, buttons, sidebars) live on a *Liquid
   Glass layer floating above* it. The glass is what separates "the stuff" from "the
   controls."
2. **Hierarchy through depth.** Importance is communicated by depth and translucency —
   what floats above, how it refracts, its visual weight — rather than only by size and
   color. More important chrome reads as more present glass.
3. **Floating, contextual, concentric.** Chrome is no longer pinned edge-to-edge. Bars
   become rounded, floating bubbles that appear, disappear, shrink, and change shape
   with context (e.g. a tab bar that minimizes as you scroll down and returns as you
   scroll up). Nested rounded shapes share **concentric** corner radii.

## Two variants

Apple defines two glass variants — choose by context:

- **Regular** — the adaptive, legible default. More opaque and self-balancing; works
  over any content. Use it for almost everything: navigation bars, tab bars,
  toolbars, sidebars, controls, sheets.
- **Clear** — more transparent, letting more of the content through. Only use it over
  media-rich content where legibility is safe (e.g. controls over a photo/video), and
  typically pair it with a **dimming layer** behind the glass so text stays readable.

When unsure, use Regular. Clear is a special-occasion finish, not a default.

## Design rules (so it looks right and stays usable)

- **Legibility beats effect.** Apple itself dialed back transparency between betas
  because text was hard to read in bright conditions. If content behind glass makes
  text hard to read, increase opacity, add a dimming/scrim layer, or switch Clear →
  Regular. Clarity always wins.
- **Don't stack glass on glass.** A glass control inside a glass bar muddies both.
  Put glass over *content*, not over other glass.
- **Keep the content layer flat.** Don't apply glass to ordinary content cards and
  backgrounds — it's for chrome and controls. Overusing it makes everything noisy.
- **Use concentric radii.** A glass button inside a glass bar should have
  `inner = outer − padding` so the curves nest cleanly.
- **Tint sparingly.** Glass can carry a subtle tint (e.g. a prominent action), but a
  little goes a long way; over-tinting kills the glass quality.
- **Respect Reduce Transparency / Increase Contrast / Reduce Motion.** These users get
  a **solid, opaque fill** and no fluid motion. This is non-negotiable for usability
  and accessibility — see `accessibility.md`.

## Building Liquid Glass on the web

You can get a convincing result with `backdrop-filter` plus edge highlights, and a
high-fidelity result by adding an SVG displacement filter for true refraction. Layer
it up:

### Level 1 — Frosted base (works everywhere it's supported)

```css
.glass {
  /* translucent fill so content shows through */
  background: color-mix(in srgb, var(--hig-bg-elevated) 65%, transparent);
  /* blur + boost saturation of what's behind = the "material" */
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: var(--hig-radius-lg);
  /* edge highlight (top) + hairline border = light catching glass */
  border: 0.5px solid color-mix(in srgb, white 25%, transparent);
  box-shadow:
    inset 0 1px 0 0 color-mix(in srgb, white 40%, transparent), /* top sheen */
    inset 0 -1px 0 0 color-mix(in srgb, black 8%, transparent),  /* bottom */
    0 8px 24px rgba(0, 0, 0, 0.16);                              /* float */
}
```

Tune three knobs: **blur radius** (thicker glass = larger blur), **fill opacity**
(legibility vs. transparency), and **saturation** (Apple over-saturates the backdrop
so color blooms through). For the **Clear** variant, lower the fill opacity and add a
dark scrim element behind the glass over busy media.

### Level 2 — Real refraction (Chromium) with SVG displacement

True glass bends light. Drive `backdrop-filter` with an SVG `feDisplacementMap`: a
displacement map (a radial/edge gradient baked into an SVG) pushes the backdrop
pixels outward near the edges, so the rim magnifies and distorts like a lens.

```html
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <filter id="glass-refract" x="-20%" y="-20%" width="140%" height="140%">
    <feImage href="#displacement-map" result="map"/>
    <feDisplacementMap in="SourceGraphic" in2="map"
        scale="40" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</svg>

<style>
  .glass--refract { backdrop-filter: blur(8px) url(#glass-refract); }
</style>
```

- `scale` controls refraction strength (subtle: 20–60). Build the displacement map so
  it's neutral in the center and strong at the edges (that's why only the rim warps).
- **Chromium only:** Safari and Firefox don't apply SVG filters in `backdrop-filter`.
  **Always feature-detect and fall back** to the Level-1 frosted blur:

```css
@supports not (backdrop-filter: blur(1px)) {
  .glass { background: var(--hig-bg-elevated); } /* solid fallback */
}
```

### Level 3 — Chromatic aberration (optional polish)

Real lenses split colors at the edge. Run the displacement in three passes (R, G, B)
with slightly different `scale` values and recombine, producing a faint rainbow fringe
at the rim. This is a nicety — skip it if it costs legibility or performance.

### Motion

- A floating bar can **shrink on scroll**: reduce its size/opacity as the user scrolls
  down, restore on scroll up, with a spring (`cubic-bezier(0.32,0.72,0,1)`, ~0.3s).
- Glass can **morph** between shapes (e.g. a button expanding into a menu) — animate
  `border-radius`, width, and height together.
- Gate all of this behind `prefers-reduced-motion: no-preference`.

## Accessibility fallback (required)

```css
@media (prefers-reduced-transparency: reduce), (prefers-contrast: more) {
  .glass, .glass--refract {
    background: var(--hig-bg-elevated);   /* opaque */
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    border-color: var(--hig-separator-opaque);
  }
}
@media (prefers-reduced-motion: reduce) {
  .glass { transition: none; }
}
```

The bundled `assets/apple-hig.css` already implements `.glass`, `.glass--clear`, and
`.glass--refract` with these fallbacks. Prefer those classes over hand-rolling.

## App icons (note)

Liquid Glass also redesigned app icons into a **layered, translucent** system (light,
dark, clear, and tinted variants, with a glass shimmer that reacts to motion). For a
web favicon/PWA icon you can't reproduce the live effect, but match the language:
layered depth, a rounded-rect ("squircle") mask, gradients, and a subtle highlight.
