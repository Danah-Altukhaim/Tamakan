# Tamakan · تمكّن

Internal technical learning dashboard for **Kuwait Oil Company (KOC)**, Engineering & Reservoir department. Turns tribal, verbally-passed workflow knowledge into a standardized, trackable digital system.

Three surfaces, all in v1:

1. **Learner dashboard** — Overview, My Tracks, Track Detail (with prerequisite locking), Explore library.
2. **Manager dashboard** — team roster, knowledge-gap heatmap (track × engineer), progress analytics.
3. **AI assistant** — grounded technical Q&A that only answers from approved Tamakan content and cites its sources.

Bilingual **English / Arabic** with full **RTL** mirroring, Apple-HIG look, KOC blue-falcon theme.

## Architecture

```
tamakan/
  client/            React + Vite + TypeScript frontend
    src/
      app/           router, session/data provider, layout shell
      surfaces/      learner/ · manager/ · assistant/
      components/    shared HIG primitives (ring, card, badge, button…)
      data/          TypeScript domain types (JSON wire contract)
      lib/           api client, i18n (+ locales), progress/manager logic
      design/        tokens.css (KOC theme)
  server/            Node + Express + TypeScript API
    src/
      data/          mock content (14 tracks, team, resources) + types
      store/         in-memory progress store (PRD §11)
      assistant/     grounded Q&A engine (retrieval stub for TBD RAG)
      index.ts       REST API
```

The client talks to the server only through `client/src/lib/api.ts`; Vite proxies `/api` → `http://localhost:3001` in dev. A real backend (DB, KOC SSO, real RAG model) drops in behind the same HTTP contract.

## Run it

```bash
npm install        # installs both workspaces
npm run dev        # starts Express (:3001) and Vite (:5173) together
```

Open **http://localhost:5173**. Use the **Learner / Manager** toggle (top bar) to switch surfaces and the **العربية / English** button for language.

Other scripts:

```bash
npm run typecheck  # tsc --noEmit for client + server
npm run build      # production build of both
npm start          # run the built server
```

## API

| Method | Path | Purpose |
|---|---|---|
| GET  | `/api/tracks` · `/api/tracks/:id` | Tracks + modules |
| GET  | `/api/resources` | Explore library |
| GET  | `/api/users` · `/api/users/:id` | Team / learners |
| GET  | `/api/activity/:userId` | Weekly activity series |
| GET  | `/api/progress` · `/api/progress/:userId` | Progress records |
| POST | `/api/progress` | Upsert `{ userId, moduleId, state }` |
| POST | `/api/assistant` | Grounded answer `{ question }` → answer + citations + confidence |

## Notes & open questions (from PRD §13 — confirm with product owner)

- **KOC brand hex** values in `design/tokens.css` are a faithful *starting system*, not official tokens — confirm against KOC brand guidelines.
- **Track overlaps** (PRD §7.2) are **not** silently merged. The two flagged pairs are marked with `overlapsWith` and surfaced as a note on the track detail page:
  - *Simulation Fundamentals* ↔ *Reservoir Simulation Fundamentals*
  - *PTA Analysis* ↔ *Well Test Analysis*
- **AI assistant** uses a transparent keyword-retrieval stub over the content library. The retrieval/model backend (PRD §6.3, §13.4) is TBD — swap `server/src/assistant/engine.ts` for the real client; the response shape stays the same.
- **Auth**: no KOC SSO yet (PRD §13.5). The demo "logs in" as a fixed learner and uses the role toggle to preview the manager surface.
- Progress is stored in-memory and reseeds on server restart — swap `server/src/store/progress.ts` for a real DB for the auditable record (PRD §10).
