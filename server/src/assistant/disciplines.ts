import type { ResourceDiscipline } from "../data/types.js";

/**
 * Nassour's discipline desks (agentic router, PRD §6.3).
 *
 * Nassour is the orchestrator: one classifier decides which discipline a
 * question belongs to, then the answer is produced with that desk's specialist
 * focus and a catalog scoped to that discipline. The user-facing identity stays
 * "Nassour" throughout — the desks are Nassour's internal expertise, not
 * separate personas.
 *
 * This keeps the router to a single answering LLM call (no extra classify call):
 * routing is deterministic, driven by (1) which approved tracks/resources the
 * question retrieves and (2) discipline keyword hits.
 */

export interface DisciplineAgent {
  id: ResourceDiscipline;
  /** Human label for the UI badge, e.g. "Reservoir Engineering". */
  name: string;
  /**
   * Specialist focus injected into Nassour's system prompt so the answer reasons
   * from this desk's depth. Identity ("I am Nassour") is unchanged by this.
   */
  focus: string;
  /** Lowercase terms that pull a question toward this desk during routing. */
  keywords: string[];
}

export const DISCIPLINES: DisciplineAgent[] = [
  {
    id: "reservoir-engineering",
    name: "Reservoir Engineering",
    focus:
      "You are answering from the RESERVOIR ENGINEERING desk. Your depth is in " +
      "reservoir characterization and dynamic behaviour: reservoir simulation " +
      "(Intersect/IX, numerical methods, gridding & upscaling, history matching), " +
      "material balance, PVT & fluid properties, pressure transient analysis (PTA) " +
      "and well-test interpretation (buildup/drawdown, flow regimes, derivatives), " +
      "decline curve analysis, and reservoir pressure concepts (SBHP as a " +
      "reservoir-pressure datum). Reason like a reservoir engineer.",
    keywords: [
      // NB: bare "reservoir" is deliberately omitted — it appears in the
      // department name and in geology/petrophysics questions, so it's a poor
      // discriminator. The specific terms below identify this desk.
      "simulation", "simulate", "intersect", "ix", "material balance",
      "pvt", "fluid properties", "decline", "pta", "pressure transient", "well test",
      "buildup", "drawdown", "flow regime", "derivative", "history matching", "grid",
      "gridding", "upscaling", "solver", "convergence", "aquifer", "recovery factor",
      "material-balance",
    ],
  },
  {
    id: "petroleum-engineering",
    name: "Petroleum Engineering",
    focus:
      "You are answering from the PETROLEUM / PRODUCTION ENGINEERING desk. Your " +
      "depth is in the production system and well performance: nodal / production " +
      "systems analysis (PIPESIM), multiphase flow correlations and network " +
      "modelling, well completions and sand control, perforation strategy, " +
      "stimulation (acidizing, hydraulic fracturing), production surveillance " +
      "(SBHP & PGOR validation, GOR allocation & metering, anomaly detection), " +
      "artificial lift, and field operations & safety. Reason like a " +
      "production/petroleum engineer.",
    keywords: [
      "pipesim", "nodal", "multiphase", "network model", "completion", "perforation",
      "sand control", "stimulation", "acidizing", "acid", "frac", "fracturing",
      "hydraulic fracturing", "production", "gor", "pgor", "allocation", "metering",
      "anomaly", "artificial lift", "gas lift", "esp", "surveillance", "tubing",
      "wellbore", "liquid loading", "field operation", "safety", "permit to work",
      "sbhp", "static bottomhole", "bottomhole pressure",
    ],
  },
  {
    id: "geophysics",
    name: "Geophysics",
    focus:
      "You are answering from the GEOPHYSICS desk. Your depth is in seismic " +
      "acquisition, processing and interpretation, velocity modelling, " +
      "seismic-based pore-pressure prediction (pre-drill), and geophysical inputs " +
      "to the static earth model. Reason like a geophysicist.",
    keywords: [
      "seismic", "velocity", "migration", "amplitude", "avo", "geophysic",
      "acquisition", "pre-drill", "predrill", "time-depth", "inversion", "reflection",
    ],
  },
  {
    id: "petrophysics",
    name: "Petrophysics",
    focus:
      "You are answering from the PETROPHYSICS desk. Your depth is in well-log " +
      "acquisition and interpretation, formation evaluation, porosity / " +
      "permeability / saturation determination, log-based pore-pressure indicators, " +
      "and rock/fluid properties from logs and core. Reason like a petrophysicist.",
    keywords: [
      "log", "logging", "porosity", "permeability", "saturation", "formation evaluation",
      "resistivity", "gamma ray", "core", "cutoff", "petrophysic", "sonic", "density log",
      "neutron", "net pay", "archie",
    ],
  },
  {
    id: "geology",
    name: "Geology",
    focus:
      "You are answering from the GEOLOGY desk. Your depth is in the structural " +
      "and stratigraphic framework, depositional environments, reservoir " +
      "architecture and correlation, geomechanics and pore-pressure geology, and " +
      "the static earth model. Reason like a geologist.",
    keywords: [
      "geology", "geological", "structural", "stratigraph", "depositional", "facies",
      "correlation", "geomechanic", "pore pressure", "fault", "formation top",
      "earth model", "lithology", "sedimentary", "unconformity",
    ],
  },
];

const BY_ID = new Map(DISCIPLINES.map((d) => [d.id, d]));

export function agentFor(id: ResourceDiscipline): DisciplineAgent | undefined {
  return BY_ID.get(id);
}

/**
 * Score how strongly a tokenized question matches each desk's keywords.
 * Returns a map of discipline → keyword score (0 if none).
 */
export function keywordScores(terms: string[]): Map<ResourceDiscipline, number> {
  const joined = terms.join(" ");
  const scores = new Map<ResourceDiscipline, number>();
  for (const d of DISCIPLINES) {
    let s = 0;
    for (const kw of d.keywords) {
      // Multi-word keywords match against the joined string; single words against tokens.
      if (kw.includes(" ")) {
        if (joined.includes(kw)) s += 2;
      } else if (terms.includes(kw)) {
        s += 1;
      }
    }
    if (s > 0) scores.set(d.id, s);
  }
  return scores;
}
