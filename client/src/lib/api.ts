import type {
  Track,
  User,
  Resource,
  ProgressRecord,
  DayActivity,
  AssistantAnswer,
  StoredModuleState,
} from "../data/types";

/**
 * Typed client for the Tamakan API (Express server under /api).
 * Keeping every network call behind this module means a real backend, or a
 * different auth/transport, drops in here without touching the surfaces.
 */

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`/api${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

async function put<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PUT ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  tracks: () => get<Track[]>("/tracks"),
  track: (id: string) => get<Track>(`/tracks/${id}`),
  resources: () => get<Resource[]>("/resources"),
  users: () => get<User[]>("/users"),
  user: (id: string) => get<User>(`/users/${id}`),
  activity: (userId: string) => get<DayActivity[]>(`/activity/${userId}`),
  progress: (userId: string) => get<ProgressRecord[]>(`/progress/${userId}`),
  allProgress: () => get<ProgressRecord[]>("/progress"),
  setProgress: (userId: string, moduleId: string, state: StoredModuleState) =>
    post<ProgressRecord>("/progress", { userId, moduleId, state }),
  setAssignments: (userId: string, trackIds: string[]) =>
    put<User>(`/users/${userId}/assignments`, { trackIds }),
  ask: (question: string) => post<AssistantAnswer>("/assistant", { question }),
};
