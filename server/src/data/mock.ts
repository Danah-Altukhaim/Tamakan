import type {
  Track,
  User,
  Resource,
  ProgressRecord,
  DayActivity,
  StoredModuleState,
  ResourceDiscipline,
} from "./types.js";

/**
 * Track → discipline desk (drives Nassour's assistant routing).
 * ⚠️ REVIEW: proposed mapping — confirm against KOC's discipline boundaries.
 * Only reservoir- and petroleum-engineering are content-rich today; the other
 * three desks answer from general domain knowledge until KOC content exists.
 */
const TRACK_DISCIPLINE: Record<string, ResourceDiscipline> = {
  t1: "reservoir-engineering", // Reservoir Simulation Fundamentals
  t2: "reservoir-engineering", // Intersect (IX) Simulation Tool
  t3: "reservoir-engineering", // Well Test Analysis
  t4: "petroleum-engineering", // Field Operations & Safety
  t5: "petroleum-engineering", // SBHP Validation (production surveillance)
  t6: "petroleum-engineering", // PGOR Validation
  t7: "reservoir-engineering", // PTA Analysis
  t8: "petroleum-engineering", // PIPESIM Model (nodal / production systems)
  t9: "reservoir-engineering", // Simulation Fundamentals
  t10: "reservoir-engineering", // STPF Fundamentals (⚠️ acronym unclear)
  t11: "petroleum-engineering", // Stimulation Program
  t12: "petroleum-engineering", // Completion Program
  t13: "reservoir-engineering", // SPTR Workframe (⚠️ acronym unclear)
  t14: "geophysics", // Pore Pressure Prediction (⚠️ straddles geophys/petrophys/geology)
};

/**
 * Mock content for Engineering & Reservoir (PRD §7.2, 14 tracks).
 * ⚠️ Content is placeholder for the demo; real workflows compiled in "Build" phase.
 * Two overlap pairs are preserved (not merged) per PRD §7.2.
 */

// Small helper to keep module authoring terse.
let mSeq = 0;
function mod(
  trackId: string,
  title: string,
  duration: number,
  type: "video" | "reading" | "interactive",
  order: number,
  prerequisite?: string,
) {
  mSeq += 1;
  const id = `${trackId}-m${order}`;
  return { id, trackId, title, duration, type, order, prerequisite };
}

/** Build a linear track: each module requires the previous one (FR-L5 sequencing). */
function linear(
  id: string,
  title: string,
  icon: string,
  order: number,
  status: Track["status"],
  mods: Array<[string, number, "video" | "reading" | "interactive"]>,
  overlapsWith?: string,
): Track {
  const modules = mods.map(([t, dur, type], i) =>
    mod(id, t, dur, type, i + 1, i === 0 ? undefined : `${id}-m${i}`),
  );
  return {
    id,
    title,
    department: "Engineering & Reservoir",
    icon,
    order,
    status,
    discipline: TRACK_DISCIPLINE[id] ?? "reservoir-engineering",
    overlapsWith,
    modules,
  };
}

