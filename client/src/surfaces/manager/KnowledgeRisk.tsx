import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSession } from "../../app/session";
import { Card, PageHeader, Badge, StatTile } from "../../components/ui";
import { Icon } from "../../components/Icon";
import {
  buildKnowledgeRisk,
  type CompetencyRisk,
  type RiskLevel,
} from "../../lib/workforce";

const RISK_TONE: Record<RiskLevel, "red" | "amber" | "green"> = {
  high: "red",
  medium: "amber",
  low: "green",
};
const RISK_COLOR: Record<RiskLevel, string> = {
  high: "var(--danger)",
  medium: "var(--warning)",
  low: "var(--success)",
};

export function KnowledgeRisk() {
  const { t } = useTranslation();
  const { users, tracks, allProgress } = useSession();

  const risks = useMemo(
    () => buildKnowledgeRisk(users, tracks, allProgress),
    [users, tracks, allProgress],
  );

  const riskLabel: Record<RiskLevel, string> = {
    high: t("exec.riskHigh"),
    medium: t("exec.riskMedium"),
    low: t("exec.riskLow"),
  };

  const highCount = risks.filter((r) => r.level === "high").length;
  const soleCount = risks.filter((r) => r.soleHolder).length;
  const retireExposed = risks.filter((r) => r.retirementExposed).length;

  return (
    <div className="space-y-6">
      <PageHeader title={t("risk.title")} subtitle={t("risk.subtitle")} />

      <div className="grid grid-cols-3 gap-4">
        <StatTile tone="rose" icon={<Icon name="alert" size={22} />} value={highCount} label={t("risk.highRisk")} />
        <StatTile tone="amber" icon={<Icon name="users" size={22} />} value={soleCount} label={t("risk.soleHolders")} />
        <StatTile tone="orange" icon={<Icon name="hourglass" size={22} />} value={retireExposed} label={t("risk.retireExposed")} />
      </div>

      <ul className="space-y-4">
        {risks.map((r) => (
          <RiskCard key={r.competency.id} r={r} label={riskLabel[r.level]} />
        ))}
      </ul>
    </div>
  );

  function RiskCard({ r, label }: { r: CompetencyRisk; label: string }) {
    return (
      <li>
        <Card className="p-0 overflow-hidden">
          {/* Accent rail by risk level */}
          <div className="flex">
            <span className="w-1.5 shrink-0" style={{ background: RISK_COLOR[r.level] }} aria-hidden />
            <div className="min-w-0 flex-1 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: "var(--fill-subtle)", color: "var(--koc-blue)" }}>
                    <Icon name={r.competency.icon} size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-[var(--text)]">{r.competency.name}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                      <span>{t("risk.criticality", { n: r.competency.criticality })}</span>
                      <span aria-hidden>·</span>
                      <span>{t("risk.coverageLine", { pct: r.coverage })}</span>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <Badge tone={RISK_TONE[r.level]}>{label}</Badge>
                  <span className="text-[11px] font-semibold tabular-nums text-[var(--text-muted)]">
                    {t("risk.riskScore", { n: r.score })}
                  </span>
                </div>
              </div>

              {/* Qualified holders */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-[var(--text-muted)]">
                  {t("risk.qualified", { count: r.qualifiedCount })}
                </span>
                {r.qualifiedHolders.length === 0 ? (
                  <span className="text-xs text-[var(--danger)]">{t("risk.noneQualified")}</span>
                ) : (
                  r.qualifiedHolders.map((h) => (
                    <span
                      key={h.user.id}
                      className="inline-flex items-center gap-1.5 rounded-full py-1 ps-1 pe-2.5"
                      style={{ background: "var(--fill-subtle)" }}
                      title={`${h.user.name} · ${h.level}%`}
                    >
                      <span className="grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold" style={{ background: "var(--card)", color: "var(--koc-blue)" }}>
                        {h.user.initials}
                      </span>
                      <span className="text-[11px] font-medium text-[var(--text)]">{h.user.name.split(" ")[0]}</span>
                      {h.retiresSoon && <Icon name="hourglass" size={12} className="text-[var(--warning)]" />}
                    </span>
                  ))
                )}
              </div>

              {/* Callouts */}
              {r.soleHolder && (
                <div
                  className="mt-4 flex items-start gap-2.5 rounded-xl p-3 text-[13px]"
                  style={{ background: "var(--danger-soft)", color: "#b23a3a" }}
                >
                  <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
                  <span>
                    {t("risk.soleHolderWarn", {
                      name: r.soleHolder.name,
                      competency: r.competency.name,
                    })}
                  </span>
                </div>
              )}
              {!r.soleHolder && r.retirementExposed && (
                <div
                  className="mt-4 flex items-start gap-2.5 rounded-xl p-3 text-[13px]"
                  style={{ background: "var(--warning-soft)", color: "#8a6410" }}
                >
                  <Icon name="hourglass" size={16} className="mt-0.5 shrink-0" />
                  <span>{t("risk.retirementWarn", { competency: r.competency.name })}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </li>
    );
  }
}
