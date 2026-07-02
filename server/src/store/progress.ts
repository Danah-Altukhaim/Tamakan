import { seedProgress } from "../data/mock.js";
import type { ProgressRecord, StoredModuleState } from "../data/types.js";

/**
 * In-memory progress store (PRD §11 "Progress"). Auditable, reliable record of
 * completion — swap for a real DB later; the API surface stays the same.
 */
let records: ProgressRecord[] = seedProgress();

export function getAll(): ProgressRecord[] {
  return records;
}

export function getForUser(userId: string): ProgressRecord[] {
  return records.filter((r) => r.userId === userId);
}

export function upsert(
  userId: string,
  moduleId: string,
  state: StoredModuleState,
): ProgressRecord {
  const now = new Date().toISOString();
  const existing = records.find(
    (r) => r.userId === userId && r.moduleId === moduleId,
  );
  if (existing) {
    existing.state = state;
    existing.updatedAt = now;
    return existing;
  }
  const rec: ProgressRecord = { userId, moduleId, state, updatedAt: now };
  records.push(rec);
  return rec;
}

export function reset(): void {
  records = seedProgress();
}
