import type { Track, User, ProgressRecord } from "../data/types";
import { deriveTrackProgress } from "./progress";
import {
  COMPETENCIES,
  TRACK_COMPETENCY,
  roleProfile,
  WORKFORCE,
  QUALIFIED,
  RETIRE_SOON_YEARS,
  EXPIRING_DAYS,
  TODAY,
  REQUIRED_CERTS,
  CERTIFICATIONS,
  CERT_RECORDS,
  type Competency,
} from "../data/workforce";

/**
 * Derivation engine for the workforce-intelligence surfaces. Every figure here
 * is computed from real progress + the reference maps in data/workforce.ts -
 * nothing is hard-coded per screen.
 */

const learnersOf = (users: User[]) => users.filter((u) => u.role === "learner");

function recordsFor(userId: string, allProgress: ProgressRecord[]) {
  return allProgress.filter((p) => p.userId === userId);
}

/** Years until an engineer's expected retirement (large number if unknown). */
export function yearsToRetirement(userId: string): number {
  const rec = WORKFORCE[userId];
  if (!rec) return 99;
  return rec.retirementYear - TODAY.getFullYear();
}

export function retiresSoon(userId: string): boolean {
  return yearsToRetirement(userId) <= RETIRE_SOON_YEARS;
}

/** Tracks that build a given competency. */
export function competencyTracks(compId: string, tracks: Track[]): Track[] {
  return tracks.filter((t) => TRACK_COMPETENCY[t.id] === compId);
}

export interface CompetencyLevel {
  competency: Competency;
  /** 0–100 proficiency, averaged over assigned tracks in this competency. */
  level: number;
  /** Role-expected proficiency for this user. */
  target: number;
  /** max(0, target − level). */
  gap: number;
  /** Whether the user is assigned any track in this competency. */
  assigned: boolean;
  qualified: boolean;
}

/** Proficiency a user holds in one competency (avg completion of assigned tracks in it). */
export function competencyLevel(
  comp: Competency,
  user: User,
  tracks: Track[],
  allProgress: ProgressRecord[],
): CompetencyLevel {
  const mine = recordsFor(user.id, allProgress);
  const relevant = competencyTracks(comp.id, tracks).filter((t) =>
    user.assignedTrackIds.includes(t.id),
  );
  const target = roleProfile(user.jobTitle)[comp.id] ?? 0;
  if (relevant.length === 0) {
    return { competency: comp, level: 0, target, gap: target, assigned: false, qualified: false };
  }
  const level = Math.round(
    relevant.reduce((s, t) => s + deriveTrackProgress(t, mine).percent, 0) / relevant.length,
  );
  return {
    competency: comp,
    level,
    target,
    gap: Math.max(0, target - level),
    assigned: true,
    qualified: level >= QUALIFIED,
  };
}

/** Full competency profile for one learner. */
export function competencyProfile(
  user: User,
  tracks: Track[],
  allProgress: ProgressRecord[],
): CompetencyLevel[] {
  return COMPETENCIES.map((c) => competencyLevel(c, user, tracks, allProgress));
}

export interface MatrixResult {
  competencies: Competency[];
  learners: User[];
  cell: (compId: string, userId: string) => CompetencyLevel;
}

/** Competency × learner matrix with role-target overlay. */
export function buildCompetencyMatrix(
  users: User[],
  tracks: Track[],
  allProgress: ProgressRecord[],
): MatrixResult {
  const learners = learnersOf(users);
  const map = new Map<string, CompetencyLevel>();
  for (const u of learners) {
    for (const c of COMPETENCIES) {
      map.set(`${c.id}:${u.id}`, competencyLevel(c, u, tracks, allProgress));
    }
  }
  const empty: CompetencyLevel = {
    competency: COMPETENCIES[0],
    level: 0,
    target: 0,
    gap: 0,
    assigned: false,
    qualified: false,
  };
  return {
    competencies: COMPETENCIES,
    learners,
    cell: (compId, userId) => map.get(`${compId}:${userId}`) ?? empty,
  };
}

