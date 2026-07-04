/**
 * Rank ladder, maps learning points to a named rank, and computes progression
 * (previous / current / next) for the Rank detail view on the Overview.
 *
 * Thresholds are a starting system; confirm against the real KOC gamification
 * model once defined (PRD §13, gamification for enterprise context is open).
 */

export interface RankTier {
  /** Canonical English name, must match User.rank values in mock data. */
  name: string;
  /** Minimum points required to hold this rank. */
  min: number;
}

/** Ordered low → high. "Manager" is not a learner rank and is intentionally omitted. */
export const RANK_LADDER: RankTier[] = [
  { name: "New Hire", min: 0 },
  { name: "Intermediate Learner", min: 1000 },
  { name: "Advanced Learner", min: 2000 },
  { name: "Expert", min: 4000 },
];

export interface RankProgress {
  previous: RankTier | null;
  current: RankTier;
  next: RankTier | null;
  /** Points still needed to reach `next` (0 if already at the top). */
  pointsToNext: number;
  /** 0–100 progress through the current tier toward the next. 100 at the top. */
  percent: number;
}

/**
 * Resolve a learner's rank standing from their points. Falls back to matching
 * the stored rank name if points sit outside the ladder for any reason.
 */
export function rankProgress(points: number, storedRank?: string): RankProgress {
  // Highest tier whose threshold the learner has reached.
  let idx = 0;
  for (let i = 0; i < RANK_LADDER.length; i++) {
    if (points >= RANK_LADDER[i].min) idx = i;
  }
  // If points disagree with the stored rank (e.g. hand-set mock), trust the name.
  if (storedRank) {
    const named = RANK_LADDER.findIndex((r) => r.name === storedRank);
    if (named >= 0) idx = named;
  }

  const current = RANK_LADDER[idx];
  const previous = idx > 0 ? RANK_LADDER[idx - 1] : null;
  const next = idx < RANK_LADDER.length - 1 ? RANK_LADDER[idx + 1] : null;

  if (!next) {
    return { previous, current, next: null, pointsToNext: 0, percent: 100 };
  }

  const span = next.min - current.min;
  const gained = Math.max(0, points - current.min);
  const percent = span <= 0 ? 100 : Math.min(100, Math.round((gained / span) * 100));
  const pointsToNext = Math.max(0, next.min - points);
  return { previous, current, next, pointsToNext, percent };
}

/** Display name for a tier. */
export function rankName(tier: RankTier): string {
  return tier.name;
}
