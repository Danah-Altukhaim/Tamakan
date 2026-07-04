import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import type { User } from "../../data/types";
import { useSession } from "../../app/session";
import { Card, Badge } from "../../components/ui";
import { Icon } from "../../components/Icon";
import {
  recommendTracks,
  competencyProfile,
  type RecReason,
} from "../../lib/workforce";
import { trackTitle } from "../../lib/format";

const REASON_TONE: Record<RecReason, "blue" | "amber" | "sky"> = {
  continue: "blue",
  gap: "amber",
  prerequisite: "sky",
};

/**
 * Role-aware "AI" next-best-action panel for a learner: continue in-progress
 * work, then close the widest competency gaps for their role, plus a compact
 * competency snapshot (current vs role target).
 */
export function DevelopmentPath({ learner }: { learner: User }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { tracks, allProgress } = useSession();

  const recs = useMemo(
    () => recommendTracks(learner, tracks, allProgress),
    [learner, tracks, allProgress],
  );
  const profile = useMemo(
    () => competencyProfile(learner, tracks, allProgress).filter((c) => c.assigned || c.target > 0),
    [learner, tracks, allProgress],
  );

  const reasonText: Record<RecReason, string> = {
    continue: t("path.reasonContinue"),
    gap: t("path.reasonGap"),
    prerequisite: t("path.reasonPrereq"),
  };

  return (
    <Card className="p-6">
      <div className="mb-1 flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg" style={{ background: "color-mix(in srgb, var(--koc-blue) 12%, transparent)", color: "var(--koc-blue)" }}>
          <Icon name="assistant" size={16} />
        </span>
        <h2 className="text-[15px] font-semibold text-[var(--text)]">{t("path.title")}</h2>
      </div>
      <p className="mb-5 text-xs text-[var(--text-muted)]">
        {t("path.subtitle", { role: learner.jobTitle })}
      </p>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        {/* Recommendations */}
        <div>
          {recs.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">{t("path.allDone")}</p>
          ) : (
            <ol className="space-y-2.5">
              {recs.map((r, i) => (
                <li key={r.track.id}>
                  <button
                    onClick={() => navigate(`/tracks/${r.track.id}`)}
                    className="group flex w-full items-center gap-3 rounded-xl border border-[var(--separator)] p-3 text-start transition-colors hover:border-[var(--separator-strong)] hover:bg-[var(--fill-subtle)]"
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold" style={{ background: "var(--fill-subtle)", color: "var(--koc-blue)" }}>
                      {i + 1}
                    </span>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--fill-subtle)] text-[var(--koc-blue)]">
                      <Icon name={r.track.icon} size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="mb-1 flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-[var(--text)]">{trackTitle(r.track)}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <Badge tone={REASON_TONE[r.reason]}>{reasonText[r.reason]}</Badge>
                        <span className="truncate text-[11px] text-[var(--text-muted)]">{r.competency.name}</span>
                      </span>
                    </span>
                    <span className="shrink-0 text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5">
                      <Icon name="chevron" size={16} className="rotate-180" />
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Competency snapshot */}
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            {t("path.competencies")}
          </h3>
          <ul className="space-y-3">
            {profile.map((c) => {
              const meets = c.level >= c.target;
              return (
                <li key={c.competency.id}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-[12px]">
                    <span className="inline-flex min-w-0 items-center gap-1.5 text-[var(--text)]">
                      <Icon name={c.competency.icon} size={12} className="shrink-0 text-[var(--koc-sky)]" />
                      <span className="truncate">{c.competency.short}</span>
                    </span>
                    <span className="shrink-0 tabular-nums text-[var(--text-muted)]">{c.level}%</span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-[var(--fill-strong)]">
                    <div
                      className="h-full rounded-full transition-[width] duration-700 ease-[var(--ease-out)]"
                      style={{ inlineSize: `${Math.max(2, c.level)}%`, background: meets ? "var(--success)" : "var(--grad-brand)" }}
                    />
                    {c.target > 0 && (
                      <span
                        className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 rounded-full"
                        style={{ insetInlineStart: `calc(${c.target}% - 1px)`, background: "var(--koc-navy)" }}
                        title={t("exec.roleTarget", { pct: c.target })}
                      />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Card>
  );
}