export type RiskLevel = "high" | "medium" | "low";

export interface CompetencyRisk {
  competency: Competency;
  /** Learners qualified (≥ QUALIFIED) in this competency, strongest first. */
  qualifiedHolders: { user: User; level: number; retiresSoon: boolean }[];
  /** Best-effort holders overall (for coverage context), strongest first. */
  topHolders: { user: User; level: number }[];
  qualifiedCount: number;
  /** % of the team that is qualified. */
  coverage: number;
  /** Single qualified holder, when the bus factor is exactly 1. */
  soleHolder: User | null;
  retirementExposed: boolean;
  score: number; // 0–100
  level: RiskLevel;
}

/** Knowledge-at-risk / bus-factor analysis per competency. */
export function buildKnowledgeRisk(
  users: User[],
  tracks: Track[],
  allProgress: ProgressRecord[],
): CompetencyRisk[] {
  const learners = learnersOf(users);
  const rows = COMPETENCIES.map((comp): CompetencyRisk => {
    const holders = learners
      .map((user) => ({ user, level: competencyLevel(comp, user, tracks, allProgress).level }))
      .filter((h) => h.level > 0)
      .sort((a, b) => b.level - a.level);

    const qualified = holders
      .filter((h) => h.level >= QUALIFIED)
      .map((h) => ({ ...h, retiresSoon: retiresSoon(h.user.id) }));

    const qualifiedCount = qualified.length;
    const coverage = learners.length
      ? Math.round((qualifiedCount / learners.length) * 100)
      : 0;

    // Scarcity of qualified holders drives most of the risk.
    const scarcity =
      qualifiedCount === 0 ? 100
      : qualifiedCount === 1 ? 80
      : qualifiedCount === 2 ? 55
      : qualifiedCount === 3 ? 35
      : 15;

    const retirementExposed = qualifiedCount > 0 && qualifiedCount <= 2 && qualified.some((h) => h.retiresSoon);

    let score = Math.round(scarcity * (comp.criticality / 5));
    if (retirementExposed) score = Math.min(100, score + 20);

    const level: RiskLevel = score >= 60 ? "high" : score >= 35 ? "medium" : "low";

    return {
      competency: comp,
      qualifiedHolders: qualified,
      topHolders: holders.slice(0, 4),
      qualifiedCount,
      coverage,
      soleHolder: qualifiedCount === 1 ? qualified[0].user : null,
      retirementExposed,
      score,
      level,
    };
  });
  return rows.sort((a, b) => b.score - a.score);
}

export type CertStatus = "valid" | "expiring" | "expired" | "missing";

export function daysUntil(iso: string): number {
  return Math.round((new Date(iso).getTime() - TODAY.getTime()) / 86_400_000);
}

function certStatus(expires: string | null): CertStatus {
  if (!expires) return "missing";
  const d = daysUntil(expires);
  if (d < 0) return "expired";
  if (d <= EXPIRING_DAYS) return "expiring";
  return "valid";
}

export interface CertCell {
  certId: string;
  status: CertStatus;
  expires: string | null;
  daysLeft: number | null;
}

export interface ComplianceRow {
  user: User;
  cells: CertCell[];
  /** Worst status held, for sorting / row badge. */
  worst: CertStatus;
  /** count of required certs that are valid. */
  validCount: number;
  requiredCount: number;
}

const STATUS_RANK: Record<CertStatus, number> = { missing: 0, expired: 1, expiring: 2, valid: 3 };

export interface ComplianceResult {
  rows: ComplianceRow[];
  certs: typeof CERTIFICATIONS;
  totals: Record<CertStatus, number>;
  /** % of all required certificates currently valid. */
  rate: number;
  /** Flattened action items, worst first. */
  actions: { user: User; certId: string; status: CertStatus; daysLeft: number | null }[];
}

