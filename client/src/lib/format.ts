import type { Track, Module, Resource } from "../data/types";

/** Pick the Arabic or English field based on the active language. */
function pick(en: string, ar: string, lang: string): string {
  return lang === "ar" && ar ? ar : en;
}

export const trackTitle = (t: Track, lang: string) => pick(t.title, t.titleAr, lang);
export const moduleTitle = (m: Module, lang: string) => pick(m.title, m.titleAr, lang);
export const resourceTitle = (r: Resource, lang: string) =>
  pick(r.title, r.titleAr, lang);
export const resourceDesc = (r: Resource, lang: string) =>
  pick(r.description, r.descriptionAr, lang);

/** Whole-number days between an ISO date and "today" (2026-07-02 in the demo). */
export function daysSince(iso: string, now = new Date("2026-07-02")): number {
  const then = new Date(iso);
  const ms = now.getTime() - then.getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

const DAY_KEYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_KEYS_AR = ["أحد", "إثن", "ثلا", "أرب", "خمي", "جمع", "سبت"];
export function dayLabel(index: number, lang: string): string {
  return (lang === "ar" ? DAY_KEYS_AR : DAY_KEYS)[index] ?? "";
}
