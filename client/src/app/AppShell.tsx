import { useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSession } from "./session";

/** Tamakan falcon + head mark — white icon-only crop of the brand logo. */
function Mark() {
  return (
    <img
      src="/tamakan-icon-white.png"
      alt="Tamakan"
      className="object-contain"
      style={{ blockSize: 30, inlineSize: "auto" }}
    />
  );
}

const LEARNER_TABS = [
  { to: "/overview", key: "nav.overview" },
  { to: "/tracks", key: "nav.myTracks" },
  { to: "/explore", key: "nav.explore" },
  { to: "/assistant", key: "nav.assistant" },
];
const MANAGER_TABS = [
  { to: "/manager/team", key: "nav.team" },
  { to: "/manager/gaps", key: "nav.gaps" },
  { to: "/manager/analytics", key: "nav.analytics" },
  { to: "/assistant", key: "nav.assistant" },
];

export function AppShell() {
  const { t } = useTranslation();
  const { role, setRole, currentUser, logout } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  // Keep role in sync with the URL so deep links to /manager/* show manager chrome.
  const inManagerArea = location.pathname.startsWith("/manager");
  useEffect(() => {
    if (inManagerArea && role !== "manager") setRole("manager");
  }, [inManagerArea, role, setRole]);

  const tabs = inManagerArea || role === "manager" ? MANAGER_TABS : LEARNER_TABS;

  function switchRole(next: "learner" | "manager") {
    if (next === role) return;
    setRole(next);
    navigate(next === "manager" ? "/manager/team" : "/overview");
  }

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--text)]">
      {/* Top navigation bar */}
      <div
        className="sticky top-0 z-30 text-white"
        style={{ background: "var(--koc-navy)", boxShadow: "0 1px 0 rgba(255,255,255,.06)" }}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <Mark />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-wide">{t("app.name")}</span>
                <span className="hidden sm:inline text-xs text-[var(--text-on-brand-muted)] truncate">
                  · {t("app.tagline")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Role switch (stands in for KOC SSO roles — PRD §13.5) */}
            <div className="hidden sm:flex items-center rounded-full bg-white/10 p-0.5 text-xs font-semibold">
              {(["learner", "manager"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => switchRole(r)}
                  className={[
                    "rounded-full px-3 py-1 transition-colors",
                    role === r ? "bg-white text-[var(--koc-navy)]" : "text-white/80",
                  ].join(" ")}
                >
                  {t(r === "learner" ? "nav.learnerView" : "nav.managerView")}
                </button>
              ))}
            </div>

            {currentUser && (
              <div className="flex items-center gap-2">
                <div className="hidden text-end sm:block leading-tight">
                  <div className="text-xs font-semibold">{currentUser.name}</div>
                  <div className="text-[11px] text-[var(--text-on-brand-muted)]">
                    {currentUser.jobTitle}
                  </div>
                </div>
                <div
                  className="grid h-9 w-9 place-items-center rounded-full text-sm font-bold"
                  style={{ background: "var(--koc-sand)", color: "var(--koc-navy)" }}
                >
                  {currentUser.initials}
                </div>
                <button
                  onClick={logout}
                  className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20 transition-colors"
                >
                  {t("login.signOut")}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Segmented tab bar */}
        <div className="border-t border-white/10">
          <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-2 sm:px-5">
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  [
                    "relative whitespace-nowrap px-4 py-3 text-sm font-semibold transition-colors",
                    isActive ? "text-white" : "text-white/60 hover:text-white/90",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    {t(tab.key)}
                    {isActive && (
                      <span
                        className="absolute inset-x-3 bottom-0 h-0.5 rounded-full"
                        style={{ background: "var(--koc-sand)" }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile role switch */}
      <div className="sm:hidden mx-auto max-w-6xl px-4 pt-3">
        <div className="flex items-center rounded-full bg-[var(--fill-subtle)] p-0.5 text-xs font-semibold">
          {(["learner", "manager"] as const).map((r) => (
            <button
              key={r}
              onClick={() => switchRole(r)}
              className={[
                "flex-1 rounded-full px-3 py-1.5 transition-colors",
                role === r ? "bg-[var(--koc-blue)] text-white" : "text-[var(--text-muted)]",
              ].join(" ")}
            >
              {t(r === "learner" ? "nav.learnerView" : "nav.managerView")}
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="fade-in" key={role}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
