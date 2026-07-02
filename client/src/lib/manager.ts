import type { Track, User, ProgressRecord } from "../data/types";
import { deriveTrackProgress, overallPercent } from "./progress";
import { daysSince } from "./format";

export type LearnerStatus = "on-track" | "at-risk" | "idle";

export interface TeamMember {
  user: User;
  percent: number;
  currentTrack: Track | null;
  currentTrackPercent: number;
  daysInactive: number;
  status: LearnerStatus;
}

/** Compute roster rows for every learner (managers are excluded). */
export function buildRoster(
  users: User[],
  tracks: Track[],
  allProgress: ProgressRecord[],
): TeamMember[] {
  const learners = users.filter((u) => u.role === "learner");
  return learners.map((user) => {
    const mine = allProgress.filter((p) => p.userId === user.id);
    const assigned = tracks.filter((t) => user.assignedTrackIds.includes(t.id));
    const percent = overallPercent(assigned, mine);

    // "Current" track = the in-progress one with the most momentum.
    let currentTrack: Track | null = null;
    let currentTrackPercent = 0;
    for (const t of assigned) {
      const p = deriveTrackProgress(t, mine);
      if (p.percent > 0 && p.percent < 100 && p.percent >= currentTrackPercent) {
        currentTrack = t;
        currentTrackPercent = p.percent;
      }
    }

    const daysInactive = daysSince(user.lastActive);
    let status: LearnerStatus;
    if (daysInactive >= 10) status = "at-risk";
    else if (percent === 0) status = "idle";
    else status = "on-track";

    return { user, percent, currentTrack, currentTrackPercent, daysInactive, status };
  });
}

/** Track × learner completion matrix for the gap heatmap (FR-M2). */
export function buildHeatmap(
  users: User[],
  tracks: Track[],
  allProgress: ProgressRecord[],
): { tracks: Track[]; learners: User[]; cell: (t: string, u: string) => number | null } {
  const learners = users.filter((u) => u.role === "learner");
  const map = new Map<string, number | null>();
  for (const u of learners) {
    const mine = allProgress.filter((p) => p.userId === u.id);
    for (const t of tracks) {
      const key = `${t.id}:${u.id}`;
      if (!u.assignedTrackIds.includes(t.id)) {
        map.set(key, null); // not assigned
      } else {
        map.set(key, deriveTrackProgress(t, mine).percent);
      }
    }
  }
  return {
    tracks,
    learners,
    cell: (t, u) => map.get(`${t}:${u}`) ?? null,
  };
}

/** Average completion of a track across the learners it's assigned to. */
export function trackAverage(
  track: Track,
  users: User[],
  allProgress: ProgressRecord[],
): { percent: number; assignedCount: number } {
  const learners = users.filter(
    (u) => u.role === "learner" && u.assignedTrackIds.includes(track.id),
  );
  if (learners.length === 0) return { percent: 0, assignedCount: 0 };
  const sum = learners.reduce((s, u) => {
    const mine = allProgress.filter((p) => p.userId === u.id);
    return s + deriveTrackProgress(track, mine).percent;
  }, 0);
  return { percent: Math.round(sum / learners.length), assignedCount: learners.length };
}
