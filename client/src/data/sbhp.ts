/**
 * SBHP Validation (track t5), lesson content.
 *
 * Grounded in the KOC "Automated SBHP Proposal Workflow" training deck
 * (Jurassic Gas Field Development Studies Team, Shahad Al-Jasmi & Amine Taha,
 * 9-Jun-2026). Only the deck's material plus standard, uncontroversial SBHP
 * definitions are used, no invented KOC values (CLAUDE.md convention).
 *
 * Module 5 ("Build Your Own SBHP Proposal") has no lesson blocks: it renders
 * the interactive builder instead (see SbhpBuilder + lib/sbhp.ts).
 */

import type { IconName } from "../components/Icon";

type Tone = "blue" | "green" | "amber" | "sky" | "sand";

export type LessonBlock =
  | { kind: "p"; text: string }
  | { kind: "h"; text: string }
  | { kind: "callout"; tone: Tone; icon: IconName; title?: string; text: string }
  | { kind: "cards"; items: { icon: IconName; title: string; text: string }[] }
  | { kind: "steps"; items: { title: string; text: string }[] }
  | { kind: "checklist"; items: { title: string; text: string }[] }
  | { kind: "codepath"; label: string; path: string };

export interface Lesson {
  /** Short one-line framing shown under the module title. */
  summary: string;
  blocks: LessonBlock[];
}

