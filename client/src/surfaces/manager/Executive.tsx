import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSession } from "../../app/session";
import { Card, StatTile, PageHeader, Badge } from "../../components/ui";
import { Icon } from "../../components/Icon";
import { buildExecutiveSummary, type RiskLevel } from "../../lib/workforce";

const RISK_TONE: Record<RiskLevel, "red" | "amber" | "green"> = {
  high: "red",
  medium: "amber",
  low: "green",
};

/** Strategic, leadership-facing roll-up: capability, readiness, compliance, risk. */
export function Executive() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { users, tracks, allProgress } = useSession();

  const s = useMemo(
    () => buildExecutiveSummary(users, tracks, allProgress),
    [users, tracks, allProgress],
  );

  const riskLabel: Record<RiskLevel, string> = {
    high: t("exec.riskHigh"),
    medium: t("exec.riskMedium"),
    low: t("exec.riskLow"),
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("exec.title")} subtitle={t("exec.subtitle", { department: t("app.department") })} />

      {/* Headline KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          tone="blue"
          icon={<Icon name="target" size={22} />}
          value={`${s.readiness}%`}
          label={t("exec.readiness")}
          onClick={() => navigate("/manager/competencies")}
        />
        <StatTile
          tone="teal"
          icon={<Icon name="clock" size={22} />}
          value={s.learningHours.toLocaleString()}
          label={t("exec.learningHours")}
          onClick={() => navigate("/manager/analytics")}
        />
        <StatTile
          tone={s.complianceRate >= 90 ? "green" : "amber"}
          icon={<Icon name="shield" size={22} />}
          value={`${s.complianceRate}%`}
          label={t("exec.compliance")}
          onClick={() => navigate("/manager/compliance")}
        />
        <StatTile
          tone={s.highRiskCount > 0 ? "rose" : "green"}
          icon={<Icon name="alert" size={22} />}
          value={s.highRiskCount}
          label={t("exec.knowledgeRisks")}
          onClick={() => navigate("/manager/risk")}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        {/* Team capability vs role targets */}
        <Card className="p-6">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-[var(--text)]">{t("exec.capability")}</h2>
            <button
              className="text-xs font-semibold text-[var(--koc-blue)] hover:underline"
              onClick={() => navigate("/manager/competencies")}
            >
              {t("exec.viewMatrix")}
            </button>
          </div>
          <p className="mb-5 text-xs text-[var(--text-muted)]">{t("exec.capabilityHint")}</p>
          <ul className="space-y-4">
            {s.byCompetency.map((c) => {
              const meets = c.level >= c.target;
              return (
                <li key={c.competency.id}>
                  <div className="mb-1.5 flex items-center justify-between gap-2 text-[13px]">
                    <span className="inline-flex min-w-0 items-center gap-1.5 font-medium text-[var(--text)]">
                      <Icon name={c.competency.icon} size={14} className="shrink-0 text-[var(--koc-sky)]" />
                      <span className="truncate">{c.competency.name}</span>
                    </span>
                    <span className="shrink-0 tabular-nums text-[var(--text-muted)]">
                      {c.level}% <span className="opacity-60">/ {c.target}%</span>
                    </span>
                  </div>
                  {/* Bar with a target marker */}
                  <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[var(--fill-strong)]">
                    <div
                      className="h-full rounded-full transition-[width] duration-700 ease-[var(--ease-out)]"
                      style={{
                        inlineSize: `${Math.max(2, c.level)}%`,
                        background: meets ? "var(--success)" : "var(--grad-brand)",
                      }}
                    />
                    <span
                      className="absolute top-1/2 h-3.5 w-0.5 -translate-y-1/2 rounded-full"
                      style={{ insetInlineStart: `calc(${c.target}% - 1px)`, background: "var(--koc-navy)" }}
                      title={t("exec.roleTarget", { pct: c.target })}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex items-center gap-4 text-[11px] text-[var(--text-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-4 rounded-full" style={{ background: "var(--grad-brand)" }} />
              {t("exec.legendCurrent")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3.5 w-0.5 rounded-full" style={{ background: "var(--koc-navy)" }} />
              {t("exec.legendTarget")}
            </span>
          </div>
        </Card>

        {/* Right column: knowledge risk + succession + compliance */}
        <div className="space-y-5">
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-[var(--text)]">{t("exec.topRisks")}</h2>
              <button
                className="text-xs font-semibold text-[var(--koc-blue)] hover:underline"
                onClick={() => navigate("/manager/risk")}
              >
                {t("exec.viewAll")}
              </button>
            </div>
            <ul className="space-y-3">
              {s.risks.slice(0, 3).map((r) => (
                <li key={r.competency.id} className="flex items-center gap-3">
                  <div
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                    style={{ background: "var(--fill-subtle)", color: "var(--koc-blue)" }}
                  >
                    <Icon name={r.competency.icon} size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-[var(--text)]">
                      {r.competency.name}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {t("exec.qualifiedCount", { count: r.qualifiedCount })}
                      {r.retirementExposed && ` · ${t("exec.retirementFlag")}`}
                    </div>
                  </div>
                  <Badge tone={RISK_TONE[r.level]}>{riskLabel[r.level]}</Badge>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
