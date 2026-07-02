# Tamakan — Product Requirements Document (PRD)

**تمكّن · Technical Learning Dashboard for Kuwait Oil Company (KOC)**

| | |
|---|---|
| **Product** | Tamakan — internal technical learning platform |
| **Department (v1)** | Engineering & Reservoir |
| **Version** | 0.1 — Draft for review |
| **Date** | July 2026 |
| **Status** | Draft (pre-development) |

---

## 1. Overview

Tamakan (Arabic *تمكّن*, "to enable / to empower") is an intelligent, centralized learning dashboard for KOC engineers — both new hires and experienced staff. It converts knowledge that today lives in people's heads and is passed on verbally into a standardized, trackable, always-current digital system.

This PRD defines the product for **v1**, targeting the Engineering & Reservoir department, and sets the foundation to expand to other disciplines later.

---

## 2. Problem & Opportunity

### 2.1 Problem
Technical knowledge transfer at KOC is inconsistent and fragile:

- **Manual handover** — knowledge is shared verbally, with no standardized process.
- **Pattern-copying over independent thinking** — new engineers mimic learned methods, which limits creativity and true understanding.
- **Trapped knowledge** — critical workflows are lost when key employees are unavailable or on leave.

### 2.2 The cost today
- **Time** consumed on repetitive training instead of high-value work.
- **Dependency** — long ramp-up before a new hire can operate independently.
- No **standardized digital record** of team workflows.

### 2.3 Opportunity
A single source of truth for workflows, tools, and procedures that ramps engineers **from weeks to days**, frees senior engineers from repetitive training, and gives managers real-time visibility into learning progress and knowledge gaps.

---

## 3. Goals & Success Metrics

| Goal | Target metric |
|---|---|
| Cut new-hire ramp time | Time-to-independent reduced from weeks → days (baseline TBD) |
| Free senior engineers | Reduction in hours spent on repetitive 1:1 training |
| Standardize training | 100% of core Engineering & Reservoir workflows documented as tracks |
| Keep workflows current | Content review/update cycle ≤ defined SLA per track |
| Self-paced learning | Each engineer progresses independently; completion rates tracked |
| Real-time gap tracking | Managers can identify team knowledge gaps live |

*Note: The pitch references a "950 target." Its meaning is unconfirmed and is excluded from this PRD until clarified.*

---

## 4. Users & Roles

Tamakan serves three roles in v1:

**1. Learner (Engineer)** — new hires and experienced engineers. Primary daily user. Consumes tracks, completes modules, tracks own progress, asks the AI assistant.

**2. Manager / Admin** — team leads and discipline heads. Monitors team progress, identifies knowledge gaps, sees who has/hasn't completed critical tracks. (Content authoring may sit here or in a dedicated author role — see Open Questions.)

**3. AI Assistant** — an in-product AI Q&A guide that answers technical questions and points engineers to the right track/module/resource.

---

## 5. Scope

### 5.1 In scope (v1 — "Full vision")
- **Learner dashboard** (evolves the existing MVP)
- **Manager / admin dashboard** (new, designed from scratch)
- **AI assistant** (working Q&A for technical guidance — not a placeholder)
- **KOC-themed, Apple-HIG design system** with full Arabic/English RTL support
- **Real track model** for Engineering & Reservoir (13 tracks — see §7)

### 5.2 Out of scope (v1 / later phases)
- Expansion to departments beyond Engineering & Reservoir
- Deep integration with external HR/LMS systems (unless required — TBD)
- Certification/accreditation issuance
- Mobile native apps (responsive web is in scope; native is not)

---

## 6. The Three Surfaces

### 6.1 Learner Dashboard
Evolves the current MVP. Structure:

- **Overview** — welcome header, learner status (progress ring, streak, points, rank), weekly activity chart, and "Continue Learning" shortcuts.
- **My Tracks** — grid of assigned tracks with progress; drill into a track to see its module list with states (completed / in-progress / locked) and Continue/Review actions.
- **Explore** — searchable library of supporting resources (PDF guides, video series, interactive walkthroughs, recorded lectures) tagged by level.
- **AI Assistant** — always-accessible entry point (see §6.3).

**Gamification** (streak, points, rank) is retained as a motivation layer; final mechanics to be confirmed.