/** Keyed by module id (t5-m1 … t5-m4). t5-m5 is the interactive builder. */
export const SBHP_LESSONS: Record<string, Lesson> = {
  "t5-m1": {
    summary: "Why the team automates SBHP proposals, and what an SBHP survey is.",
    blocks: [
      {
        kind: "p",
        text: "A **Static Bottom-Hole Pressure (SBHP)** survey measures reservoir pressure by running a gauge downhole and pausing at set depths to build a pressure *gradient*, then correcting the reading to a common *datum* so wells can be compared like-for-like. Planning that run, where the gauge stops, for how long, is the **SBHP proposal**.",
      },
      {
        kind: "p",
        text: "The Jurassic Gas Field Development Studies team plans these proposals with an **automated generator**. Instead of hand-building every schedule, you enter a well name and the tool assembles the proposal from live well data. **However**, this doesn't mean quality checking is not needed.",
      },
      { kind: "h", text: "Why we automate" },
      {
        kind: "cards",
        items: [
          {
            icon: "layers",
            title: "Standardization",
            text: "Standardize the format and structure of SBHP proposals across the whole team.",
          },
          {
            icon: "refresh",
            title: "Efficiency",
            text: "Reduce the manual work and time required to prepare each SBHP proposal.",
          },
          {
            icon: "shield",
            title: "Quality",
            text: "Minimize errors by sourcing all well data directly from the system database.",
          },
        ],
      },
      {
        kind: "callout",
        tone: "blue",
        icon: "check-circle",
        title: "The goal",
        text: "One consistent proposal, built from a single trusted data source, so every engineer's SBHP plan looks and reads the same, and the numbers are right the first time.",
      },
    ],
  },

  "t5-m2": {
    summary: "The three data sheets that must be current before you generate a proposal.",
    blocks: [
      {
        kind: "p",
        text: "Before initiating your SBHP proposal, make sure the following sheets are **available and up to date** for your assigned well. The generator is only as good as the data behind it.",
      },
      {
        kind: "checklist",
        items: [
          {
            title: "Perforation table",
            text: "Confirm the perforation interval data is available and reflects the current, latest well status, including the top and bottom of the current open perfs (MD ft). Accurate perforation data is essential so the gauge is positioned correctly within the open zones.",
          },
          {
            title: "Deviation survey",
            text: "Confirm a deviation survey is available including MD, TVD and inclination angle, reflecting the latest wellbore trajectory (check for any sidetracks). This is critical for accurate depth correction and MD→TVD conversion for gauge placement.",
          },
          {
            title: "Well schematic",
            text: "Confirm the well schematic is current. It's required to verify the completion type and identify the open perforations before job planning.",
          },
        ],
      },
      {
        kind: "callout",
        tone: "amber",
        icon: "alert",
        title: "Before you submit",
        text: "Any updates from recent workovers or plugbacks must be reflected in these sheets **before** the proposal is submitted. Stale perforation or trajectory data puts the gauge in the wrong place.",
      },
    ],
  },

  "t5-m3": {
    summary: "Running the automated proposal generator, step by step.",
    blocks: [
      {
        kind: "p",
        text: "Once your input sheets are current, generating the proposal is four steps. The generator lives on the shared drive:",
      },
      {
        kind: "codepath",
        label: "SBHP Proposal Automation",
        path: "Z:\\2. GFDS\\5. Unit-3 RE Management_Monitoring\\Apps\\SBHP Proposal Automation",
      },
      {
        kind: "steps",
        items: [
          {
            title: "Open the generator",
            text: "Open the SBHP proposal generator from the shared drive linked above.",
          },
          {
            title: "Type your well name",
            text: "Type your well name in the highlighted cell, all in CAPITAL LETTERS. If the well is a sidetrack (ST), enter only the numeric well number without the ST, the tool automatically includes the last ST recorded for the well.",
          },
          {
            title: "Generate",
            text: "Click Generate SBHP proposal. A new sheet pops up with the created proposal, perforation intervals and the full gauge-stop schedule.",
          },
          {
            title: "Verify & save",
            text: "Double-check every displayed value matches your assigned well. The file auto-saves in the generator's folder; drag it into your personal folder.",
          },
        ],
      },
      {
        kind: "callout",
        tone: "sky",
        icon: "gauge",
        title: "What the tool does under the hood",
        text: "It reads the Well Summary (perforations, formation, completion type, inclination) and the Deviation Survey, then builds the stop schedule, the lubricator station, descent gradient stops converted MD→TVD, and a measurement stop at each open zone. You'll do exactly this by hand in the final module.",
      },
    ],
  },

  "t5-m4": {
    summary: "How gauge stops are placed, and how the TVD diff threshold controls them.",
    blocks: [
      { kind: "h", text: "How the stops are built" },
      {
        kind: "cards",
        items: [
          {
            icon: "target",
            title: "Lubricator",
            text: "The surface rig-up station, always the first stop on every proposal.",
          },
          {
            icon: "trend-up",
            title: "Gradient stops",
            text: "Stations on the way down (a regular MD grid) to build the pressure gradient, each converted MD→TVD from the survey.",
          },
          {
            icon: "gauge",
            title: "Mid-perf stations",
            text: "A reading opposite each open interval, with a long final soak at the deepest zone, the SBHP datum point.",
          },
        ],
      },
      { kind: "h", text: "The TVD diff threshold" },
      {
        kind: "callout",
        tone: "sand",
        icon: "alert",
        title: "TVD diff threshold",
        text: "This is the threshold at which stops are made with respect to TVD. If the threshold is 50, any two stops less than 50 ft apart in TVD are cancelled, you can't resolve a pressure gradient across stations that close in true vertical depth. Adjust this number to suit your proposal before clicking generate.",
      },
      {
        kind: "p",
        text: "The threshold matters most in **deviated wells**: intervals 100+ ft apart in measured depth can be only a few feet apart in TVD, so the tool collapses them into a single station instead of wasting rig time. In a near-vertical well the same zones stay well separated and each keeps its own stop.",
      },
      {
        kind: "callout",
        tone: "green",
        icon: "check-circle",
        title: "Correcting to datum",
        text: "The deepest station gets the long soak, this is the reading corrected to the field datum so this well's pressure can be compared against every other well in the field.",
      },
    ],
  },
};

/** Framing text for the builder capstone (module 5). */
export const BUILDER_INTRO =
  "You've seen the objectives, the data requirements, the four-step run, and how stops are placed. Now build a proposal yourself: pick a well, confirm its data, tune the TVD threshold, and generate the gauge-stop schedule. What comes out is the exact template your proposals should follow.";