export const tracks: Track[] = [
  linear("t1", "Reservoir Simulation Fundamentals", "reservoir", 1, "current", [
    ["Introduction to Reservoir Engineering", 45, "video"],
    ["Fluid Properties & PVT Analysis", 60, "reading"],
    ["Reservoir Pressure Concepts", 50, "video"],
    ["Material Balance Equations", 75, "interactive"],
    ["Decline Curve Analysis", 55, "video"],
  ], "t9"),

  linear("t2", "Intersect (IX) Simulation Tool", "gear", 2, "current", [
    ["IX Interface & Navigation", 30, "video"],
    ["Building Your First Model", 90, "interactive"],
    ["Grid Design & Upscaling", 70, "reading"],
    ["Well Control & Constraints", 60, "video"],
    ["Running & Debugging Simulations", 80, "interactive"],
  ]),

  linear("t3", "Well Test Analysis", "chart-bar", 3, "current", [
    ["Well Test Fundamentals", 55, "video"],
    ["Buildup & Drawdown Tests", 70, "reading"],
    ["Interpretation Methods", 80, "interactive"],
    ["Data Quality & Validation", 45, "video"],
  ], "t7"),

  linear("t4", "Field Operations & Safety", "shield", 4, "current", [
    ["Site Safety Protocols", 40, "video"],
    ["Emergency Response Procedures", 50, "reading"],
    ["Permit to Work System", 35, "interactive"],
    ["Field Reporting Standards", 30, "video"],
  ]),

  linear("t5", "SBHP Validation", "gauge", 5, "current", [
    ["SBHP Proposal Objectives", 20, "reading"],
    ["Proposal Data Requirements", 25, "reading"],
    ["Running the Automated Generator", 30, "interactive"],
    ["Gradient Stops & TVD Threshold", 15, "reading"],
    ["Build Your Own SBHP Proposal", 45, "interactive"],
  ]),

  linear("t6", "PGOR Validation", "flask", 6, "review-due", [
    ["Producing GOR Concepts", 40, "reading"],
    ["Allocation & Metering", 65, "video"],
    ["Anomaly Detection", 55, "interactive"],
    ["Validation Checklist", 35, "reading"],
  ]),

  linear("t7", "PTA Analysis", "magnifier", 7, "current", [
    ["Pressure Transient Theory", 55, "video"],
    ["Flow Regimes & Derivatives", 75, "interactive"],
    ["Model Recognition", 70, "reading"],
    ["Case Studies", 60, "video"],
  ], "t3"),

  linear("t8", "PIPESIM Model", "pipe", 8, "current", [
    ["PIPESIM Environment", 35, "video"],
    ["Multiphase Flow Correlations", 70, "reading"],
    ["Nodal Analysis", 80, "interactive"],
    ["Network Modeling", 75, "video"],
  ]),

  linear("t9", "Simulation Fundamentals", "grid", 9, "current", [
    ["Numerical Methods Basics", 50, "reading"],
    ["Discretization & Grids", 65, "interactive"],
    ["Solvers & Convergence", 70, "video"],
  ], "t1"),

  linear("t10", "STPF Fundamentals", "ruler", 10, "current", [
    ["STPF Overview", 40, "reading"],
    ["Data Preparation", 60, "interactive"],
    ["Workflow Execution", 65, "video"],
  ]),

  linear("t11", "Stimulation Program", "spark", 11, "current", [
    ["Stimulation Candidates", 45, "reading"],
    ["Acidizing Design", 70, "interactive"],
    ["Hydraulic Fracturing Basics", 80, "video"],
    ["Post-Job Evaluation", 50, "reading"],
  ]),

  linear("t12", "Completion Program", "wrench", 12, "current", [
    ["Completion Types", 45, "reading"],
    ["Sand Control", 65, "video"],
    ["Perforation Strategy", 60, "interactive"],
    ["Completion Reporting", 35, "reading"],
  ]),

  linear("t13", "SPTR Workframe", "layers", 13, "undocumented", [
    ["SPTR Introduction", 40, "reading"],
    ["Workframe Setup", 60, "interactive"],
    ["Reporting Templates", 45, "video"],
  ]),

  linear("t14", "Pore Pressure Prediction", "globe", 14, "review-due", [
    ["Pore Pressure Concepts", 50, "reading"],
    ["Seismic & Log Methods", 75, "interactive"],
    ["Predrill Prediction", 70, "video"],
    ["Real-time Monitoring", 55, "interactive"],
  ]),
];

