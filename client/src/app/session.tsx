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
}

const LEARNER_ID = "u1";
const MANAGER_ID = "m1";

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authed, setAuthed] = useState(false);
  const [role, setRole] = useState<Role>("learner");

  function login(nextRole: Role) {
    // The router unmounts while logged out, so reset the URL to root before it
    // remounts — the role-aware Home route then lands us on the right surface.
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
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
