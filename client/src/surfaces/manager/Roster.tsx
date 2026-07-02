import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSession } from "../../app/session";
import { Card, Badge, ProgressBar, PageHeader, Sheet } from "../../components/ui";
import { ProgressRing } from "../../components/ProgressRing";
import { buildRoster, type LearnerStatus, type TeamMember } from "../../lib/manager";
import { deriveTrackProgress } from "../../lib/progress";
import { trackTitle } from "../../lib/format";

const STATUS_TONE: Record<LearnerStatus, "green" | "red" | "gray"> = {
  "on-track": "green",
  "at-risk": "red",
  idle: "gray",
};

export function Roster() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { users, tracks, allProgress } = useSession();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rows = useMemo(
    () => buildRoster(users, tracks, allProgress).sort((a, b) => b.percent - a.percent),
    [users, tracks, allProgress],
  );

  const selected = useMemo(
    () => rows.find((r) => r.user.id === selectedId) ?? null,
    [rows, selectedId],
  );

  const statusLabel: Record<LearnerStatus, string> = {
    "on-track": t("manager.onTrack"),
    "at-risk": t("manager.atRisk"),
    idle: t("manager.idle"),
  };

  function lastActive(days: number) {
    return days === 0 ? t("manager.today") : t("manager.daysAgo", { count: days });
  }

  return (
    <div>
      <PageHeader
        title={t("manager.teamTitle")}
        subtitle={t("manager.teamSubtitle", {
          count: rows.length,
          department: t("app.department"),
        })}
      />

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-[var(--separator)] text-start text-xs uppercase tracking-wide text-[var(--text-muted)]">
                <th className="px-5 py-3 text-start font-semibold">{t("manager.engineer")}</th>
                <th className="px-5 py-3 text-start font-semibold">{t("manager.progress")}</th>
                <th className="px-5 py-3 text-start font-semibold">{t("manager.currentTrack")}</th>
                <th className="px-5 py-3 text-start font-semibold">{t("manager.lastActive")}</th>
                <th className="px-5 py-3 text-start font-semibold">{t("manager.status")}</th>
                <th className="px-5 py-3" aria-hidden="true" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.user.id}
                  onClick={() => setSelectedId(r.user.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedId(r.user.id);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={t("manager.viewEngineer", {
                    name: lang === "ar" ? r.user.nameAr : r.user.name,
                  })}
                  className="cursor-pointer border-b border-[var(--separator)] last:border-0 hover:bg-[var(--fill-subtle)] focus:outline-none focus-visible:bg-[var(--fill-subtle)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--koc-blue)]"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full text-xs font-bold"
                        style={{ background: "var(--fill-subtle)", color: "var(--koc-blue)" }}
                      >
                        {r.user.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold">
                          {lang === "ar" ? r.user.nameAr : r.user.name}
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">{r.user.jobTitle}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-24">
                        <ProgressBar value={r.percent} />
                      </div>
                      <span className="text-xs font-bold text-[var(--koc-blue)]">
                        {r.percent}%
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[var(--text-muted)]">
                    {r.currentTrack ? trackTitle(r.currentTrack, lang) : t("manager.none")}
                  </td>
                  <td className="px-5 py-3 text-[var(--text-muted)]">
                    {lastActive(r.daysInactive)}
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={STATUS_TONE[r.status]}>{statusLabel[r.status]}</Badge>
                  </td>
                  <td className="px-5 py-3 text-[var(--text-muted)]">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                      className="opacity-60 rtl:-scale-x-100"
                    >
                      <path
                        d="M6 3l5 5-5 5"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Sheet
        open={selected != null}
        onClose={() => setSelectedId(null)}
        title={
          selected && (
            <div className="flex items-center gap-3">
              <div
                className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full text-sm font-bold"
                style={{ background: "var(--fill-subtle)", color: "var(--koc-blue)" }}
              >
                {selected.user.initials}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-[var(--text)]">
                  {lang === "ar" ? selected.user.nameAr : selected.user.name}
                </h2>
                <p className="text-xs text-[var(--text-muted)]">{selected.user.jobTitle}</p>
              </div>
            </div>
          )
        }
      >
        {selected && (
          <EngineerDetail member={selected} lastActiveLabel={lastActive(selected.daysInactive)} />
        )}
      </Sheet>
    </div>
  );
}

function EngineerDetail({
  member,
  lastActiveLabel,
}: {
  member: TeamMember;
  lastActiveLabel: string;
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { tracks, allProgress } = useSession();

  const mine = useMemo(
    () => allProgress.filter((p) => p.userId === member.user.id),
    [allProgress, member.user.id],
  );
  const assigned = useMemo(
    () =>
      tracks
        .filter((tr) => member.user.assignedTrackIds.includes(tr.id))
        .map((tr) => deriveTrackProgress(tr, mine))
        .sort((a, b) => b.percent - a.percent),
    [tracks, member.user.assignedTrackIds, mine],
  );

  const statusTone = STATUS_TONE[member.status];
  const statusText =
    member.status === "on-track"
      ? t("manager.onTrack")
      : member.status === "at-risk"
        ? t("manager.atRisk")
        : t("manager.idle");

  const stats: { label: string; value: string }[] = [
    { label: t("manager.lastActive"), value: lastActiveLabel },
    { label: t("overview.points"), value: member.user.points.toLocaleString() },
    { label: t("manager.streakLabel"), value: t("manager.streakDays", { count: member.user.streak }) },
    { label: t("overview.rank"), value: member.user.rank },
  ];

  return (
    <div>
      {/* Summary: ring + status + key stats */}
      <div className="flex items-center gap-5">
        <div
          className="flex-shrink-0 rounded-2xl p-3 text-white"
          style={{ background: "var(--koc-blue)" }}
        >
          <ProgressRing value={member.percent} size={84} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2">
            <Badge tone={statusTone}>{statusText}</Badge>
          </div>
          <p className="text-sm text-[var(--text-muted)]">
            {t("manager.overallLine", { percent: member.percent })}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-[var(--separator)] bg-[var(--fill-subtle)] px-4 py-3"
          >
            <div className="text-xs text-[var(--text-muted)]">{s.label}</div>
            <div className="mt-0.5 font-semibold text-[var(--text)]">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Per-track breakdown */}
      <h3 className="mt-6 mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
        {t("manager.trackBreakdown")}
      </h3>
      {assigned.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">{t("manager.noTracks")}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {assigned.map((tp) => {
            const done = tp.percent === 100;
            return (
              <li
                key={tp.track.id}
                className="rounded-xl border border-[var(--separator)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-[var(--text)]">
                      {trackTitle(tp.track, lang)}
                    </div>
                    <div className="mt-0.5 text-xs text-[var(--text-muted)]">
                      {t("tracks.completeCount", { done: tp.completed, total: tp.total })}
                    </div>
                  </div>
                  <span
                    className="text-sm font-bold"
                    style={{ color: done ? "var(--success)" : "var(--koc-blue)" }}
                  >
                    {tp.percent}%
                  </span>
                </div>
                <div className="mt-3">
                  <ProgressBar value={tp.percent} tone={done ? "green" : "blue"} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
