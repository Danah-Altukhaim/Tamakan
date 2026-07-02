import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useSession } from "../../app/session";
import { ProgressRing } from "../../components/ProgressRing";
import { Card, ProgressBar, StatTile, Sheet, Button, Badge } from "../../components/ui";
import { Icon } from "../../components/Icon";
import { deriveTrackProgress, overallPercent } from "../../lib/progress";
import { rankProgress, rankName } from "../../lib/rank";
import { trackTitle, dayLabel } from "../../lib/format";
import { useActivity } from "../../hooks/useActivity";

type StatKey = "rank" | "inProgress" | "streak" | "department";

export function Overview() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const navigate = useNavigate();
  const { learner, tracks, myProgress } = useSession();
  const activity = useActivity(learner?.id);
  const [openStat, setOpenStat] = useState<StatKey | null>(null);

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
  const fmtNum = (n: number) => n.toLocaleString(lang === "ar" ? "ar-EG" : "en-US");

  const chartData = activity.map((d) => ({
    day: dayLabel(d.dayIndex, lang),
    mins: d.minutes,
  }));

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div
        className="overflow-hidden rounded-2xl p-6 sm:p-8 text-white"
        style={{
          background: "linear-gradient(120deg, var(--koc-navy) 0%, var(--koc-blue) 100%)",
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold">
              {t("overview.welcome", { name: learner.name.split(" ")[0] })}
            </h1>
            <p className="mt-1 text-sm text-[var(--text-on-brand-muted)]">
              {t("overview.streak", { count: learner.streak })}
            </p>
            <div className="mt-5 flex flex-wrap gap-6">
              <div>
                <div className="text-2xl font-extrabold" style={{ color: "var(--koc-sand)" }}>
                  {learner.points.toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}
                </div>
                <div className="text-xs text-[var(--text-on-brand-muted)]">
                  {t("overview.points")}
                </div>
              </div>
              <div>
                <div className="text-2xl font-extrabold">
                  {tracksDone}/{assigned.length}
                </div>
                <div className="text-xs text-[var(--text-on-brand-muted)]">
                  {t("overview.tracksDone")}
                </div>
              </div>
              <div>
                <div className="text-2xl font-extrabold">
                  {modulesDone}/{modulesTotal}
                </div>
                <div className="text-xs text-[var(--text-on-brand-muted)]">
                  {t("overview.modulesDone")}
                </div>
              </div>
            </div>
          </div>
          <div className="text-center" style={{ color: "white" }}>
            <ProgressRing value={overall} size={112} stroke={9} />
            <div className="mt-2 text-xs text-[var(--text-on-brand-muted)]">
              {t("overview.overallProgress")}
            </div>
          </div>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          icon={<Icon name="trophy" size={22} />}
          value={rankName(rank.current, lang)}
          label={t("overview.rank")}
          accent="var(--koc-sand)"
          onClick={() => setOpenStat("rank")}
        />
        <StatTile
          icon={<Icon name="book" size={22} />}
          value={inProgress.length}
          label={t("common.inProgress")}
          accent="var(--koc-blue)"
          onClick={() => setOpenStat("inProgress")}
        />
        <StatTile
          icon={<Icon name="flame" size={22} />}
          value={`${learner.streak}`}
          label={t("manager.streakLabel")}
          accent="#e85d04"
          onClick={() => setOpenStat("streak")}
        />
        <StatTile
          icon={<Icon name="reservoir" size={22} />}
          value={t("app.department")}
          label={t("overview.department")}
          accent="var(--koc-sky)"
          onClick={() => setOpenStat("department")}
        />
      </div>

      {/* Activity + continue learning */}
      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <Card className="p-6">
          <h2 className="mb-4 text-sm font-bold">{t("overview.thisWeek")}</h2>
          <ResponsiveContainer width="100%" height={168}>
            <BarChart data={chartData} barSize={22}>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                axisLine={false}
                tickLine={false}
                reversed={lang === "ar"}
              />
              <YAxis hide />
              <Tooltip
                formatter={(v: number) => [`${v} ${t("common.minutes")}`, ""]}
                contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid var(--separator)" }}
                cursor={{ fill: "var(--fill-subtle)" }}
                isAnimationActive={false}
              />
              <Bar dataKey="mins" radius={[6, 6, 0, 0]}>
                {chartData.map((d, i) => (
                  <Cell key={i} fill={d.mins > 0 ? "var(--koc-blue)" : "var(--separator)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-2 text-center text-xs text-[var(--text-muted)]">
            {t("overview.totalThisWeek", { count: weekTotal })}
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-sm font-bold">{t("overview.continueLearning")}</h2>
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
                        {trackTitle(p.track, lang)}
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
                  {rank.previous ? rankName(rank.previous, lang) : "—"}
                </div>
              </div>
              <div
                className="rounded-xl p-3 text-white"
                style={{ background: "var(--koc-sand)" }}
              >
                <div className="text-[11px] opacity-90">{t("statDetail.currentRank")}</div>
                <div className="mt-1 text-sm font-bold">{rankName(rank.current, lang)}</div>
              </div>
              <div className="rounded-xl bg-[var(--fill-subtle)] p-3">
                <div className="text-[11px] text-[var(--text-muted)]">
                  {t("statDetail.nextRank")}
                </div>
                <div className="mt-1 text-sm font-semibold text-[var(--text)]">
                  {rank.next ? rankName(rank.next, lang) : t("statDetail.maxRank")}
                </div>
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
                <span style={{ color: "var(--koc-sand)" }}>
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
                      rank: rankName(rank.next, lang),
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
                            {trackTitle(p.track, lang)}
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
                      {dayLabel(d.dayIndex, lang)}
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
              <div className="text-base font-bold text-[var(--text)]">
                {t("app.department")}
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