### 6.2 Manager / Admin Dashboard *(new)*
No MVP exists — this surface is designed from scratch. Core needs:

- **Team roster** with per-engineer completion %, current track, last activity.
- **Knowledge-gap view** — which critical tracks/modules are incomplete across the team; heatmap of coverage by track × person.
- **Progress analytics** — completion trends over time, time-to-complete, at-risk learners.
- **Track management hooks** — visibility into which workflows are documented vs. missing; flag out-of-date content.
- **Drill-down** from team → individual → track → module.

Data visualization here is a first-class requirement (see design §9).

### 6.3 AI Assistant *(in v1)*
- In-product conversational Q&A for **technical guidance** scoped to KOC Engineering & Reservoir workflows and the Tamakan content library.
- Answers questions, cites/links the relevant track, module, or resource.
- Accessible from any surface (persistent entry point).
- **Guardrails:** answers grounded in approved Tamakan content; clearly indicates uncertainty; does not fabricate procedures. Escalation/"ask a human" path where confidence is low.
- Content source-of-truth, retrieval approach, and model hosting to be specified in a technical design doc.

---

## 7. Learning Content Model

### 7.1 Hierarchy
**Department → Track → Module → (content unit).**
A **module** has: title, duration, type (video / reading / interactive), and state (completed / in-progress / locked). Locking supports prerequisite sequencing.

### 7.2 v1 Tracks — Engineering & Reservoir (13)

| # | Track | Source |
|---|---|---|
| 1 | Reservoir Simulation Fundamentals | Kept from MVP |
| 2 | Intersect (IX) Simulation Tool | Kept from MVP |
| 3 | Well Test Analysis | Kept from MVP |
| 4 | Field Operations & Safety | Kept from MVP |
| 5 | SBHP Validation | Added |
| 6 | PGOR Validation | Added |
| 7 | PTA Analysis | Added |
| 8 | PIPESIM Model | Added |
| 9 | Simulation Fundamentals | Added |
| 10 | STPF Fundamentals | Added |
| 11 | Stimulation Program | Added |
| 12 | Completion Program | Added |
| 13 | SPTR Workframe | Added |
| 14 | Pore Pressure Prediction | Added |

*Removed from MVP: IXFM Workflow Mastery.*

