/**
 * Workforce-intelligence reference layer (demo).
 *
 * This module layers a KOC-flavoured competency + compliance + succession model
 * on top of the existing tracks/users/progress. It is intentionally static and
 * derivable: every number the manager surfaces show is computed in
 * `lib/workforce.ts` from real progress records + these reference maps, so the
 * story stays honest ("Noura holds Simulation and she retires in 2027") rather
 * than hand-waved.
 *
 * ⚠️ Values (role targets, retirement years, cert dates) are demo placeholders -
 * confirm against KOC HR / competency framework before any real use.
 */

/** "Today" for the demo, matches lib/format.ts. */
export const TODAY = new Date("2026-07-03");

/** A learner is "qualified" in a competency at or above this proficiency. */
export const QUALIFIED = 70;

/** A certification / retirement counts as "soon" within this many days / years. */
export const EXPIRING_DAYS = 60;
export const RETIRE_SOON_YEARS = 3;

/** A KOC Engineering & Reservoir capability domain. Tracks roll up into these. */
export interface Competency {
  id: string;
  name: string;
  /** Compact label for matrix headers. */
  short: string;
  icon: string;
  /** How business-critical the capability is to KOC operations (1–5). */
  criticality: 1 | 2 | 3 | 4 | 5;
}

export const COMPETENCIES: Competency[] = [
  { id: "c1", name: "Reservoir Simulation & Modelling", short: "Simulation", icon: "grid", criticality: 5 },
  { id: "c2", name: "Well & Pressure Testing", short: "Well Testing", icon: "gauge", criticality: 4 },
  { id: "c3", name: "Production Technology", short: "Production", icon: "pipe", criticality: 4 },
  { id: "c4", name: "Well Intervention & Stimulation", short: "Stimulation", icon: "spark", criticality: 3 },
  { id: "c5", name: "Geomechanics & Pore Pressure", short: "Geomechanics", icon: "globe", criticality: 4 },
  { id: "c6", name: "Field Operations & HSE", short: "Field & HSE", icon: "shield", criticality: 5 },
];

/** Which competency each track builds toward. */
export const TRACK_COMPETENCY: Record<string, string> = {
  t1: "c1", t2: "c1", t9: "c1", t10: "c1",
  t3: "c2", t5: "c2", t6: "c2", t7: "c2",
  t8: "c3", t13: "c3",
  t11: "c4", t12: "c4",
  t14: "c5",
  t4: "c6",
};

/**
 * Target proficiency (0–100) each role is expected to hold per competency.
 * Drives the competency matrix gap analysis and team readiness.
 */
export type RoleProfile = Record<string, number>;

export const ROLE_PROFILES: Record<string, RoleProfile> = {
  "Junior Reservoir Engineer": { c1: 40, c2: 40, c3: 20, c4: 20, c5: 25, c6: 80 },
  "Reservoir Engineer": { c1: 75, c2: 70, c3: 40, c4: 40, c5: 55, c6: 80 },
  "Senior Reservoir Engineer": { c1: 90, c2: 85, c3: 60, c4: 60, c5: 70, c6: 80 },
  "Petroleum Engineer": { c1: 60, c2: 60, c3: 70, c4: 55, c5: 40, c6: 80 },
  "Production Engineer": { c1: 30, c2: 45, c3: 85, c4: 70, c5: 30, c6: 90 },
};

/** Sensible fallback if a job title isn't in the map. */
export const DEFAULT_ROLE_PROFILE: RoleProfile = {
  c1: 50, c2: 50, c3: 50, c4: 40, c5: 40, c6: 80,
};

export function roleProfile(jobTitle: string): RoleProfile {
  return ROLE_PROFILES[jobTitle] ?? DEFAULT_ROLE_PROFILE;
}

/** Succession / retirement exposure per learner. */
export interface WorkforceRecord {
  /** Calendar year the engineer is expected to retire. */
  retirementYear: number;
}

export const WORKFORCE: Record<string, WorkforceRecord> = {
  u1: { retirementYear: 2048 },
  u2: { retirementYear: 2055 },
  u3: { retirementYear: 2027 }, // Noura, senior expert retiring next year
  u4: { retirementYear: 2044 },
  u5: { retirementYear: 2052 },
  u6: { retirementYear: 2029 }, // Abdullah, retiring within window
  u7: { retirementYear: 2046 },
  u8: { retirementYear: 2057 },
};

/** A compliance certification KOC field engineers must hold current. */
export interface Certification {
  id: string;
  name: string;
  short: string;
  authority: string;
  /** How long a certificate is valid, in months. */
  validityMonths: number;
  icon: string;
}