/** Certification / recertification compliance across the team. */
export function buildCompliance(users: User[]): ComplianceResult {
  const learners = learnersOf(users);
  const totals: Record<CertStatus, number> = { valid: 0, expiring: 0, expired: 0, missing: 0 };
  const actions: ComplianceResult["actions"] = [];

  const rows = learners.map((user): ComplianceRow => {
    const cells = REQUIRED_CERTS.map((certId): CertCell => {
      const rec = CERT_RECORDS.find((r) => r.userId === user.id && r.certId === certId);
      const status = certStatus(rec?.expires ?? null);
      totals[status] += 1;
      if (status !== "valid") {
        actions.push({ user, certId, status, daysLeft: rec ? daysUntil(rec.expires) : null });
      }
      return {
        certId,
        status,
        expires: rec?.expires ?? null,
        daysLeft: rec ? daysUntil(rec.expires) : null,
      };
    });
    const worst = cells.reduce<CertStatus>(
      (w, c) => (STATUS_RANK[c.status] < STATUS_RANK[w] ? c.status : w),
      "valid",
    );
    return {
      user,
      cells,
      worst,
      validCount: cells.filter((c) => c.status === "valid").length,
      requiredCount: REQUIRED_CERTS.length,
    };
  });

  const totalRequired = learners.length * REQUIRED_CERTS.length;
  const rate = totalRequired ? Math.round((totals.valid / totalRequired) * 100) : 0;

  rows.sort((a, b) => STATUS_RANK[a.worst] - STATUS_RANK[b.worst]);
  actions.sort(
    (a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status] || (a.daysLeft ?? -999) - (b.daysLeft ?? -999),
  );

  return { rows, certs: CERTIFICATIONS, totals, rate, actions };
}

export interface ExecutiveSummary {
  headcount: number;
  /** Total learning hours delivered (completed module minutes ÷ 60). */
  learningHours: number;
  /** Avg role-readiness across the team (0–100). */
  readiness: number;
  /** Avg overall track completion (0–100). */
  avgCompletion: number;
  complianceRate: number;
  /** Competencies at high knowledge-risk. */
  highRiskCount: number;
  /** Distinct engineers with at least one non-valid required cert. */
  complianceExceptions: number;
  /** Engineers retiring within the succession window. */
  retiringSoon: number;
  /** Per-competency team-average proficiency (for the readiness chart). */
  byCompetency: { competency: Competency; level: number; target: number }[];
  risks: CompetencyRisk[];
  compliance: ComplianceResult;
}

/** One learner's role-readiness = how much of their role profile they've met. */
export function roleReadiness(
  user: User,
  tracks: Track[],
  allProgress: ProgressRecord[],
): number {
  const profile = competencyProfile(user, tracks, allProgress).filter((c) => c.target > 0);
  if (profile.length === 0) return 100;
  const met = profile.reduce((s, c) => s + Math.min(1, c.level / c.target), 0);
  return Math.round((met / profile.length) * 100);
}

