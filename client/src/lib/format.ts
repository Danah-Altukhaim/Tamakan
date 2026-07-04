import type { Track, Module, Resource } from "../data/types";

export const trackTitle = (t: Track) => t.title;
export const moduleTitle = (m: Module) => m.title;
export const resourceTitle = (r: Resource) => r.title;
export const resourceDesc = (r: Resource) => r.description;

/** Whole-number days between an ISO date and "today" (2026-07-02 in the demo). */
export function daysSince(iso: string, now = new Date("2026-07-02")): number {
  const then = new Date(iso);
  const ms = now.getTime() - then.getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

const DAY_KEYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export function dayLabel(index: number): string {
  return DAY_KEYS[index] ?? "";
}

/** KOC work week: Sunday–Thursday. Fri/Sat are weekend and don't count toward streaks/activity. */
export const BUSINESS_DAYS = [0, 1, 2, 3, 4];
export function isBusinessDay(dayIndex: number): boolean {
  return BUSINESS_DAYS.includes(dayIndex);
}