export const users: User[] = [
  {
    id: "u1",
    name: "Shahad Aljasmi",
    initials: "SA",
    role: "learner",
    jobTitle: "Reservoir Engineer",
    department: "Engineering & Reservoir",
    joined: "2024-01-15",
    streak: 12,
    points: 2340,
    rank: "Advanced Learner",
    lastActive: "2026-07-02",
    assignedTrackIds: ["t1", "t2", "t3", "t4", "t5", "t7", "t14"],
  },
  {
    id: "u2",
    name: "Faisal Al-Otaibi",
    initials: "FO",
    role: "learner",
    jobTitle: "Petroleum Engineer",
    department: "Engineering & Reservoir",
    joined: "2025-09-01",
    streak: 4,
    points: 860,
    rank: "New Hire",
    lastActive: "2026-07-01",
    assignedTrackIds: ["t1", "t2", "t4", "t8", "t9"],
  },
  {
    id: "u3",
    name: "Noura Al-Sabah",
    initials: "NS",
    role: "learner",
    jobTitle: "Senior Reservoir Engineer",
    department: "Engineering & Reservoir",
    joined: "2019-03-10",
    streak: 21,
    points: 5120,
    rank: "Expert",
    lastActive: "2026-07-02",
    assignedTrackIds: ["t1", "t2", "t3", "t5", "t6", "t7", "t11", "t12"],
  },
  {
    id: "u4",
    name: "Yousef Al-Ajmi",
    initials: "YA",
    role: "learner",
    jobTitle: "Reservoir Engineer",
    department: "Engineering & Reservoir",
    joined: "2023-06-20",
    streak: 0,
    points: 1490,
    rank: "Intermediate Learner",
    lastActive: "2026-06-18",
    assignedTrackIds: ["t1", "t3", "t4", "t8", "t14"],
  },
  {
    id: "u5",
    name: "Dana Al-Mutairi",
    initials: "DM",
    role: "learner",
    jobTitle: "Production Engineer",
    department: "Engineering & Reservoir",
    joined: "2025-02-01",
    streak: 7,
    points: 1120,
    rank: "New Hire",
    lastActive: "2026-06-30",
    assignedTrackIds: ["t4", "t8", "t10", "t11", "t12"],
  },
  {
    id: "u6",
    name: "Abdullah Al-Hajri",
    initials: "AH",
    role: "learner",
    jobTitle: "Reservoir Engineer",
    department: "Engineering & Reservoir",
    joined: "2022-11-05",
    streak: 3,
    points: 2010,
    rank: "Advanced Learner",
    lastActive: "2026-06-28",
    assignedTrackIds: ["t1", "t2", "t5", "t6", "t7", "t14"],
  },
  {
    id: "u7",
    name: "Maryam Al-Kandari",
    initials: "MK",
    role: "learner",
    jobTitle: "Petroleum Engineer",
    department: "Engineering & Reservoir",
    joined: "2024-08-12",
    streak: 9,
    points: 1760,
    rank: "Intermediate Learner",
    lastActive: "2026-07-01",
    assignedTrackIds: ["t1", "t3", "t4", "t9", "t10", "t13"],
  },
  {
    id: "u8",
    name: "Khaled Al-Fadhli",
    initials: "KF",
    role: "learner",
    jobTitle: "Junior Reservoir Engineer",
    department: "Engineering & Reservoir",
    joined: "2026-01-20",
    streak: 2,
    points: 380,
    rank: "New Hire",
    lastActive: "2026-06-25",
    assignedTrackIds: ["t1", "t2", "t4"],
  },
  {
    id: "m1",
    name: "Mohammad Albahar",
    initials: "MA",
    role: "manager",
    jobTitle: "Manager",
    department: "Engineering & Reservoir",
    joined: "2015-04-01",
    streak: 0,
    points: 0,
    rank: "Manager",
    lastActive: "2026-07-02",
    assignedTrackIds: [],
  },
];

export const weeklyActivity: DayActivity[] = [
  { dayIndex: 0, minutes: 0 },
  { dayIndex: 1, minutes: 45 },
  { dayIndex: 2, minutes: 90 },
  { dayIndex: 3, minutes: 30 },
  { dayIndex: 4, minutes: 75 },
  { dayIndex: 5, minutes: 0 },
  { dayIndex: 6, minutes: 60 },
];