/** Leadership roll-up spanning learning, readiness, compliance, and succession. */
export function buildExecutiveSummary(
  users: User[],
  tracks: Track[],
  allProgress: ProgressRecord[],
): ExecutiveSummary {
  const learners = learnersOf(users);

  const durationOf = new Map<string, number>();
  for (const t of tracks) for (const m of t.modules) durationOf.set(m.id, m.duration);
  const completedMinutes = allProgress
    .filter((p) => p.state === "completed")
    .reduce((s, p) => s + (durationOf.get(p.moduleId) ?? 0), 0);

  const readiness = learners.length
    ? Math.round(learners.reduce((s, u) => s + roleReadiness(u, tracks, allProgress), 0) / learners.length)
    : 0;

  const avgCompletion = learners.length
    ? Math.round(
        learners.reduce((s, u) => {
          const assigned = tracks.filter((t) => u.assignedTrackIds.includes(t.id));
          const total = assigned.reduce((a, t) => a + deriveTrackProgress(t, recordsFor(u.id, allProgress)).total, 0);
          const done = assigned.reduce((a, t) => a + deriveTrackProgress(t, recordsFor(u.id, allProgress)).completed, 0);
          return s + (total ? (done / total) * 100 : 0);
        }, 0) / learners.length,
      )
    : 0;

  const byCompetency = COMPETENCIES.map((comp) => {
    const levels = learners.map((u) => competencyLevel(comp, u, tracks, allProgress));
    const assignedLevels = levels.filter((l) => l.assigned);
    const level = assignedLevels.length
      ? Math.round(assignedLevels.reduce((s, l) => s + l.level, 0) / assignedLevels.length)
      : 0;
    const target = Math.round(levels.reduce((s, l) => s + l.target, 0) / (levels.length || 1));
    return { competency: comp, level, target };
  });

  const risks = buildKnowledgeRisk(users, tracks, allProgress);
  const compliance = buildCompliance(users);
  const complianceExceptions = compliance.rows.filter((r) => r.worst !== "valid").length;
  const retiringSoon = learners.filter((u) => retiresSoon(u.id)).length;

  return {
    headcount: learners.length,
    learningHours: Math.round(completedMinutes / 60),
    readiness,
    avgCompletion,
    complianceRate: compliance.rate,
    highRiskCount: risks.filter((r) => r.level === "high").length,
    complianceExceptions,
    retiringSoon,
    byCompetency,
    risks,
    compliance,
  };
}

export type RecReason = "continue" | "gap" | "prerequisite";

export interface Recommendation {
  track: Track;
  reason: RecReason;
  competency: Competency;
  /** Current completion of this track for the learner. */
  percent: number;
  /** Role gap in the competency this track serves. */
  competencyGap: number;
}

/**
 * "AI" development path, a role-aware next-best-action list for a learner.
 * Deterministic and explainable: continue what's started, then close the widest
 * role-competency gaps, respecting prerequisites.
 */
export function recommendTracks(
  user: User,
  tracks: Track[],
  allProgress: ProgressRecord[],
  limit = 4,
): Recommendation[] {
  const mine = recordsFor(user.id, allProgress);
  const compById = new Map(COMPETENCIES.map((c) => [c.id, c] as const));
  const profile = competencyProfile(user, tracks, allProgress);
  const gapByComp = new Map(profile.map((p) => [p.competency.id, p.gap] as const));

  const assigned = tracks.filter((t) => user.assignedTrackIds.includes(t.id));
  const scored = assigned
    .map((track) => {
      const tp = deriveTrackProgress(track, mine);
      const compId = TRACK_COMPETENCY[track.id];
      const comp = compById.get(compId)!;
      const gap = gapByComp.get(compId) ?? 0;
      return { track, tp, comp, gap };
    })
    .filter((x) => x.tp.percent < 100); // nothing to recommend if already done

  const recs: Recommendation[] = [];

  // 1) Continue in-progress tracks (most momentum first).
  scored
    .filter((x) => x.tp.percent > 0)
    .sort((a, b) => b.tp.percent - a.tp.percent)
    .forEach((x) =>
      recs.push({
        track: x.track,
        reason: "continue",
        competency: x.comp,
        percent: x.tp.percent,
        competencyGap: x.gap,
      }),
    );

  // 2) Not-started tracks, prioritised by the role gap they close.
  scored
    .filter((x) => x.tp.percent === 0)
    .sort((a, b) => b.gap - a.gap)
    .forEach((x) => {
      const startedModules = x.tp.modules.filter((m) => m.state !== "locked").length;
      recs.push({
        track: x.track,
        reason: startedModules === 0 ? "prerequisite" : "gap",
        competency: x.comp,
        percent: 0,
        competencyGap: x.gap,
      });
    });

  return recs.slice(0, limit);
}
