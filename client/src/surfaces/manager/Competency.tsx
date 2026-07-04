import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSession } from "../../app/session";
import { Card, PageHeader, Badge, Sheet } from "../../components/ui";
import { Icon } from "../../components/Icon";
import {
  buildCompetencyMatrix,
  buildKnowledgeRisk,
  type CompetencyLevel,
} from "../../lib/workforce";
import type { Competency } from "../../data/workforce";

/** Blue heat by proficiency; a red ring flags below the role's target. */
function cellVisual(c: CompetencyLevel): { bg: string; fg: string; ring: boolean } {
  if (!c.assigned) {
    return {
      bg: "repeating-linear-gradient(45deg,transparent,transparent 4px,var(--separator) 4px,var(--separator) 5px)",
      fg: "var(--locked)",
      ring: false,
    };
  }
  const alpha = 0.12 + (c.level / 100) * 0.82;
  return {
    bg: `rgba(10,74,159,${alpha.toFixed(2)})`,
    fg: c.level >= 55 ? "#fff" : "var(--koc-navy)",
    ring: c.level < c.target,
  };
}

export function Competency() {
  const { t } = useTranslation();
  const { users, tracks, allProgress } = useSession();
  const [openComp, setOpenComp] = useState<Competency | null>(null);

  const { competencies, learners, cell } = useMemo(
    () => buildCompetencyMatrix(users, tracks, allProgress),
    [users, tracks, allProgress],
  );
  const risks = useMemo(
    () => buildKnowledgeRisk(users, tracks, allProgress),
    [users, tracks, allProgress],
  );
  const riskByComp = useMemo(
    () => new Map(risks.map((r) => [r.competency.id, r] as const)),
    [risks],
  );

  return (
    <div className="space-y-5">
      <PageHeader title={t("competency.title")} subtitle={t("competency.subtitle")} />

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="border-separate border-spacing-1 p-3">
            <thead>
              <tr>
                <th className="sticky start-0 z-10 bg-[var(--card)] px-3 py-2 text-start text-xs font-semibold text-[var(--text-muted)]">
                  {t("competency.competencyCol")}
                </th>
                {learners.map((u) => (
                  <th
                    key={u.id}
                    className="px-1 py-2 text-center text-[11px] font-semibold text-[var(--text-muted)]"
                    title={`${u.name} · ${u.jobTitle}`}
                  >
                    <div
                      className="mx-auto grid h-7 w-7 place-items-center rounded-full"
                      style={{ background: "var(--fill-subtle)", color: "var(--koc-blue)" }}
                    >
                      {u.initials}
                    </div>
                  </th>
                ))}
                <th className="px-2 py-2 text-center text-[11px] font-semibold text-[var(--text-muted)]">
                  {t("competency.coverage")}
                </th>
              </tr>
            </thead>
            <tbody>
              {competencies.map((comp) => {
                const risk = riskByComp.get(comp.id);
                return (
                  <tr key={comp.id}>
                    <th className="sticky start-0 z-10 whitespace-nowrap bg-[var(--card)] px-3 py-1.5 text-start text-xs font-medium text-[var(--text)]">
                      <button
                        className="inline-flex items-center gap-1.5 hover:text-[var(--koc-blue)]"
                        onClick={() => setOpenComp(comp)}
                      >
                        <Icon name={comp.icon} size={14} className="shrink-0 text-[var(--koc-sky)]" />
                        {comp.name}
                      </button>
                    </th>
                    {learners.map((u) => {
                      const c = cell(comp.id, u.id);
                      const v = cellVisual(c);
                      return (
                        <td key={u.id} className="p-0">
                          <div
                            className="relative mx-auto grid h-9 w-12 place-items-center rounded-md text-[11px] font-semibold"
                            style={{
                              background: v.bg,
                              color: v.fg,
                              boxShadow: v.ring ? "inset 0 0 0 2px var(--danger)" : undefined,
                            }}
                            title={`${comp.name} · ${u.name}: ${c.assigned ? c.level + "%" : t("competency.notAssigned")}${c.assigned && c.level < c.target ? ` · ${t("competency.belowTarget", { pct: c.target })}` : ""}`}
                          >
                            {c.assigned ? `${c.level}` : ""}
                          </div>
                        </td>
                      );
                    })}
                    <td className="px-2">
                      <div className="grid place-items-center">
                        <Badge tone={risk && risk.coverage >= 50 ? "green" : risk && risk.coverage > 0 ? "amber" : "red"}>
                          {risk?.coverage ?? 0}%
                        </Badge>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)]">
        <div className="flex items-center gap-2">
          <span>0</span>
          <div className="h-3 w-28 rounded-full" style={{ background: "linear-gradient(90deg, rgba(10,74,159,.12), rgba(10,74,159,.94))" }} />
          <span>100</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-4 w-6 rounded" style={{ boxShadow: "inset 0 0 0 2px var(--danger)" }} />
          <span>{t("competency.belowRoleTarget")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-4 w-6 rounded" style={{ background: "repeating-linear-gradient(45deg,transparent,transparent 4px,var(--separator) 4px,var(--separator) 5px)" }} />
          <span>{t("competency.notAssigned")}</span>
        </div>
      </div>

      {/* Competency drilldown */}
      <Sheet
        open={openComp != null}
        onClose={() => setOpenComp(null)}
        title={
          openComp && (
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: "var(--fill-subtle)", color: "var(--koc-blue)" }}>
                <Icon name={openComp.icon} size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-[var(--text)]">{openComp.name}</h2>
                <p className="text-xs text-[var(--text-muted)]">
                  {t("competency.criticality", { n: openComp.criticality })}
                </p>
              </div>
            </div>
          )
        }
      >
        {openComp && (() => {
          const risk = riskByComp.get(openComp.id);
          const ranked = learners
            .map((u) => ({ u, c: cell(openComp.id, u.id) }))
            .filter((x) => x.c.assigned)
            .sort((a, b) => b.c.level - a.c.level);
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[var(--fill-subtle)] p-3">
                  <div className="text-[11px] text-[var(--text-muted)]">{t("competency.qualified")}</div>
                  <div className="mt-0.5 text-lg font-bold text-[var(--koc-blue)]">
                    {risk?.qualifiedCount ?? 0}
                    <span className="text-xs font-medium text-[var(--text-muted)]"> / {learners.length}</span>
                  </div>
                </div>
                <div className="rounded-xl bg-[var(--fill-subtle)] p-3">
                  <div className="text-[11px] text-[var(--text-muted)]">{t("competency.coverage")}</div>
                  <div className="mt-0.5 text-lg font-bold text-[var(--koc-sky)]">{risk?.coverage ?? 0}%</div>
                </div>
              </div>
              <ul className="divide-y divide-[var(--separator)]">
                {ranked.map(({ u, c }) => (
                  <li key={u.id} className="flex items-center gap-3 py-2.5">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold" style={{ background: "var(--fill-subtle)", color: "var(--koc-blue)" }}>
                      {u.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-[var(--text)]">{u.name}</div>
                      <div className="text-xs text-[var(--text-muted)]">{u.jobTitle}</div>
                    </div>
                    <div className="text-end">
                      <div className="text-sm font-bold" style={{ color: c.qualified ? "var(--success)" : "var(--koc-blue)" }}>
                        {c.level}%
                      </div>
                      {c.level < c.target && (
                        <div className="text-[10px] text-[var(--danger)]">
                          {t("competency.gapPts", { n: c.gap })}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })()}
      </Sheet>
    </div>
  );
}
