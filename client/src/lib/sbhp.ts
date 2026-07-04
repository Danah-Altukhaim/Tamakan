/**
 * SBHP proposal engine, the logic behind the "Build Your Own SBHP Proposal"
 * capstone (track t5, module 5). Mirrors the KOC "Automated SBHP Proposal
 * Workflow" generator: it reads a well's perforations + deviation survey and
 * produces the gauge-stop schedule, applying a TVD-difference threshold to
 * collapse stops that are too close in true vertical depth to resolve.
 *
 * Content grounded in the "Automated SBHP Proposal Workflow" training deck
 * (Jurassic Gas Field Development Studies Team, 9-Jun-2026).
 */

export interface Perforation {
  /** Measured-depth top of the open interval (ft MD). */
  top: number;
  /** Measured-depth bottom of the open interval (ft MD). */
  bottom: number;
  zone: string;
  status: string;
}

export interface SurveyPoint {
  md: number;
  tvd: number;
}

export interface Well {
  name: string;
  /** Last sidetrack recorded for the well, appended automatically by the tool. */
  sidetrack?: string;
  formation: string;
  completionType: string;
  /** Max inclination (deg), 0 for a vertical well. */
  inclination: number;
  perforations: Perforation[];
  deviationSurvey: SurveyPoint[];
}

export type StopKind = "lubricator" | "gradient" | "midperf";

export interface Stop {
  n: number;
  label: string;
  md: number | null;
  tvd: number | null;
  duration: number;
  reference: string;
  kind: StopKind;
}

export interface CancelledStop {
  md: number;
  tvd: number;
  /** TVD gap to the previous kept stop, the reason it was cancelled. */
  gap: number;
}

export interface Proposal {
  well: Well;
  stops: Stop[];
  cancelled: CancelledStop[];
  totalDuration: number;
  tvdThreshold: number;
  stepFt: number;
}

/** Linear interpolation of TVD at a given MD from the deviation survey. */
export function tvdAt(survey: SurveyPoint[], md: number): number {
  const pts = [...survey].sort((a, b) => a.md - b.md);
  if (md <= pts[0].md) return pts[0].tvd;
  if (md >= pts[pts.length - 1].md) return pts[pts.length - 1].tvd;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    if (md >= a.md && md <= b.md) {
      const f = (md - a.md) / (b.md - a.md);
      return a.tvd + f * (b.tvd - a.tvd);
    }
  }
  return pts[pts.length - 1].tvd;
}

const round = (n: number) => Math.round(n);
export const midPerf = (p: Perforation) => (p.top + p.bottom) / 2;

/**
 * Generate the SBHP gauge-stop schedule for a well.
 *
 * 1. Lubricator, surface rig-up station.
 * 2. Descent gradient stops every `stepFt` MD down to the shallowest perf,
 *    plus one approach stop just above the perforations.
 * 3. A measurement stop at each perforation mid-point.
 * 4. TVD threshold pass, walk top→bottom and cancel any stop whose TVD is
 *    within `tvdThreshold` ft of the last kept stop (the lubricator and the
 *    deepest station, the final SBHP soak, are always kept).
 */
