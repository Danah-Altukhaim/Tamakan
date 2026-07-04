import type { ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SessionProvider, useSession } from "./session";
import { AppShell } from "./AppShell";
import { Login } from "./Login";
import { Overview } from "../surfaces/learner/Overview";
import { MyTracks } from "../surfaces/learner/MyTracks";
import { TrackDetail } from "../surfaces/learner/TrackDetail";
import { ModulePlayer } from "../surfaces/learner/ModulePlayer";
import { Explore } from "../surfaces/learner/Explore";
import { Assistant } from "../surfaces/assistant/Assistant";
import { Roster } from "../surfaces/manager/Roster";
import { GapHeatmap } from "../surfaces/manager/GapHeatmap";
import { Analytics } from "../surfaces/manager/Analytics";
import { Executive } from "../surfaces/manager/Executive";
import { Competency } from "../surfaces/manager/Competency";
import { KnowledgeRisk } from "../surfaces/manager/KnowledgeRisk";
import { Compliance } from "../surfaces/manager/Compliance";

function Gate({ children }: { children: ReactNode }) {
  const { ready, error, authed } = useSession();
  const { t } = useTranslation();

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center p-6 text-center">
        <div>
          <div className="mb-2 text-lg font-bold text-[var(--danger)]">Can't reach the API</div>
          <p className="max-w-md text-sm text-[var(--text-muted)]">
            The Tamakan server isn't responding. Make sure it's running (npm run dev starts both
            client and server). Details: {error}
          </p>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="flex items-center gap-3 text-[var(--text-muted)]">
          <div
            className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--separator)]"
            style={{ borderTopColor: "var(--koc-blue)" }}
          />
          {t("common.loading")}
        </div>
      </div>
    );
  }

  if (!authed) {
    return <Login />;
  }

  return <>{children}</>;
}

/** Role-aware landing: managers start in the team roster, learners in Overview. */
function Home() {
  const { role } = useSession();
  return <Navigate to={role === "manager" ? "/manager/exec" : "/overview"} replace />;
}

export default function App() {
  return (
    <SessionProvider>
      <Gate>
        <BrowserRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<Home />} />
              <Route path="/overview" element={<Overview />} />
              <Route path="/tracks" element={<MyTracks />} />
              <Route path="/tracks/:trackId" element={<TrackDetail />} />
              <Route path="/tracks/:trackId/m/:moduleId" element={<ModulePlayer />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/assistant" element={<Assistant />} />
              <Route path="/manager/exec" element={<Executive />} />
              <Route path="/manager/team" element={<Roster />} />
              <Route path="/manager/competencies" element={<Competency />} />
              <Route path="/manager/risk" element={<KnowledgeRisk />} />
              <Route path="/manager/compliance" element={<Compliance />} />
              <Route path="/manager/gaps" element={<GapHeatmap />} />
              <Route path="/manager/analytics" element={<Analytics />} />
              <Route path="*" element={<Home />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </Gate>
    </SessionProvider>
  );
}
