import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSession } from "../../app/session";
import { ProgressRing } from "../../components/ProgressRing";
import { Card, ProgressBar, StatTile, Sheet, Button, Badge } from "../../components/ui";
import { Icon } from "../../components/Icon";
import { deriveTrackProgress, overallPercent } from "../../lib/progress";
import { rankProgress, rankName } from "../../lib/rank";
import { trackTitle, dayLabel, isBusinessDay } from "../../lib/format";
import { useActivity } from "../../hooks/useActivity";
import { DevelopmentPath } from "./DevelopmentPath";

type StatKey = "rank" | "inProgress" | "streak" | "department";

export function Overview() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { learner, tracks, myProgress } = useSession();
  const allActivity = useActivity(learner?.id);
  // KOC work week is Sunday–Thursday; weekend days don't count toward streak/activity.
  const activity = allActivity.filter((d) => isBusinessDay(d.dayIndex));
  const [openStat, setOpenStat] = useState<StatKey | null>(null);
  const [hoverBar, setHoverBar] = useState<number | null>(null);

  const assigned = useMemo(
    () => tracks.filter((tk) => learner?.assignedTrackIds.includes(tk.id)),
    [tracks, learner],
  );

  const perTrack = useMemo(
    () => assigned.map((tk) => deriveTrackProgress(tk, myProgress)),
    [assigned, myProgress],
  );

  if (!learner) return null;

  const overall = overallPercent(assigned, myProgress);
  const tracksDone = perTrack.filter((p) => p.percent === 100).length;
  const modulesDone = perTrack.reduce((s, p) => s + p.completed, 0);
  const modulesTotal = perTrack.reduce((s, p) => s + p.total, 0);
  const inProgress = perTrack.filter((p) => p.percent > 0 && p.percent < 100);
  const weekTotal = activity.reduce((s, d) => s + d.minutes, 0);
  const activeDays = activity.filter((d) => d.minutes > 0).length;
  const rank = rankProgress(learner.points, learner.rank);
  const fmtNum = (n: number) => n.toLocaleString("en-US");

  const chartData = activity.map((d) => ({
    day: dayLabel(d.dayIndex),
    mins: d.minutes,
  }));
  const maxMins = Math.max(1, ...activity.map((d) => d.minutes));

  const summaryMetrics = [
    { value: fmtNum(learner.points), label: t("overview.points") },
    { value: `${tracksDone}/${assigned.length}`, label: t("overview.tracksDone") },
    { value: `${modulesDone}/${modulesTotal}`, label: t("overview.modulesDone") },
  ];

  return (
    <div className="space-y-7">
      {/* Greeting, calm large title, no gradient chrome */}
      <header>
        <h1 className="text-[28px] font-bold leading-tight text-[var(--text)]">
          {t("overview.welcome", { name: learner.name.split(" ")[0] })}
        </h1>
        <p className="mt-1.5 text-[15px] text-[var(--text-secondary)]">
          {t("overview.streak", { count: learner.streak })}
        </p>
      </header>

      {/* Summary, living KOC-blue hero: ring + key metrics on a soft gradient */}
      <Card className="brand-hero p-6 sm:p-7">
        <div className="flex flex-col items-center gap-7 sm:flex-row sm:items-center sm:gap-8">
          <div className="flex flex-col items-center gap-2 text-[var(--koc-blue)]">
            <ProgressRing
              value={overall}
              size={104}
              stroke={9}
              color="var(--koc-blue)"
              trackColor="rgba(10,74,159,0.14)"
            />
            <span className="text-[13px] font-medium text-[var(--text-secondary)]">
              {t("overview.overallProgress")}
            </span>
          </div>
          <div className="grid flex-1 grid-cols-3 gap-0">
            {summaryMetrics.map((m, i) => (
              <div
                key={i}
                className={[
                  "text-center sm:text-start",
                  i > 0 ? "border-s border-[var(--separator)] ps-4 sm:ps-6" : "",
                ].join(" ")}
              >
                <div className="text-[26px] font-semibold leading-none tracking-[-0.02em] text-[var(--text)]">
                  {m.value}
                </div>
                <div className="mt-1.5 text-[13px] text-[var(--text-muted)]">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Stat tiles, a lively, curated accent set led by KOC blue */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            tone: "amber" as const,
            icon: "trophy",
            value: rankName(rank.current),
            label: t("overview.rank"),
            stat: "rank" as const,
          },
          {
            tone: "blue" as const,
            icon: "book",
            value: inProgress.length,
            label: t("common.inProgress"),
            stat: "inProgress" as const,
          },
          {
            tone: "orange" as const,
            icon: "flame",
            value: `${learner.streak}`,
            label: t("manager.streakLabel"),
            stat: "streak" as const,
          },
          {
            tone: "teal" as const,
            icon: "reservoir",
            value: t("app.department"),
            label: t("overview.department"),
            stat: "department" as const,
          },
        ].map((s, i) => (
          <div key={s.stat} className="rise-in" style={{ animationDelay: `${i * 70}ms` }}>
            <StatTile
              tone={s.tone}
              icon={<Icon name={s.icon} size={20} />}
              value={s.value}
              label={s.label}
              onClick={() => setOpenStat(s.stat)}
            />
          </div>
        ))}
      </div>

      {/* AI development path, role-aware recommendations + competency snapshot */}
      <DevelopmentPath learner={learner} />

      {/* Activity + continue learning */}
      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <Card className="flex flex-col p-6">
          <h2 className="mb-5 text-[15px] font-semibold text-[var(--text)]">{t("overview.thisWeek")}</h2>
          <div className="flex items-stretch gap-2" style={{ blockSize: 176 }}>
            {chartData.map((d, i) => {
              const pct = maxMins > 0 ? (d.mins / maxMins) * 100 : 0;
              return (
                <div
                  key={i}
                  className="flex flex-1 cursor-default flex-col items-center gap-2"
                  onMouseEnter={() => setHoverBar(i)}
                  onMouseLeave={() => setHoverBar((cur) => (cur === i ? null : cur))}
                >
                  <div className="relative flex w-full flex-1 items-end justify-center">
                    {hoverBar === i && (
                      <div
                        className="pointer-events-none absolute bottom-full z-10 mb-1.5 whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-medium text-white shadow-lg"
                        style={{ background: "var(--koc-navy)" }}
                      >
                        {d.mins} {t("common.minutes")}
                      </div>
                    )}
                    <div
                      className="w-full max-w-[26px] rounded-t-[7px]"
                      style={{
                        blockSize: d.mins > 0 ? `${pct}%` : "3px",
                        minBlockSize: d.mins > 0 ? 8 : 3,
                        background: d.mins > 0 ? "var(--grad-bar)" : "var(--fill-strong)",
                        boxShadow:
                          d.mins > 0 ? "0 3px 9px color-mix(in srgb, var(--koc-blue) 14%, transparent)" : "none",
                        transition: "block-size 0.6s var(--ease-out)",
                      }}
                    />
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)]">{d.day}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-center text-xs text-[var(--text-muted)]">
            {t("overview.totalThisWeek", { count: weekTotal })}
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-[15px] font-semibold text-[var(--text)]">{t("overview.continueLearning")}</h2>
          {inProgress.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">{t("overview.nothingInProgress")}</p>
          ) : (
            <ul className="divide-y divide-[var(--separator)]">
              {inProgress.map((p) => (
                <li key={p.track.id}>
                  <button
                    onClick={() => navigate(`/tracks/${p.track.id}`)}
                    className="flex w-full items-center gap-4 py-3 text-start hover:opacity-80 transition-opacity"
                  >
                    <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-[var(--fill-subtle)] text-[var(--koc-blue)]">
                      <Icon name={p.track.icon} size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 truncate text-sm font-semibold">
                        {trackTitle(p.track)}
                      </div>
                      <ProgressBar value={p.percent} />
                    </div>
                    <div className="flex-shrink-0 text-sm font-bold text-[var(--koc-blue)]">
                      {p.percent}%
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Sheet
        open={openStat !== null}
        onClose={() => setOpenStat(null)}
        title={
          openStat && (
            <div>
              <h2 className="text-base font-bold text-[var(--text)]">
                {openStat === "rank" && t("statDetail.rankTitle")}
                {openStat === "inProgress" && t("statDetail.inProgressTitle")}
                {openStat === "streak" && t("statDetail.streakTitle")}
                {openStat === "department" && t("statDetail.departmentTitle")}
              </h2>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                {openStat === "rank" && t("statDetail.rankSubtitle")}
                {openStat === "inProgress" &&
                  t("statDetail.inProgressSubtitle", { count: inProgress.length })}
                {openStat === "streak" && t("statDetail.streakSubtitle")}
                {openStat === "department" && t("statDetail.departmentSubtitle")}
              </p>
            </div>
          )
        }
      >
        {/* Rank progression */}
        {openStat === "rank" && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-[var(--fill-subtle)] p-3">
                <div className="text-[11px] text-[var(--text-muted)]">
                  {t("statDetail.previousRank")}
                </div>
                <div className="mt-1 text-sm font-semibold text-[var(--text)]">
                  {rank.previous ? rankName(rank.previous) : "-"}
                </div>
              </div>
              <div
                className="rounded-xl p-3 text-white"
                style={{ background: "var(--tint)" }}
              >
                <div className="text-[11px] opacity-90">{t("statDetail.currentRank")}</div>
                <div className="mt-1 text-sm font-semibold">{rankName(rank.current)}</div>
              </div>
              <div className="rounded-xl bg-[var(--fill-subtle)] p-3">
                <div className="text-[11px] text-[var(--text-muted)]">
                  {t("statDetail.nextRank")}
                </div>
                <div className="mt-1 text-sm font-semibold text-[var(--text)]">
                  {rank.next ? rankName(rank.next) : t("statDetail.maxRank")}
                </div>
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
                <span style={{ color: "var(--tint)" }}>
                  {t("statDetail.pointsLabel", { points: fmtNum(learner.points) })}
                </span>
                {rank.next && (
                  <span className="text-[var(--text-muted)]">
                    {t("statDetail.pointsLabel", { points: fmtNum(rank.next.min) })}
                  </span>
                )}
              </div>
              <ProgressBar value={rank.percent} />
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                {rank.next
                  ? t("statDetail.pointsToNext", {
                      points: fmtNum(rank.pointsToNext),
                      rank: rankName(rank.next),
                    })
                  : t("statDetail.atTop")}
              </p>
            </div>
          </div>
        )}

        {/* In-progress tracks */}
        {openStat === "inProgress" && (
          <div className="space-y-4">
            {inProgress.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">
                {t("statDetail.inProgressEmpty")}
              </p>
            ) : (
              <ul className="divide-y divide-[var(--separator)]">
                {inProgress.map((p) => (
                  <li key={p.track.id}>
                    <button
                      onClick={() => {
                        setOpenStat(null);
                        navigate(`/tracks/${p.track.id}`);
                      }}
                      className="flex w-full items-center gap-4 py-3 text-start hover:opacity-80 transition-opacity"
                    >
                      <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-[var(--fill-subtle)] text-[var(--koc-blue)]">
                        <Icon name={p.track.icon} size={22} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1.5 flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-semibold">
                            {trackTitle(p.track)}
                          </span>
                          <span className="flex-shrink-0 text-xs text-[var(--text-muted)]">
                            {p.completed}/{p.total} {t("common.modules")}
                          </span>
                        </div>
                        <ProgressBar value={p.percent} />
                      </div>
                      <div className="flex-shrink-0 text-sm font-bold text-[var(--koc-blue)]">
                        {p.percent}%
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                setOpenStat(null);
                navigate("/tracks");
              }}
            >
              {t("statDetail.viewAllTracks")}
            </Button>
          </div>
        )}

        {/* Streak detail */}
        {openStat === "streak" && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div
                className="grid h-12 w-12 place-items-center rounded-xl"
                style={{ background: "rgba(232,93,4,.12)", color: "#e85d04" }}
              >
                <Icon name="flame" size={26} />
              </div>
              <div>
                <div className="text-lg font-bold text-[var(--text)]">
                  {t("statDetail.streakCount", { count: learner.streak })}
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  {t("statDetail.streakActiveDays", { count: activeDays })}
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-xs font-bold text-[var(--text-muted)]">
                {t("statDetail.streakThisWeek")}
              </h3>
              <div className="flex justify-between gap-1.5">
                {activity.map((d) => (
                  <div key={d.dayIndex} className="flex flex-1 flex-col items-center gap-1.5">
                    <div
                      className="grid h-9 w-full place-items-center rounded-lg text-xs font-semibold"
                      style={
                        d.minutes > 0
                          ? { background: "rgba(232,93,4,.14)", color: "#e85d04" }
                          : { background: "var(--fill-subtle)", color: "var(--text-muted)" }
                      }
                    >
                      {d.minutes > 0 ? <Icon name="flame" size={16} /> : "·"}
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {dayLabel(d.dayIndex)}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-center text-xs text-[var(--text-muted)]">
                {t("statDetail.streakMinutes", { count: weekTotal })}
              </p>
            </div>
          </div>
        )}

        {/* Department */}
        {openStat === "department" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="grid h-12 w-12 place-items-center rounded-xl"
                style={{
                  background: "color-mix(in srgb, var(--koc-sky) 12%, transparent)",
                  color: "var(--koc-sky)",
                }}
              >
                <Icon name="reservoir" size={26} />
              </div>
              <div>
                <div className="text-base font-bold text-[var(--text)]">
                  {t("app.department")}
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  {t("app.discipline")}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-[var(--fill-subtle)] p-3">
                <div className="text-lg font-bold text-[var(--koc-blue)]">
                  {assigned.length}
                </div>
                <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                  {t("statDetail.deptAssignedTracks")}
                </div>
              </div>
              <div className="rounded-xl bg-[var(--fill-subtle)] p-3">
                <div className="text-lg font-bold text-[var(--success)]">{tracksDone}</div>
                <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                  {t("statDetail.deptTracksDone")}
                </div>
              </div>
              <div className="rounded-xl bg-[var(--fill-subtle)] p-3">
                <div className="text-lg font-bold text-[var(--koc-sky)]">{overall}%</div>
                <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                  {t("statDetail.deptOverall")}
                </div>
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
                <Badge tone="sky">{t("statDetail.deptOverall")}</Badge>
                <span className="text-[var(--koc-sky)]">{overall}%</span>
              </div>
              <ProgressBar value={overall} />
            </div>

            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                setOpenStat(null);
                navigate("/explore");
              }}
            >
              {t("statDetail.browseResources")}
            </Button>
          </div>
        )}
      </Sheet>
    </div>
  );
}
