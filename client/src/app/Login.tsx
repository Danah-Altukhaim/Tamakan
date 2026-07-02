import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useSession } from "./session";
import { Icon } from "../components/Icon";
import type { Role } from "../data/types";

/** Full Tamakan wordmark (blue) — sits on the login's white backdrop. */
function Mark() {
  return (
    <img
      src="/tamakan-logo.png"
      alt="Tamakan"
      className="object-contain"
      style={{ blockSize: 72, inlineSize: "auto" }}
    />
  );
}

/** Demo bypass card — one per role. Role only; the user's name shows post-login. */
function DemoCard({
  role,
  onEnter,
}: {
  role: Role;
  onEnter: () => void;
}) {
  const { t } = useTranslation();
  const label = role === "learner" ? t("login.enterAsLearner") : t("login.enterAsManager");
  const sublabel = role === "learner" ? t("nav.learnerView") : t("nav.managerView");

  return (
    <button
      type="button"
      onClick={onEnter}
      className="group flex w-full items-center gap-3 rounded-2xl border border-[var(--separator)] bg-[var(--card)] p-3 text-start transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-raised)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--koc-blue)]"
    >
      <div
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-lg"
        style={{ background: "var(--koc-sand)", color: "var(--koc-navy)" }}
        aria-hidden
      >
        <Icon name={role === "learner" ? "graduation" : "dashboard"} size={22} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-[var(--text)]">{label}</div>
        <div className="truncate text-xs text-[var(--text-muted)]">{sublabel}</div>
      </div>
      <span
        className="text-[var(--text-muted)] transition-colors group-hover:text-[var(--koc-blue)]"
        aria-hidden
      >
        <Icon name="chevron" size={18} className="rotate-180" />
      </span>
    </button>
  );
}

export function Login() {
  const { t } = useTranslation();
  const { login } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // SSO is stubbed (PRD §13.5): any credentials drop into the learner view.
  function onSubmit(e: FormEvent) {
    e.preventDefault();
    login("learner");
  }

  return (
    <div
      className="grid min-h-screen place-items-center px-4 py-10"
      style={{ background: "var(--card)" }}
    >
      <div className="w-full max-w-sm">
        {/* Brand header */}
        <div className="mb-7 flex flex-col items-center text-center">
          <Mark />
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-[var(--text)]">
            {t("login.welcome")}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {t("login.subtitle")}
          </p>
        </div>

        {/* Auth card */}
        <div className="rounded-3xl border border-[var(--separator)] bg-[var(--card)] p-6 shadow-[var(--shadow-sheet)]">
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-[var(--text-muted)]">
                {t("login.emailLabel")}
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("login.emailPlaceholder")}
                className="w-full rounded-xl border border-[var(--separator)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--text)] outline-none transition-shadow focus:border-[var(--koc-blue)] focus:ring-2 focus:ring-[var(--fill-subtle)]"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-[var(--text-muted)]">
                {t("login.passwordLabel")}
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("login.passwordPlaceholder")}
                className="w-full rounded-xl border border-[var(--separator)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--text)] outline-none transition-shadow focus:border-[var(--koc-blue)] focus:ring-2 focus:ring-[var(--fill-subtle)]"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-xl bg-[var(--koc-blue)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--koc-navy)]"
            >
              {t("login.signIn")}
            </button>
          </form>
          <p className="mt-2 text-center text-[11px] text-[var(--text-muted)]">
            {t("login.ssoNote")}
          </p>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-[var(--separator)]" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              {t("login.demoDivider")}
            </span>
            <span className="h-px flex-1 bg-[var(--separator)]" />
          </div>

          {/* Demo bypass */}
          <div className="space-y-2.5">
            <DemoCard role="learner" onEnter={() => login("learner")} />
            <DemoCard role="manager" onEnter={() => login("manager")} />
          </div>
          <p className="mt-3 text-center text-[11px] text-[var(--text-muted)]">
            {t("login.demoNote")}
          </p>
        </div>
      </div>
    </div>
  );
}
