# Tamakan — Engineering Handoff (CLAUDE.md)

Read this first, then `Tamakan-PRD.md` for full product detail. This file is the build contract; the PRD is the source of truth for scope.

## What this is
Tamakan (تمكّن, "to enable") — an internal technical learning dashboard for **Kuwait Oil Company (KOC)**, Engineering & Reservoir department. Three surfaces, all in v1:
1. **Learner dashboard** — engineers consume learning tracks/modules, track progress.
2. **Manager dashboard** — team progress + knowledge-gap analytics (new, no MVP yet).
3. **AI assistant** — grounded technical Q&A over KOC/Tamakan content.

Existing MVP: `tamakan-dashboard.jsx` (single-file React + Recharts, inline styles). Treat it as a **reference for content/flows, not the target architecture** — we're rebuilding it into the stack below.

## Tech stack (default — change here if you disagree before building)
- **React + Vite + TypeScript**
- **Tailwind CSS** for layout + **CSS custom properties** for KOC design tokens (see below)
- **React Router** for routing
- **Recharts** for data-viz (manager analytics)
- **i18n**: `react-i18next` with full **RTL** support (Arabic/English)
- AI assistant backend: **TBD** — scaffold the UI + a typed client interface; stub the API until the retrieval/model approach is decided (see PRD §6.3, §13).

## Project structure (target)
```
src/
  app/            # routing, providers, layout shells
  surfaces/
    learner/      # overview, my-tracks, track-detail, explore
    manager/      # roster, gap-heatmap, analytics
    assistant/    # AI chat UI + client
  components/     # shared HIG-styled primitives (nav, tabs, card, sheet, ring, badge)
  design/         # tokens.css, theme, RTL logical-property helpers
  data/           # types + mock data (tracks, modules, users, progress)
  lib/            # utils, i18n, api clients
```

## Design system — non-negotiables
- **Apple HIG** look: SF/system font, generous whitespace, restrained depth, subtle Liquid Glass only where it aids clarity. Use the `apple-hig-web` skill for tokens/components.
- **KOC theme**: blue-falcon corporate identity. Use CSS variables (values below are a **starting system — confirm exact hex vs. official KOC brand guidelines**):
  ```css
  --koc-blue:#0A4A9F; --koc-navy:#0D1B4B; --koc-sky:#2B6CB0; --koc-sand:#C9A84C;
  --surface:#F5F7FA; --card:#FFFFFF; --text:#0D1B4B; --text-muted:#64748B;
  --success:#22C55E; --warning:#C9A84C; --locked:#CBD5E1;
  ```
- **RTL is designed in**, not bolted on: use CSS logical properties (`margin-inline`, `padding-inline`, `inset-inline`), never hard-code left/right. Every surface must mirror correctly in Arabic.
- **Accessibility**: WCAG 2.2 AA — contrast, keyboard nav, visible focus, screen-reader labels.

## Content model
Department → **Track** → **Module** → content unit. Module = { title, duration, type(video|reading|interactive), state(completed|in-progress|locked), prerequisite }. Locking enforces sequencing.

**v1 tracks (Engineering & Reservoir):** Reservoir Simulation Fundamentals, Intersect (IX) Simulation Tool, Well Test Analysis, Field Operations & Safety, SBHP Validation, PGOR Validation, PTA Analysis, PIPESIM Model, Simulation Fundamentals, STPF Fundamentals, Stimulation Program, Completion Program, SPTR Workframe, Pore Pressure Prediction. *(Removed IXFM Workflow Mastery.)*

⚠️ **Two overlaps unresolved** (see PRD §7.2): "Simulation Fundamentals" vs "Reservoir Simulation Fundamentals", and "PTA Analysis" vs "Well Test Analysis". Don't dedupe silently — ask before merging.

## Build order
1. Scaffold Vite+TS+Tailwind+Router; wire i18n + RTL; drop in `design/tokens.css`.
2. Build shared HIG components (nav, segmented tabs, card, progress ring, badge, list row, sheet).
3. **Learner surface** — port MVP flows (Overview / My Tracks / Track Detail / Explore) onto the new system with mock data in `data/`.
4. **Manager surface** — roster, gap heatmap (track × engineer), progress analytics.
5. **AI assistant** — chat UI + typed client with stubbed responses.
6. Accessibility + responsive pass; RTL QA in Arabic.

## Conventions
- TypeScript strict. Functional components + hooks. No inline styles for anything reusable — tokens + Tailwind.
- Keep data mocked in `src/data/` behind typed interfaces so a real API drops in later.
- Don't invent KOC brand values or track content — flag unknowns.

## Open questions (confirm with product owner, don't guess)
Track overlaps · the "950 target" meaning · content authoring role · AI content source/retrieval/hosting · KOC SSO/auth · gamification for enterprise context · whether managers can assign tracks. Details in PRD §13.