export const resources: Resource[] = [
  {
    id: "r1",
    title: "Reservoir Simulation Handbook",
    type: "pdf",
    level: "reference",
    team: "studies-team",
    discipline: "reservoir-engineering",
    tags: ["simulation", "reference"],
    description: "Comprehensive reference for simulation techniques used in operations.",
    url: "#",
    relatedTrackId: "t1",
  },
  {
    id: "r2",
    title: "IX Quick Start Guide",
    type: "video-series",
    level: "beginner",
    team: "integration-excellence",
    discipline: "reservoir-engineering",
    tags: ["intersect", "getting-started"],
    description: "3-part video series to get you up and running in Intersect.",
    url: "#",
    relatedTrackId: "t2",
  },
  {
    id: "r3",
    title: "SBHP Survey Workflow",
    type: "interactive",
    level: "intermediate",
    team: "operation",
    discipline: "petroleum-engineering",
    tags: ["sbhp", "workflow"],
    description: "Step-by-step guided walkthrough of the SBHP proposal system.",
    url: "#",
    relatedTrackId: "t5",
  },
  {
    id: "r4",
    title: "Material Balance Deep Dive",
    type: "recorded-lecture",
    level: "intermediate",
    team: "studies-team",
    discipline: "reservoir-engineering",
    tags: ["material-balance", "lecture"],
    description: "2-hour lecture on material balance from the engineering team.",
    url: "#",
    relatedTrackId: "t1",
  },
  {
    id: "r5",
    title: "History Matching Best Practices",
    type: "pdf",
    level: "advanced",
    team: "integration-excellence",
    discipline: "reservoir-engineering",
    tags: ["history-matching", "guidelines"],
    description: "Internal guidelines for history matching workflows.",
    url: "#",
    relatedTrackId: "t2",
  },
  {
    id: "r6",
    title: "Production Forecasting Methods",
    type: "interactive",
    level: "advanced",
    team: "production",
    discipline: "petroleum-engineering",
    tags: ["forecasting", "decline-curve"],
    description: "Hands-on exercises for decline curve and simulation-based forecasting.",
    url: "#",
    relatedTrackId: "t1",
  },
  {
    id: "r7",
    title: "PTA Interpretation Atlas",
    type: "pdf",
    level: "advanced",
    team: "studies-team",
    discipline: "petrophysics",
    tags: ["pta", "well-test", "derivatives"],
    description: "Diagnostic plots and model signatures for pressure transient analysis.",
    url: "#",
    relatedTrackId: "t7",
  },
  {
    id: "r8",
    title: "Field Safety Induction",
    type: "video-series",
    level: "beginner",
    team: "operation",
    discipline: "geology",
    tags: ["safety", "field-operations"],
    description: "Mandatory safety induction for new field engineers.",
    url: "#",
    relatedTrackId: "t4",
  },
];

/**
 * Seeded progress. Encoded compactly as [userId, trackId, completedCount, inProgress?]
 *, the first N modules of a track are completed, and optionally the next is in-progress.
 */
const progressSeed: Array<[string, string, number, boolean?]> = [
  // Shahad (u1), the demo learner, mirrors MVP-ish state
  ["u1", "t1", 3, true],
  ["u1", "t2", 2, true],
  ["u1", "t3", 1, false],
  ["u1", "t4", 4, false],
  ["u1", "t5", 1, true],
  ["u1", "t7", 0, true],
  // Faisal (u2), new hire, early
  ["u2", "t1", 2, true],
  ["u2", "t4", 4, false],
  ["u2", "t2", 1, false],
  // Noura (u3), expert, mostly done
  ["u3", "t1", 5, false],
  ["u3", "t2", 5, false],
  ["u3", "t3", 4, false],
  ["u3", "t5", 4, false],
  ["u3", "t7", 3, true],
  ["u3", "t11", 2, true],
  ["u3", "t12", 4, false],
  // Yousef (u4), at-risk, stale
  ["u4", "t1", 1, false],
  ["u4", "t3", 1, true],
  // Dana (u5)
  ["u5", "t4", 4, false],
  ["u5", "t8", 2, true],
  ["u5", "t10", 1, false],
  // Abdullah (u6)
  ["u6", "t1", 4, false],
  ["u6", "t5", 2, true],
  ["u6", "t7", 2, false],
  // Maryam (u7)
  ["u7", "t1", 3, false],
  ["u7", "t4", 4, false],
  ["u7", "t9", 1, true],
  ["u7", "t10", 3, false],
  // Khaled (u8), brand new
  ["u8", "t1", 1, true],
];

export function seedProgress(): ProgressRecord[] {
  const records: ProgressRecord[] = [];
  const stamp = "2026-06-30T09:00:00.000Z";
  for (const [userId, trackId, done, inProgress] of progressSeed) {
    const track = tracks.find((t) => t.id === trackId);
    if (!track) continue;
    const ordered = [...track.modules].sort((a, b) => a.order - b.order);
    ordered.forEach((m, i) => {
      let state: StoredModuleState | null = null;
      if (i < done) state = "completed";
      else if (i === done && inProgress) state = "in-progress";
      if (state) {
        records.push({ userId, moduleId: m.id, state, updatedAt: stamp });
      }
    });
  }
  return records;
}
