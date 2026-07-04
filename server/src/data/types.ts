/**
 * API domain types (server side).
 * Kept in sync with client/src/data/types.ts, the wire contract is JSON.
 * Content hierarchy: Department → Track → Module → content unit (PRD §7.1).
 */

export type ModuleType = "video" | "reading" | "interactive";
/** Stored progress is only completed/in-progress; available/locked is derived. */
export type StoredModuleState = "completed" | "in-progress";
export type TrackStatus = "current" | "review-due" | "undocumented";
export type ResourceType = "pdf" | "video-series" | "interactive" | "recorded-lecture";
export type ResourceLevel = "beginner" | "intermediate" | "advanced" | "reference";
export type Role = "learner" | "manager";

export interface Module {
  id: string;
  trackId: string;
  title: string;
  duration: number; // minutes
  type: ModuleType;
  order: number;
  prerequisite?: string;
}

export interface Track {
  id: string;
  title: string;
  department: string;
  icon: string;
  order: number;
  status: TrackStatus;
  /** One of the two unresolved overlap pairs (PRD §7.2). */
  overlapsWith?: string;
  modules: Module[];
}

export interface User {
  id: string;
  name: string;
  initials: string;
  role: Role;
  jobTitle: string;
  department: string;
  joined: string;
  streak: number;
  points: number;
  rank: string;
  lastActive: string;
  /** Tracks assigned to this learner (ids). */
  assignedTrackIds: string[];
}

export interface ProgressRecord {
  userId: string;
  moduleId: string;
  state: StoredModuleState;
  updatedAt: string;
}

export interface Resource {
  id: string;
  title: string;
  type: ResourceType;
  level: ResourceLevel;
  tags: string[];
  description: string;
  url: string;
  relatedTrackId?: string;
}

export interface DayActivity {
  dayIndex: number; // 0=Sun … 6=Sat
  minutes: number;
}

/** Assistant answer grounded in Tamakan content (PRD §6.3, FR-A2/A3). */
export interface Citation {
  kind: "track" | "module" | "resource";
  id: string;
  label: string;
}

export interface AssistantAnswer {
  answer: string;
  citations: Citation[];
  /** 0–1; low confidence surfaces an "ask a human" escalation. */
  confidence: number;
  escalate: boolean;
}