export const CERTIFICATIONS: Certification[] = [
  { id: "ce_hse", name: "HSE General Induction", short: "HSE Induction", authority: "KOC HSE", validityMonths: 12, icon: "shield" },
  { id: "ce_h2s", name: "H₂S & Breathing Apparatus", short: "H₂S", authority: "KOC HSE", validityMonths: 12, icon: "alert" },
  { id: "ce_ptw", name: "Permit to Work (PTW)", short: "PTW", authority: "KOC Operations", validityMonths: 24, icon: "document" },
  { id: "ce_iwcf", name: "IWCF Well Control", short: "Well Control", authority: "IWCF", validityMonths: 24, icon: "gauge" },
  { id: "ce_drive", name: "Defensive Driving", short: "Driving", authority: "KOC HSE", validityMonths: 36, icon: "gear" },
];

/** Certifications every field-going engineer is required to hold. */
export const REQUIRED_CERTS = ["ce_hse", "ce_h2s", "ce_ptw", "ce_iwcf", "ce_drive"];

/** Held certificate. A missing (user, requiredCert) pair = a compliance gap. */
export interface CertRecord {
  userId: string;
  certId: string;
  /** ISO expiry date. */
  expires: string;
}

/**
 * Seeded around TODAY (2026-07-03) to exercise every state:
 *  expired · expiring-soon (≤60d) · valid · missing (no row for a required cert).
 */
export const CERT_RECORDS: CertRecord[] = [
  // Shahad (u1), fully compliant
  { userId: "u1", certId: "ce_hse", expires: "2027-02-10" },
  { userId: "u1", certId: "ce_h2s", expires: "2027-01-22" },
  { userId: "u1", certId: "ce_ptw", expires: "2027-08-01" },
  { userId: "u1", certId: "ce_iwcf", expires: "2028-03-15" },
  { userId: "u1", certId: "ce_drive", expires: "2028-11-05" },
  // Faisal (u2), HSE expiring soon
  { userId: "u2", certId: "ce_hse", expires: "2026-07-20" },
  { userId: "u2", certId: "ce_h2s", expires: "2027-03-01" },
  { userId: "u2", certId: "ce_ptw", expires: "2027-01-18" },
  { userId: "u2", certId: "ce_iwcf", expires: "2028-01-30" },
  { userId: "u2", certId: "ce_drive", expires: "2029-01-12" },
  // Noura (u3), compliant senior
  { userId: "u3", certId: "ce_hse", expires: "2026-12-14" },
  { userId: "u3", certId: "ce_h2s", expires: "2026-11-09" },
  { userId: "u3", certId: "ce_ptw", expires: "2028-01-20" },
  { userId: "u3", certId: "ce_iwcf", expires: "2027-10-03" },
  { userId: "u3", certId: "ce_drive", expires: "2028-06-28" },
  // Yousef (u4), lapsed: two expired, one missing
  { userId: "u4", certId: "ce_hse", expires: "2026-04-10" }, // expired
  { userId: "u4", certId: "ce_h2s", expires: "2026-05-30" }, // expired
  { userId: "u4", certId: "ce_ptw", expires: "2027-05-11" },
  { userId: "u4", certId: "ce_iwcf", expires: "2027-09-24" },
  // (ce_drive missing → gap)
  // Dana (u5), compliant
  { userId: "u5", certId: "ce_hse", expires: "2027-05-19" },
  { userId: "u5", certId: "ce_h2s", expires: "2027-04-02" },
  { userId: "u5", certId: "ce_ptw", expires: "2028-02-14" },
  { userId: "u5", certId: "ce_iwcf", expires: "2027-12-01" },
  { userId: "u5", certId: "ce_drive", expires: "2029-03-22" },
  // Abdullah (u6), well control expiring soon
  { userId: "u6", certId: "ce_hse", expires: "2027-01-08" },
  { userId: "u6", certId: "ce_h2s", expires: "2026-10-30" },
  { userId: "u6", certId: "ce_ptw", expires: "2027-06-15" },
  { userId: "u6", certId: "ce_iwcf", expires: "2026-08-15" }, // expiring soon
  { userId: "u6", certId: "ce_drive", expires: "2028-09-09" },
  // Maryam (u7), PTW expiring soon
  { userId: "u7", certId: "ce_hse", expires: "2027-03-27" },
  { userId: "u7", certId: "ce_h2s", expires: "2027-02-11" },
  { userId: "u7", certId: "ce_ptw", expires: "2026-07-25" }, // expiring soon
  { userId: "u7", certId: "ce_iwcf", expires: "2028-04-19" },
  { userId: "u7", certId: "ce_drive", expires: "2029-05-30" },
  // Khaled (u8), new hire mid-onboarding: well control + driving not yet done
  { userId: "u8", certId: "ce_hse", expires: "2027-01-15" },
  { userId: "u8", certId: "ce_h2s", expires: "2027-01-15" },
  { userId: "u8", certId: "ce_ptw", expires: "2027-01-15" },
  // (ce_iwcf, ce_drive missing → gaps)
];
