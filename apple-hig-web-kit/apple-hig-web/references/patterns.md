# Patterns

Components are nouns; patterns are how you put them together into flows. This is where
an Apple-feeling app is won or lost — the right structure makes everything else feel
inevitable. Synthesized from Apple's HIG patterns guidance.

## Table of contents

- [Navigation](#navigation)
- [Modality](#modality)
- [Onboarding & launching](#onboarding--launching)
- [Search](#search)
- [Settings](#settings)
- [Entering data & forms](#entering-data--forms)
- [Feedback](#feedback)
- [Loading & empty states](#loading--empty-states)
- [Selection, editing, undo](#selection-editing-undo)
- [Sharing](#sharing)

---

## Navigation

Pick the structure that matches the content's shape. Mixing them incoherently is the
most common way an app stops feeling native.

- **Hierarchical (drill-down / push):** a stack of screens; tapping pushes a child
  that slides in from the trailing edge, the back button returns. Use for content
  that nests (Settings, Mail folders → messages → message). The nav bar's back button
  shows the parent's name.
- **Flat (tabs):** 2–5 peer sections reachable any time from a **tab bar** (iOS) or
  **sidebar** (iPad/macOS). Each tab keeps its own navigation stack. Use when sections
  are equally important and unrelated.
- **Content-driven / immersive:** the content *is* the navigation (a photo grid, a
  map, a game). Minimal chrome, often full-screen.

Principles: always make the current location obvious; provide an unambiguous way back;
don't bury primary destinations more than a couple of levels deep; preserve each tab's
state when switching. On iPad/macOS prefer a **split view** (sidebar + content +
optional detail) over deep pushing.

---

## Modality

A modal interrupts the normal flow to focus the user on one self-contained task, then
returns them. Use it deliberately — modality is powerful but it blocks everything
else.

Choose the lightest form that fits:

- **Alert** — a critical decision or message in 1–2 buttons. Highest interruption;
  use rarely.
- **Action sheet / menu** — a short set of choices tied to an action.
- **Sheet (with detents)** — a focused task that benefits from staying connected to
  its context (the parent peeks behind). The default modal for most tasks.
- **Full-screen cover** — only when the task genuinely needs the whole screen
  (camera, media playback, immersive create flows).
- **Popover** (iPad/macOS) — a small focused set of controls anchored to a control.

Always give an obvious exit: Cancel (discard) and Done/Save (commit), swipe-down on
sheets, or tapping outside for non-destructive popovers. If dismissing would lose
work, confirm with an action sheet. Don't stack modals on modals.

---

## Onboarding & launching

- **Launch fast into content.** Show a launch screen that resembles the first real
  screen (not a splash ad), and get the user to useful content immediately. Restore
  the previous state so returning feels instant.
- **Defer setup.** Don't gate the app behind a long sign-up or a permissions wall.
  Let people experience value first; ask for an account or a permission **in context,
  at the moment it's needed**, explaining why right before the system prompt.
- **Teach by doing.** If you need onboarding, keep it to a few swipeable pages with a
  **page control**, each making one point, skippable. Better: inline coach marks the
  first time a feature is used.
- **Ask for permissions respectfully.** Pre-explain (a custom screen) → then trigger
  the system dialog. Never ask for a permission you don't yet need.

---

## Search

- Put a **search field** where users expect it: under the nav-bar title (iOS), top of
  a list, or in the toolbar (macOS). It can hide on scroll and reappear on pull-down.
- Search as the user types (incremental results) when feasible; show recent/suggested
  searches before input. Provide **scopes** (a segmented control) when results span
  categories.
- Make a **Cancel** button return to the unfiltered state. Show a clear, friendly
  empty state for "no results" with a suggestion to broaden the query.

---

## Settings

- Use **inset-grouped lists** with section headers/footers. Footer text explains what
  a toggle does — this is the idiomatic place for help text.
- Group related options; put the most-used at the top. Use **toggles** for instant
  booleans, **disclosure rows** (chevron) to drill into sub-screens, **pop-up buttons/
  menus** for one-of-many choices, and **detail text** (`secondaryLabel`) to show the
  current value on the row.
- Keep settings out of the main flow — they're for occasional changes. Don't make
  users visit Settings to do everyday things.

---

## Entering data & forms

- **Minimize typing.** Offer sensible defaults, remember prior entries, use the
  right input type (so mobile keyboards adapt: email, number, tel, url), and provide
  pickers/steppers/toggles instead of free text where possible.
- **Group fields** into an inset list; label clearly; show format hints as
  placeholders, not as the only instruction.
- **Validate kindly.** Validate inline as the user leaves a field, explain how to fix
  the problem in plain language near the field, and never clear what they typed.
  Disable the submit button until the form is valid, or explain what's missing.
- **Autofocus** the first field; support Return-to-advance; keep the submit action
  reachable above the keyboard.

---

## Feedback

Match the feedback weight to the event's importance:

- **Inline / contextual** — the preferred default: update the UI in place (a row
  checks, a count changes, a control animates).
- **Transient banner / toast** — brief, non-blocking confirmation ("Message sent")
  that auto-dismisses. Use for low-stakes success/info.
- **Progress** — show determinate progress for known tasks, an activity spinner for
  short unknown ones, skeletons for content.
- **Alert** — only for critical, must-decide moments.
- **Haptics** (native) — reinforce key moments (success, warning, selection) sparingly;
  on the web there's no real equivalent, so lean on motion and sound cues lightly.

Confirm destructive actions, but don't nag for reversible ones — prefer **undo** over
a confirmation dialog where possible.

---

## Loading & empty states

- **Perceived performance matters more than raw speed.** Show the screen's structure
  immediately with **skeleton placeholders** (gray blocks shaped like the content)
  rather than a blank screen or a lone spinner. Load content progressively, top-down.
- Keep interactions responsive during load; never freeze the UI.
- **Design every empty state** — first run, no results, error, offline. Each gets a
  short friendly explanation, optionally a glyph, and a clear next action (a button to
  create the first item, retry, or adjust filters). An empty state is an opportunity,
  not a dead end.

---

## Selection, editing, undo

- **Edit mode** (iOS lists): an Edit/Done toggle reveals reorder grips, multi-select
  circles, and delete affordances; batch actions appear in a bottom toolbar.
- **Direct manipulation:** swipe-to-delete, drag-to-reorder, drag-and-drop between
  views (iPad/macOS) where it adds clarity.
- **Undo/redo:** support undo for destructive/irreversible-feeling actions. iOS has
  shake-to-undo and a system undo gesture; on the web, offer an undo affordance
  (e.g. in the confirmation banner) and standard ⌘Z on macOS-style apps.

---

## Sharing

Use the **share action** as the single entry point for "send this elsewhere"
(the square-with-up-arrow glyph). On the web, the closest native equivalent is the
Web Share API (`navigator.share`) on supported devices, falling back to an explicit
menu of destinations (copy link, email, social). Keep the shared payload (title, URL,
image) accurate and minimal.
