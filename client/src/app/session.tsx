import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "../lib/api";
import type {
  Track,
  Resource,
  User,
  ProgressRecord,
  Role,
  StoredModuleState,
} from "../data/types";

/**
 * App-wide session + data. In the absence of KOC SSO (PRD §13.5) the demo
 * "logs in" as a fixed learner and lets you switch to the manager role to see
 * the other surfaces. All content/progress is loaded once and cached here.
 */

interface SessionValue {
  ready: boolean;
  error: string | null;
  /** Whether a user has "logged in" (demo bypass). Gates the app behind Login. */
  authed: boolean;
  /** Demo login: pick a role and enter the app. */
  login: (role: Role) => void;
  /** Return to the login screen. */
  logout: () => void;
  role: Role;
  setRole: (role: Role) => void;
  currentUser: User | null;
  learner: User | null; // the learner whose progress the learner surface shows
  tracks: Track[];
  resources: Resource[];
  users: User[];
  /** All progress records (manager needs the whole team). */
  allProgress: ProgressRecord[];
  /** Progress for the active learner. */
  myProgress: ProgressRecord[];
  setModuleState: (moduleId: string, state: StoredModuleState) => Promise<void>;
  /** Add a new learner to the roster (demo: client-side only, FR-M*). */
  addMember: (input: NewMemberInput) => User;
  /** Manager action: set the tracks a learner is assigned (FR-M). */
  assignTracks: (userId: string, trackIds: string[]) => Promise<void>;
  /** Remove a learner from the roster (demo: client-side only, FR-M*). */
  removeMember: (userId: string) => void;
}

/** Manager-supplied fields for a new team member; the rest are defaulted. */
export interface NewMemberInput {
  name: string;
  jobTitle: string;
  department: string;
  assignedTrackIds: string[];
}

const LEARNER_ID = "u1";
const MANAGER_ID = "m1";

/** Two-letter initials from a display name (first + last word). */
function initialsFor(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const first = words[0][0] ?? "";
  const last = words.length > 1 ? words[words.length - 1][0] ?? "" : "";
  return (first + last).toUpperCase();
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authed, setAuthed] = useState(false);
  const [role, setRole] = useState<Role>("learner");

  function login(nextRole: Role) {
    // The router unmounts while logged out, so reset the URL to root before it
    // remounts, the role-aware Home route then lands us on the right surface.
    window.history.replaceState(null, "", "/");
    setRole(nextRole);
    setAuthed(true);
  }
  function logout() {
    setAuthed(false);
  }

  const [tracks, setTracks] = useState<Track[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [allProgress, setAllProgress] = useState<ProgressRecord[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [t, r, u, p] = await Promise.all([
          api.tracks(),
          api.resources(),
          api.users(),
          api.allProgress(),
        ]);
        if (cancelled) return;
        setTracks(t);
        setResources(r);
        setUsers(u);
        setAllProgress(p);
        setReady(true);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const learner = useMemo(
    () => users.find((u) => u.id === LEARNER_ID) ?? null,
    [users],
  );
  const currentUser = useMemo(() => {
    const id = role === "manager" ? MANAGER_ID : LEARNER_ID;
    return users.find((u) => u.id === id) ?? null;
  }, [users, role]);

  const myProgress = useMemo(
    () => allProgress.filter((p) => p.userId === LEARNER_ID),
    [allProgress],
  );

  function addMember(input: NewMemberInput): User {
    const user: User = {
      id: `u-${users.length + 1}-${Date.now()}`,
      name: input.name,
      initials: initialsFor(input.name),
      role: "learner",
      jobTitle: input.jobTitle,
      department: input.department,
      joined: new Date().toISOString().slice(0, 10),
      streak: 0,
      points: 0,
      rank: "New Hire",
      lastActive: new Date().toISOString().slice(0, 10),
      assignedTrackIds: input.assignedTrackIds,
    };
    setUsers((prev) => [...prev, user]);
    return user;
  }

  function removeMember(userId: string) {
    // Demo-only: drop the learner and their progress from client state. Managers
    // and the active learner are never removable (guarded in the UI too).
    if (userId === LEARNER_ID || userId === MANAGER_ID) return;
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setAllProgress((prev) => prev.filter((p) => p.userId !== userId));
  }

  async function assignTracks(userId: string, trackIds: string[]) {
    const next = [...new Set(trackIds)];
    // Optimistic: reflect immediately so the roster/heatmap update at once.
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, assignedTrackIds: next } : u)),
    );
    try {
      // Persist for seeded users; client-added members (demo-only) have no
      // server record, so a 404 here is expected and harmless.
      await api.setAssignments(userId, next);
    } catch {
      /* keep the optimistic client state for the demo */
    }
  }

  async function setModuleState(moduleId: string, state: StoredModuleState) {
    const rec = await api.setProgress(LEARNER_ID, moduleId, state);
    setAllProgress((prev) => {
      const rest = prev.filter(
        (p) => !(p.userId === rec.userId && p.moduleId === rec.moduleId),
      );
      return [...rest, rec];
    });
  }

  const value: SessionValue = {
    ready,
    error,
    authed,
    login,
    logout,
    role,
    setRole,
    currentUser,
    learner,
    tracks,
    resources,
    users,
    allProgress,
    myProgress,
    setModuleState,
    addMember,
    assignTracks,
    removeMember,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