export function generateProposal(
  well: Well,
  tvdThreshold = 50,
  stepFt = 2000,
): Proposal {
  const survey = well.deviationSurvey;
  const perfs = [...well.perforations].sort((a, b) => a.top - b.top);
  const topPerf = perfs[0].top;
  const mids = [...new Set(perfs.map(midPerf))].sort((a, b) => a - b);
  const deepMid = mids[mids.length - 1];

  type Raw = { md: number; tvd: number; kind: StopKind };
  const raw: Raw[] = [];

  // Descent gradient stops on the MD grid, above the shallowest perforation.
  for (let md = stepFt; md < topPerf; md += stepFt) {
    raw.push({ md, tvd: round(tvdAt(survey, md)), kind: "gradient" });
  }
  // Approach stop just above the perfs (nearest 500 ft), if it adds a station.
  const approach = Math.floor(topPerf / 500) * 500;
  if (approach > (raw[raw.length - 1]?.md ?? 0) && approach < topPerf) {
    raw.push({ md: approach, tvd: round(tvdAt(survey, approach)), kind: "gradient" });
  }
  // A measurement stop at each perforation mid-point.
  for (const md of mids) {
    raw.push({ md, tvd: round(tvdAt(survey, md)), kind: "midperf" });
  }

  // TVD threshold pass.
  const keptRaw: Raw[] = [];
  const cancelled: CancelledStop[] = [];
  let lastTvd: number | null = null;
  for (const s of raw) {
    const isDeepest = s.kind === "midperf" && s.md === deepMid;
    if (lastTvd === null || Math.abs(s.tvd - lastTvd) >= tvdThreshold || isDeepest) {
      keptRaw.push(s);
      lastTvd = s.tvd;
    } else {
      cancelled.push({ md: s.md, tvd: s.tvd, gap: Math.abs(s.tvd - lastTvd) });
    }
  }

  const deepestKeptMd = Math.max(...keptRaw.map((s) => s.md));
  const stops: Stop[] = [];
  // Lubricator always leads.
  stops.push({
    n: 1,
    label: "Lubricator",
    md: null,
    tvd: null,
    duration: 5,
    reference: "Rig-up",
    kind: "lubricator",
  });
  keptRaw.forEach((s) => {
    const isFinal = s.md === deepestKeptMd;
    stops.push({
      n: stops.length + 1,
      label: `${s.md}`,
      md: s.md,
      tvd: s.tvd,
      duration: isFinal ? 90 : 5,
      reference: isFinal
        ? "Final gauge, SBHP"
        : s.kind === "midperf"
          ? "Mid Perf"
          : "Gradient",
      kind: s.kind,
    });
  });

  const totalDuration = stops.reduce((t, s) => t + s.duration, 0);
  return { well, stops, cancelled, totalDuration, tvdThreshold, stepFt };
}

/**
 * Sample wells. In production the generator pulls Well Summary + Deviation
 * Survey straight from the system database by well name (deck §Objectives -
 * "sourcing all well data directly from a system database"). These stand in for
 * that lookup so the workflow can be practised end-to-end.
 */
export const WELLS: Well[] = [
  {
    // Deck worked example (SA-0236), a strongly deviated Jurassic gas producer.
    name: "SA-0236",
    sidetrack: "ST-2",
    formation: "MM",
    completionType: '3 1/2" tbg',
    inclination: 78,
    perforations: [
      { top: 14988, bottom: 15072, zone: "F26 / F27", status: "Current Open" },
      { top: 15086, bottom: 15190, zone: "F25 / F26", status: "Current Open" },
      { top: 15216, bottom: 15296, zone: "F22 / F23", status: "Current Open" },
      { top: 15256, bottom: 15296, zone: "F22 / F23", status: "Current Open" },
    ],
    deviationSurvey: [
      { md: 0, tvd: 0 },
      { md: 2000, tvd: 2000 },
      { md: 4000, tvd: 4000 },
      { md: 6000, tvd: 6000 },
      { md: 8000, tvd: 8000 },
      { md: 10000, tvd: 9999 },
      { md: 12000, tvd: 11999 },
      { md: 13000, tvd: 12760 },
      { md: 14000, tvd: 13260 },
      { md: 14500, tvd: 13469 },
      { md: 15100, tvd: 13472 },
      { md: 15300, tvd: 13483 },
      { md: 16000, tvd: 13490 },
    ],
  },
  {
    // Near-vertical well, three well-separated zones each keep their station.
    name: "BG-0112",
    formation: "Marrat (MR)",
    completionType: '4 1/2" tbg',
    inclination: 3,
    perforations: [
      { top: 12450, bottom: 12480, zone: "MR-1", status: "Current Open" },
      { top: 12610, bottom: 12660, zone: "MR-2", status: "Current Open" },
      { top: 12820, bottom: 12880, zone: "MR-3", status: "Current Open" },
    ],
    deviationSurvey: [
      { md: 0, tvd: 0 },
      { md: 4000, tvd: 3999 },
      { md: 8000, tvd: 7998 },
      { md: 12000, tvd: 11994 },
      { md: 13000, tvd: 12992 },
    ],
  },
  {
    // Moderately deviated, single long open interval.
    name: "NL-0207",
    sidetrack: "ST-1",
    formation: "Najmah (NJ)",
    completionType: '3 1/2" tbg',
    inclination: 42,
    perforations: [
      { top: 13120, bottom: 13360, zone: "NJ-A", status: "Current Open" },
    ],
    deviationSurvey: [
      { md: 0, tvd: 0 },
      { md: 4000, tvd: 4000 },
      { md: 8000, tvd: 7995 },
      { md: 11000, tvd: 10850 },
      { md: 12000, tvd: 11640 },
      { md: 13000, tvd: 12330 },
      { md: 13500, tvd: 12610 },
    ],
  },
];
