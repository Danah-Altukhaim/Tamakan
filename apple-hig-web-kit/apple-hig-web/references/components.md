# Components

Specs and web recipes for the standard Apple controls. Each entry gives the purpose,
the key measurements, behavior, and which class in `assets/apple-hig.css` /
component in `assets/components.jsx` to use. Build with the kit first; these specs are
for when you need to extend or verify it.

All measurements assume iOS/iPadOS unless a macOS note is given. Colors and sizes are
token references (see `foundations.md`).

## Table of contents

- [Buttons](#buttons)
- [Segmented control](#segmented-control)
- [Toggle (switch)](#toggle-switch)
- [Slider](#slider)
- [Stepper](#stepper)
- [Text field & search field](#text-field--search-field)
- [Pickers, menus, pop-up & pull-down buttons](#pickers-menus-pop-up--pull-down-buttons)
- [Navigation bar](#navigation-bar)
- [Tab bar](#tab-bar)
- [Toolbar](#toolbar)
- [Sidebar](#sidebar)
- [Lists & tables](#lists--tables)
- [Cards & boxes](#cards--boxes)
- [Sheets](#sheets)
- [Action sheet](#action-sheet)
- [Alert](#alert)
- [Popover](#popover)
- [Context menu](#context-menu)
- [Progress & activity indicators](#progress--activity-indicators)
- [Badges, labels & chips](#badges-labels--chips)
- [Page control](#page-control)

---

## Buttons

The most important control to get right. Apple buttons are defined by **role** and
**prominence**, not ad-hoc styling.

**Styles (prominence, low → high):**

- **Plain / borderless** — text only, in tint color. For low-emphasis or inline
  actions (e.g. "Edit," nav-bar actions).
- **Gray / tinted** — tint-colored label on a light tinted fill
  (`tint @ ~15% opacity`). Medium emphasis.
- **Filled / prominent** — white label on a solid tint fill. The single primary
  action of a screen. Use sparingly — ideally one per view.
- **Bordered** (macOS especially) — label on a subtle fill with a hairline border.

**Roles:** normal, **destructive** (red label or red fill), and **cancel**
(plain, often bold).

**Metrics:**

- iOS height: small 28 / medium 34 / **large 50** (large is the standard full-width
  CTA). Min touch target 44 regardless of visual height (pad it).
- Corner radius: 10–12, or **capsule** (height ÷ 2) — capsule is the modern default
  for prominent buttons and is how Liquid Glass buttons read.
- Horizontal padding: ~16–20; full-width CTAs span the 16px screen margins.
- Label: Body/Headline weight; filled buttons use semibold.
- macOS: standard push button ~28px tall, radius ~6, label 13px; default button is
  tinted (blue) and pulses focus.

**States:** default, hover (macOS / pointer — slight fill lift), pressed (~0.9
opacity or a darker fill), disabled (`tertiaryLabel` text, reduced fill), focused
(visible ring). Always animate the press quickly (~0.1s).

Kit: `.hig-btn` with modifiers `.hig-btn--filled` / `--tinted` / `--plain` /
`--bordered` / `--destructive` and `--sm` / `--lg`. React: `<Button variant prominence>`.

---

## Segmented control

A horizontal row of 2–5 mutually exclusive options — a compact, inline switch between
peer views or modes. One segment is always selected.

**Metrics:** height ~32 (iOS) / ~22 (macOS). Track is `tertiarySystemFill`; the
**selected segment is a white (light) / elevated (dark) capsule** that slides with a
~0.2s spring and casts a tiny shadow. Equal-width segments; labels are Subheadline/
Caption, medium weight; dividers between unselected segments fade near the selection.
Each segment needs a ≥ 44px hit area on touch even if visually shorter.

Don't use for more than ~5 options or for actions (use a tab bar for top-level
navigation, a menu for many choices). Kit: `.hig-segmented`. React: `<Segmented>`.

---

## Toggle (switch)

Binary on/off for a single setting, applied immediately (no "save").

**Metrics:** **51×31** track, 27px knob, full capsule. Off = `systemGray5` track,
knob right-aligned left. On = **green `#34C759`** track (this is the system default;
some contexts tint it differently), knob slides right ~0.25s. The knob is white with
a soft shadow. Min 44px hit area.

Use only for instant-effect booleans. For options that need confirmation, use a
checkmark row instead. Kit: `.hig-toggle`. React: `<Toggle checked>`.

---

## Slider

Select from a continuous range. **Track** ~4px tall, filled portion in tint, unfilled
in `systemFill`; **thumb** a ~28px white circle with shadow. Optional min/max glyphs
at the ends. Provide keyboard support (arrows) and a 44px thumb hit area. Don't use a
slider for precise values — pair with a field or stepper if exactness matters. Kit:
`.hig-slider`.

---

## Stepper

Increment/decrement a discrete value (− / +). Two 44px-target buttons joined, with a
hairline divider; usually paired with a label showing the value. macOS steppers are
small stacked chevrons. Use for small ranges; for large ranges use a field. Kit:
`.hig-stepper`.

---

## Text field & search field

**Text field:** single-line input. iOS rounded style: `tertiarySystemFill` or white
background, radius 10, height ~36–44, 11–12px inset, Body text, `placeholderText`
color for the hint. Focus shows the caret in tint; a clear "✕" button appears at the
trailing edge when there's text. Group multiple fields into an inset list (settings
style) rather than floating them.

**Search field:** a text field with a leading magnifying-glass glyph and rounded/
capsule fill (`tertiarySystemFill`); placeholder "Search". On focus it can expand and
reveal a "Cancel" button. In nav bars it lives under the title and can hide on scroll.

macOS fields are shorter (~22px), radius ~6, with a focus ring. Kit: `.hig-field`,
`.hig-search`. React: `<TextField>`, `<SearchField>`.

---

## Pickers, menus, pop-up & pull-down buttons

- **Menu** — a list of actions or choices that appears from a button or on
  long-press/right-click. Rows have a label, optional leading icon (trailing on iOS),
  can be grouped with dividers, and can mark a destructive item in red. Rounded
  container on a material/glass background, ~0.2s scale-in from the source.
- **Pull-down button** — a button that opens a menu of **actions** (e.g. "＋" → New
  Folder / New File). The button keeps its own label/icon.
- **Pop-up button** — a button that opens a menu to **choose one value**, and then
  displays the chosen value with a leading/trailing chevron (`chevron.up.chevron.down`).
  This is the Apple equivalent of a `<select>`.
- **Picker** — wheel (iOS) or inline list for choosing from a set (dates, options).
  On the web a native `<select>` styled to match, or a custom menu, is usually right.

Kit: `.hig-menu`, `.hig-popup`. React: `<Menu>`, `<PopUpButton>`.

---

## Navigation bar

Top bar for a hierarchy of screens. Holds the **title**, a **back button** (chevron +
previous title, leading), and **action buttons** (trailing).

**Large-title behavior (iOS):** at the top of a scroll view the title is Large Title
(34, bold) on its own line below the bar; as the user scrolls up it shrinks and
moves into the centered standard title (17, semibold) and a hairline/blur appears
under the bar. Reproduce by swapping the title style on scroll and revealing the bar
material.

**Material:** the bar is translucent (Liquid Glass / regular material) over content;
content scrolls under it. Height 44 (+ large-title block ~52). Back button is tappable
across its whole label, 44px tall.

macOS: a **unified toolbar** merges title and controls into the window's title bar;
items are toolbar buttons (icon + optional label), with the traffic-light controls at
the leading edge. Kit: `.hig-navbar`. React: `<NavigationBar large>`.

---

## Tab bar

Bottom bar (iOS/iPadOS) for **flat, top-level navigation** between 2–5 sections. Each
tab is an icon (SF Symbol, ~24–28px) above a Caption2 (~10px) label; the selected tab
is tint-colored, others are `secondaryLabel`. Persistent — it stays across the section
it belongs to.

**Liquid Glass (current):** the tab bar **floats** above content as a rounded glass
capsule rather than a full-width opaque bar, and can **shrink/minimize on scroll**
(collapsing toward an icon-only state) to give content room, re-expanding when the
user scrolls up. Keep it pinned above `safe-area-inset-bottom`.

Don't exceed 5 tabs (a 5th "More" overflow if needed). Don't put actions in a tab bar
— tabs are destinations, not verbs. iPad and macOS often replace the tab bar with a
**sidebar**. Kit: `.hig-tabbar`. React: `<TabBar>`.

---

## Toolbar

A set of frequent **actions** for the current screen, at the **bottom** (iOS) or
**top** (macOS, integrated with the title bar). Items are tint-colored glyphs/labels
with 44px targets; group related actions and separate groups with flexible space. In
Liquid Glass, toolbars are floating, contextual bubbles that can appear/disappear and
change shape with context. Kit: `.hig-toolbar`.

---

## Sidebar

Primary navigation for iPad and macOS (and wide layouts). A vertical list of
top-level destinations, often in collapsible groups, on a translucent/glass
background. The selected row gets a tinted capsule highlight. macOS source lists use
smaller text (13/11px), disclosure triangles for groups, and a vibrancy background.
A sidebar can be collapsed to give content full width. Pair with a content/detail
area (split view). Kit: `.hig-sidebar`. React: `<Sidebar>`.

---

## Lists & tables

The backbone of iOS UIs. Three styles:

- **Plain** — full-width rows, section headers stick to the top on scroll. For
  indexes, search results.
- **Grouped** — rows in groups with header/footer text; group spans full width.
- **Inset grouped** — the Settings look: rounded card groups inset 16px from the
  edges on `systemGroupedBackground`. The modern default.

**Row:** min height 44, 16px leading inset for content (separators inset to align
with text, not the screen edge). A row can have a leading icon/image, a title (Body)
with optional subtitle (Subheadline `secondaryLabel`), and a trailing accessory:
disclosure **chevron** (push), **checkmark** (selection), a control (toggle/segmented),
or detail text in `secondaryLabel`. Tapping a whole row is the target on touch.

**Swipe actions** (iOS): reveal colored action buttons by swiping a row (trailing for
delete/more, leading for flag/mark). **Edit mode** shows reorder grips and red delete
circles.

macOS uses **tables** with columns, header row, sortable columns, alternating row
backgrounds, and hover/selection highlight. Kit: `.hig-list`, `.hig-row`. React:
`<List>`, `<Row>`.

---

## Cards & boxes

A grouped container for related content/controls, with a rounded rect background
(`secondarySystemGroupedBackground`), radius 12–16, soft shadow or hairline. Keep
padding on the grid (16). Don't over-nest cards; respect concentric radii when you
do. Kit: `.hig-card`.

---

## Sheets

A view that slides up from the bottom over the current context for a focused,
self-contained task (compose, detail, settings sub-screen).

**Detents (iOS):** a sheet can rest at **medium** (~half height) or **large**
(~full, leaving a peek of the parent at the top). A **grabber** (small capsule
handle) at the top hints it's draggable. Corners are 16–20 radius at the top; the
parent behind scales back slightly and dims. Provide a clear dismiss (swipe down,
Cancel/Done in a nav bar, or tap the dimmed area for non-critical sheets).

- **Page sheet** — the standard card that leaves the parent peeking (default).
- **Form sheet** — narrower, centered on iPad.
- **Full-screen cover** — covers everything; use only when the task truly needs the
  whole screen.

macOS equivalent: a sheet drops from the window's title bar, modal to that window.
Kit: `.hig-sheet` + `.hig-sheet-backdrop`. React: `<Sheet detent>`.

---

## Action sheet

A set of **choices related to a specific action**, rising from the bottom (iOS,
anchored to the triggering control on iPad as a popover). Title/message optional,
then a list of buttons; **destructive** options in red at the relevant position; a
separated **Cancel** at the bottom. Use for 2–6 contextual choices, especially
confirming a destructive action. For more/structured choices use a menu or sheet.
Kit: `.hig-actionsheet`.

---

## Alert

A small modal interrupting for **critical** information or a decision. Centered card
(~270px wide iOS), title (Headline, bold) + optional message (Subheadline/Footnote),
then **1–2 buttons** stacked or side-by-side. Two buttons sit side by side (Cancel
leading, default/bold trailing); 3+ or long titles stack vertically. The destructive
choice is red; the **preferred/cancel** action is bold. Behind it, a dimmed,
blurred backdrop. Use rarely — alerts are interruptions. Never use an alert for
non-critical info (use a banner/toast). Kit: `.hig-alert`. React: `<Alert>`.

---

## Popover

A transient container anchored to a control (with a little arrow pointing at it),
common on iPad and macOS. Holds a focused set of controls/content on a material/glass
background; dismisses on outside tap. On compact iPhone width, popovers usually adapt
into sheets. Kit: `.hig-popover`.

---

## Context menu

Press-and-hold (iOS) or right-click (macOS/iPad) on an item to reveal a menu of
actions for it, often with a **preview** of the item floating above. Group actions,
put destructive ones last in red. On the web, wire to `contextmenu` and long-press.
Kit: reuse `.hig-menu`.

---

## Progress & activity indicators

- **Determinate progress bar** — a 2–4px track, filled in tint, for known-duration
  tasks (downloads). Show percent if useful.
- **Indeterminate spinner** ("activity indicator") — the ring of spokes for unknown
  duration; keep small and centered. On the web, a rotating conic-gradient or SVG.
- **Activity ring / gauge** — circular progress (the Fitness look): a rounded-cap
  arc on a faint track, often with a gradient. Use for a single metric toward a goal.

Prefer skeletons/placeholders over spinners for content loading (see
`patterns.md`). Kit: `.hig-progress`, `.hig-spinner`, `.hig-ring`.

---

## Badges, labels & chips

- **Notification badge** — a red capsule with white number, top-trailing on an icon.
- **Label** — an icon+text lockup in a consistent order; the basic unit of a list row
  or toolbar item.
- **Tag / token** — a small capsule (e.g. recipients in a "To:" field), tint-tinted
  fill, removable. Kit: `.hig-badge`, `.hig-tag`.

---

## Page control

The row of dots indicating position in a paged, horizontally-swiped set (onboarding,
carousels). Current dot is solid/tinted, others faded. Keep dots ~7px with ~9px
spacing; ≤ ~8 dots before it gets noisy. Kit: `.hig-pagecontrol`.
