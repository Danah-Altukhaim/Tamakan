import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useSession } from "../../app/session";
import { Card, Badge, StatTile, PageHeader, ProgressBar } from "../../components/ui";
import { Icon } from "../../components/Icon";
import { buildRoster, trackAverage } from "../../lib/manager";
import { trackTitle } from "../../lib/format";

export function Analytics() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const navigate = useNavigate();
  const { users, tracks, allProgress } = useSession();

  const roster = useMemo(
    () => buildRoster(users, tracks, allProgress),
    [users, tracks, allProgress],
  );

  const avgCompletion = roster.length
    ? Math.round(roster.reduce((s, r) => s + r.percent, 0) / roster.length)
    : 0;
  const active = roster.filter((r) => r.status === "on-track").length;
  const atRisk = roster.filter((r) => r.status === "at-risk");
  const staleTracks = tracks.filter((tk) => tk.status !== "current");

  const byTrack = useMemo(
    () =>
      tracks
        .map((tk) => {
          const { percent, assignedCount } = trackAverage(tk, users, allProgress);
          return { id: tk.id, name: trackTitle(tk, lang), percent, assignedCount, status: tk.status };
        })
        .filter((d) => d.assignedCount > 0)
        .sort((a, b) => a.percent - b.percent),
    [tracks, users, allProgress, lang],
  );

  const statusBadge = (status: string) => {
    if (status === "review-due") return <Badge tone="amber">{t("manager.trackStatusReview")}</Badge>;
    if (status === "undocumented")
      return <Badge tone="red">{t("manager.trackStatusUndocumented")}</Badge>;
    return <Badge tone="green">{t("manager.trackStatusCurrent")}</Badge>;
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("manager.analyticsTitle")} subtitle={t("manager.analyticsSubtitle")} />

      {/* KPI tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          icon={<Icon name="trend-up" size={22} />}
          value={`${avgCompletion}%`}
          label={t("manager.avgCompletion")}
        />
        <StatTile
          icon={<Icon name="check-circle" size={22} />}
          value={active}
          label={t("manager.activeLearners")}
          accent="var(--success)"
        />
        <StatTile
          icon={<Icon name="alert" size={22} />}
          value={atRisk.length}
          label={t("manager.atRiskLearners")}
          accent="var(--danger)"
        />
        <StatTile
          icon={<Icon name="layers" size={22} />}
          value={staleTracks.length}
          label={t("manager.staleTracks")}
          accent="var(--koc-sand)"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        {/* Completion by track */}
        <Card className="p-6">
          <h2 className="mb-4 text-sm font-bold">{t("manager.completionByTrack")}</h2>
          <ResponsiveContainer width="100%" height={Math.max(240, byTrack.length * 30)}>
            <BarChart
              layout="vertical"
              data={byTrack}
              margin={{ left: 8, right: 24 }}
              barSize={14}
            >
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis
                type="category"
                dataKey="name"
                width={150}
                tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                axisLine={false}
                tickLine={false}
                orientation={lang === "ar" ? "right" : "left"}
              />
              <Tooltip
                formatter={(v: number) => [`${v}%`, t("manager.avgCompletion")]}
                contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid var(--separator)" }}
                cursor={{ fill: "var(--fill-subtle)" }}
              />
              <Bar dataKey="percent" radius={[0, 6, 6, 0]}>
                {byTrack.map((d) => (
                  <Cell
                    key={d.id}
                    fill={
                      d.percent < 35
                        ? "var(--danger)"
                        : d.percent < 70
                          ? "var(--koc-sand)"
                          : "var(--success)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* At-risk learners + stale tracks */}
        <div className="space-y-5">
          <Card className="p-6">
            <h2 className="mb-4 text-sm font-bold">{t("manager.atRiskList")}</h2>
            {atRisk.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">{t("manager.noRisk")}</p>
            ) : (
              <ul className="space-y-3">
                {atRisk.map((r) => (
                  <li key={r.user.id} className="flex items-center gap-3">
                    <div
                      className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full text-xs font-bold"
                      style={{ background: "var(--danger-soft)", color: "var(--danger)" }}
                    >
                      {r.user.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">
                        {lang === "ar" ? r.user.nameAr : r.user.name}
                      </div>
                      <div className="mt-1">
                        <ProgressBar value={r.percent} />
                      </div>
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">
                      {t("manager.daysAgo", { count: r.daysInactive })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-sm font-bold">{t("manager.staleTracks")}</h2>
            <ul className="space-y-2.5">
              {staleTracks.map((tk) => (
                <li key={tk.id} className="flex items-center justify-between gap-2">
                  <button
                    className="inline-flex items-center gap-1.5 truncate text-start text-sm hover:text-[var(--koc-blue)]"
                    onClick={() => navigate("/manager/gaps")}
                  >
                    <Icon name={tk.icon} size={15} className="shrink-0 text-[var(--koc-sky)]" />
                    {trackTitle(tk, lang)}
                  </button>
                  {statusBadge(tk.status)}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
