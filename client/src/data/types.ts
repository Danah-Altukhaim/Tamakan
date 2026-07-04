/**
 * Client domain types, mirror of server/src/data/types.ts (JSON wire contract).
 * Content hierarchy: Department → Track → Module → content unit (PRD §7.1).
 */

export type ModuleType = "video" | "reading" | "interactive";
export type StoredModuleState = "completed" | "in-progress";
/** Derived at render time from stored progress + prerequisites (FR-L5). */
export type ModuleState = "completed" | "in-progress" | "available" | "locked";
export type TrackStatus = "current" | "review-due" | "undocumented";
export type ResourceType = "pdf" | "video-series" | "interactive" | "recorded-lecture";
export type ResourceLevel = "beginner" | "intermediate" | "advanced" | "reference";
export type Role = "learner" | "manager";

export interface Module {
  id: string;
  trackId: string;
  title: string;
  duration: number;
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
  dayIndex: number;
  minutes: number;
}

export interface Citation {
  kind: "track" | "module" | "resource";
  id: string;
  label: string;
}

export interface AssistantAnswer {
  answer: string;
  citations: Citation[];
  confidence: number;
  escalate: boolean;
}

/** UI-only: a module with its derived, prerequisite-aware state. */
export interface ModuleWithState extends Module {
  state: ModuleState;
}

/** UI-only: a track enriched with progress for the current learner. */
export interface TrackProgress {
  track: Track;
  completed: number;
  total: number;
  percent: number;
  modules: ModuleWithState[];
}