> **Two overlaps to confirm before content build:**
> - **"Simulation Fundamentals" (#9)** vs. **"Reservoir Simulation Fundamentals" (#1)** — same track or two distinct ones?
> - **"PTA Analysis" (#7)** vs. **"Well Test Analysis" (#3)** — PTA (Pressure Transient Analysis) currently sits *inside* Well Test as a module; keep separate or merge?
>
> If both pairs are distinct, the list is **14 tracks**; if each collapses, it trends toward 12. Listed as provided pending confirmation.

---

## 8. Functional Requirements

### 8.1 Learner
- FR-L1: View personal overview with progress, streak, points, rank.
- FR-L2: Browse assigned tracks and see completion state per track.
- FR-L3: Open a track and view ordered modules with states.
- FR-L4: Start/continue a module; mark progress; resume where left off.
- FR-L5: Respect prerequisite locking (locked modules not startable).
- FR-L6: Search and open resources in Explore, filtered by type/level.
- FR-L7: Ask the AI assistant and receive grounded, cited answers.
- FR-L8: Switch language (EN/AR) with correct RTL layout.

### 8.2 Manager
- FR-M1: View team roster with progress and activity.
- FR-M2: View knowledge-gap coverage across tracks × engineers.
- FR-M3: View progress analytics and at-risk learners.
- FR-M4: Drill from team → individual → track → module.
- FR-M5: See which workflows are undocumented or stale.
- FR-M6: (TBD) assign tracks to individuals/teams.

### 8.3 AI Assistant
- FR-A1: Accept natural-language technical questions (EN/AR).
- FR-A2: Answer grounded in approved Tamakan content, with links.
- FR-A3: Indicate uncertainty and offer escalation when confidence is low.
- FR-A4: Be reachable from every surface.

---

## 9. Design System — KOC Theme + Apple HIG

The look is **Apple-clean and mature** (per direction), built on Apple Human Interface Guidelines patterns, wrapped in **KOC's corporate identity**.

### 9.1 Principles
- Apple HIG foundation: SF / system font, generous whitespace, restrained depth, soft "Liquid Glass" translucency where it adds clarity — not decoration.
- Content-first, calm, professional — an enterprise tool KOC engineers trust.
- Bilingual by design: full **Arabic/English RTL mirroring** using logical CSS properties, not Arabic text bolted onto an LTR layout.

### 9.2 KOC color story
KOC's identity centers on the **blue falcon** corporate mark (already used in the pitch deck). The palette pairs KOC corporate blue and a deep navy with a restrained sand/gold heritage accent, on Apple-neutral surfaces.

| Token | Role | Proposed value* |
|---|---|---|
| `--koc-blue` | Primary — KOC falcon blue | `#0A4A9F` |
| `--koc-navy` | Deep brand navy / headers | `#0D1B4B` |
| `--koc-sky` | Secondary accent / links | `#2B6CB0` |
| `--koc-sand` | Heritage accent (sparingly) | `#C9A84C` |
| `--surface` | App background | `#F5F7FA` |
| `--card` | Card / panel | `#FFFFFF` |
| `--text` | Primary text | `#0D1B4B` |
| `--text-muted` | Secondary text | `#64748B` |
| `--success` | Completed | `#22C55E` |
| `--warning` | In progress | `#C9A84C` / amber |
| `--locked` | Locked / disabled | `#CBD5E1` |

> **\*Confirm exact hex against KOC's official brand guidelines** before finalizing. Brandfetch/Seeklogo host KOC assets but the color specs weren't machine-readable at time of writing; the values above are a faithful starting system, not official tokens.

### 9.3 Components (HIG-aligned)
Navigation bar, segmented control (tabs), sidebar (manager), sheets/modals, toggles, list rows, progress rings, cards, badges, and data-viz components for the manager analytics. All themed with the tokens above and mirrored for RTL.

### 9.4 Motion
Subtle, purposeful transitions (progress fills, tab changes, sheet presentation). No gratuitous animation.

---

## 10. Non-Functional Requirements
- **Responsive** web (desktop-first, works on tablet).
- **Accessibility** — WCAG 2.2 AA: contrast, keyboard nav, focus states, screen-reader labels.
- **Performance** — fast first load, virtualized long lists, lazy-loaded media.
- **Bilingual/RTL** correctness across every surface.
- **Security & access control** — role-based (learner vs. manager); KOC SSO integration TBD.
- **Auditability** — progress and completion are recorded reliably (the "standardized digital record").

---

## 11. Data Model (high level)
- **User** (id, name, role, department, join date, gamification stats)
- **Track** (id, title, department, order, status)
- **Module** (id, track_id, title, duration, type, prerequisite, order)
- **Progress** (user_id, module_id, state, timestamps)
- **Resource** (id, title, type, level, tags, url)
- **AI conversation** (user_id, messages, cited content refs)

Full schema to be defined in the technical design doc.

---

## 12. Delivery Milestones
Following the pitch's project timeframe:

1. **Discovery** — prototype (done: MVP dashboard).
2. **Design** — finalize KOC + HIG design system, layouts for all three surfaces, highlight gaps.
3. **Propose** — review with higher management and concerned teams.
4. **Build** — implement surfaces + compile real workflow content into tracks.
5. **Quality Check** — QC content and data with all teams.
6. **Pilot Launch** — soft launch to a pilot group; gather feedback.
7. **Deployment** — full rollout across Engineering & Reservoir; then expand to other disciplines (future).

---

## 13. Open Questions / Assumptions
1. **Track overlaps** (§7.2) — resolve the two flagged pairs.
2. **"950 target"** — what does it refer to? (excluded until clarified)
3. **Content authoring** — is there a dedicated author role, or do managers author?
4. **AI assistant** — content source of truth, retrieval method, model/hosting, data-privacy constraints for KOC.
5. **Auth** — KOC SSO / identity integration requirements.
6. **Gamification** — keep points/streak/rank as-is, or adjust for an enterprise KOC context?
7. **Manager scope** — can managers assign tracks, or view-only in v1?

---

## 14. Future Plan (post-v1)
- Expand AI assistant capabilities.
- Roll out to other KOC departments.
- Further develop the tool to accommodate existing and future employees toward operational excellence.
