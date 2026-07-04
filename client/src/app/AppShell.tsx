import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSession } from "./session";
import { Icon } from "../components/Icon";

/** Tamakan falcon + head mark, blue icon; the sidebar behind it is always white. */
function Mark() {
  return (
    <img
      src="/tamakan-icon.png"
      alt="Tamakan"
      className="shrink-0 object-contain"
      style={{ blockSize: 34, inlineSize: "auto" }}
    />
  );
}

const LEARNER_TABS = [
  { to: "/overview", key: "nav.overview", icon: "dashboard" },
  { to: "/tracks", key: "nav.myTracks", icon: "graduation" },
  { to: "/explore", key: "nav.explore", icon: "search" },
  { to: "/assistant", key: "nav.assistant", icon: "assistant" },
];
const MANAGER_TABS = [
  { to: "/manager/exec", key: "nav.executive", icon: "briefcase" },
  { to: "/manager/team", key: "nav.team", icon: "grid" },
  { to: "/manager/competencies", key: "nav.competencies", icon: "target" },
  { to: "/manager/risk", key: "nav.risk", icon: "alert" },
  { to: "/manager/compliance", key: "nav.compliance", icon: "shield" },
  { to: "/manager/gaps", key: "nav.gaps", icon: "layers" },
  { to: "/manager/analytics", key: "nav.analytics", icon: "chart-bar" },
  { to: "/assistant", key: "nav.assistant", icon: "assistant" },
];

export function AppShell() {
  const { t } = useTranslation();
  const { role, setRole, currentUser, logout } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("tamakan.sidebarCollapsed") === "1",
  );

  useEffect(() => {
    localStorage.setItem("tamakan.sidebarCollapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  // Keep role in sync with the URL so deep links to /manager/* show manager chrome.
  const inManagerArea = location.pathname.startsWith("/manager");
  useEffect(() => {
    if (inManagerArea && role !== "manager") setRole("manager");
  }, [inManagerArea, role, setRole]);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const tabs = inManagerArea || role === "manager" ? MANAGER_TABS : LEARNER_TABS;

  function switchRole(next: "learner" | "manager") {
    if (next === role) return;
    setRole(next);
    navigate(next === "manager" ? "/manager/exec" : "/overview");
  }

  function renderSidebar(isCollapsed: boolean) {
    return (
      <div className="flex h-full flex-col border-e border-[var(--separator)] text-[var(--text)]" style={{ background: "var(--card)" }}>
        {/* Brand + collapse toggle */}
        <div
          className={[
            "flex items-center pb-5 pt-5",
            isCollapsed ? "flex-col gap-3 px-3" : "gap-3 px-5",
          ].join(" ")}
        >
          <Mark />
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-base font-bold tracking-wide text-[var(--koc-navy)]">{t("app.name")}</div>
            </div>
          )}
          {/* Collapse toggle, desktop only */}
          <button
            onClick={() => setCollapsed((c) => !c)}
            title={t(isCollapsed ? "nav.expandSidebar" : "nav.collapseSidebar")}
            aria-label={t(isCollapsed ? "nav.expandSidebar" : "nav.collapseSidebar")}
            aria-expanded={!isCollapsed}
            className="hidden shrink-0 rounded-lg p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--fill-subtle)] hover:text-[var(--text)] lg:block"
          >
            <svg
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className={isCollapsed ? "rotate-180" : ""}
            >
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
        </div>

        {/* Primary navigation */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              title={isCollapsed ? t(tab.key) : undefined}
              className={({ isActive }) =>
                [
                  "relative flex items-center gap-3 rounded-xl py-2.5 text-sm font-semibold transition-colors",
                  isCollapsed ? "justify-center px-0" : "px-3",
                  isActive ? "bg-[var(--fill-subtle)] text-[var(--koc-blue)]" : "text-[var(--text-muted)] hover:bg-[var(--fill-subtle)] hover:text-[var(--text)]",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span
                      className="absolute start-0 inset-y-2 w-1 rounded-full"
                      style={{ background: "var(--grad-brand)" }}
                    />
                  )}
                  <Icon name={tab.icon} size={20} />
                  {!isCollapsed && <span>{t(tab.key)}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer: role switch + user + sign out */}
        <div className="border-t border-[var(--separator)] px-3 py-4">
          {/* Role switch (stands in for KOC SSO roles, PRD §13.5) */}
          {isCollapsed ? (
            <button
              onClick={() => switchRole(role === "learner" ? "manager" : "learner")}
              title={t(role === "learner" ? "nav.managerView" : "nav.learnerView")}
              aria-label={t(role === "learner" ? "nav.managerView" : "nav.learnerView")}
              className="mb-3 grid w-full place-items-center rounded-full bg-[var(--fill-subtle)] py-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--separator)] hover:text-[var(--text)]"
            >
              <Icon name={role === "learner" ? "grid" : "graduation"} size={18} />
            </button>
          ) : (
            <div className="mb-3 flex items-center rounded-full bg-[var(--fill-subtle)] p-0.5 text-xs font-semibold">
              {(["learner", "manager"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => switchRole(r)}
                  className={[
                    "flex-1 rounded-full px-3 py-1.5 transition-colors",
                    role === r
                      ? "bg-[image:var(--grad-brand)] text-white shadow-sm"
                      : "text-[var(--text-muted)] hover:text-[var(--text)]",
                  ].join(" ")}
                >
                  {t(r === "learner" ? "nav.learnerView" : "nav.managerView")}
                </button>
              ))}
            </div>
          )}

          {currentUser && (
            <div className={["flex items-center", isCollapsed ? "flex-col gap-2" : "gap-3 px-1"].join(" ")}>
              <div
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-semibold text-white shadow-[0_3px_10px_rgba(10,74,159,0.3)]"
                style={{ backgroundImage: "var(--grad-brand)" }}
                title={isCollapsed ? currentUser.name : undefined}
              >
                {currentUser.initials}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="truncate text-xs font-semibold text-[var(--text)]">{currentUser.name}</div>
                  <div className="truncate text-[11px] text-[var(--text-muted)]">
                    {currentUser.jobTitle}
                  </div>
                </div>
              )}
              <button
                onClick={logout}
                title={t("login.signOut")}
                aria-label={t("login.signOut")}
                className="shrink-0 rounded-full bg-[var(--fill-subtle)] p-2 text-[var(--text-muted)] hover:bg-[var(--separator)] hover:text-[var(--text)] transition-colors"
              >
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M15 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3M10 8l-4 4 4 4M6 12h11" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--surface)] text-[var(--text)]">
      {/* Desktop sidebar */}
      <aside
        className={[
          "sticky top-0 hidden h-screen shrink-0 transition-[width] duration-200 lg:block",
          collapsed ? "w-20" : "w-64",
        ].join(" ")}
      >
        {renderSidebar(collapsed)}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <aside className="absolute inset-y-0 start-0 w-64 shadow-2xl">
            {renderSidebar(false)}
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar with menu toggle */}
        <div
          className="sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--separator)] px-4 py-3 text-[var(--text)] lg:hidden"
          style={{ background: "var(--card)" }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--fill-subtle)] hover:text-[var(--text)] transition-colors"
          >
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <span className="text-base font-bold tracking-wide text-[var(--koc-navy)]">{t("app.name")}</span>
        </div>

        <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-8 sm:py-8">
          <div className="fade-in" key={role}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
