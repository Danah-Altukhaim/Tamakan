import type {
  Track,
  ProgressRecord,
  ModuleState,
  ModuleWithState,
  TrackProgress,
} from "../data/types";

/**
 * Derive per-module state from stored progress + prerequisite locking (FR-L5).
 * A module is:
 *  - completed / in-progress   → straight from stored records
 *  - available                 → no prerequisite, or prerequisite completed
 *  - locked                    → prerequisite not yet completed
 */
export function deriveTrackProgress(
  track: Track,
  records: ProgressRecord[],
): TrackProgress {
  const byModule = new Map<string, ProgressRecord["state"]>();
  for (const r of records) byModule.set(r.moduleId, r.state);

  const ordered = [...track.modules].sort((a, b) => a.order - b.order);
  const modules: ModuleWithState[] = ordered.map((m) => {
    const stored = byModule.get(m.id);
    let state: ModuleState;
    if (stored === "completed") state = "completed";
    else if (stored === "in-progress") state = "in-progress";
    else if (!m.prerequisite || byModule.get(m.prerequisite) === "completed") {
      state = "available";
    } else {
      state = "locked";
    }
    return { ...m, state };
  });

  const total = modules.length;
  const completed = modules.filter((m) => m.state === "completed").length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { track, completed, total, percent, modules };
}

export function trackPercent(track: Track, records: ProgressRecord[]): number {
  return deriveTrackProgress(track, records).percent;
}

/** Overall completion across a set of assigned tracks. */
export function overallPercent(
  tracks: Track[],
  records: ProgressRecord[],
): number {
  const totals = tracks.reduce(
    (acc, t) => {
      const p = deriveTrackProgress(t, records);
      acc.done += p.completed;
      acc.total += p.total;
      return acc;
    },
    { done: 0, total: 0 },
  );
  return totals.total === 0 ? 0 : Math.round((totals.done / totals.total) * 100);
}
