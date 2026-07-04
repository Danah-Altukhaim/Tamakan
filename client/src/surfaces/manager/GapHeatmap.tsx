import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSession } from "../../app/session";
import { Card, PageHeader } from "../../components/ui";
import { Icon } from "../../components/Icon";
import { buildHeatmap } from "../../lib/manager";
import { trackTitle } from "../../lib/format";

/** Map a completion percent (or null = unassigned) to a KOC-blue heat cell. */
function cellStyle(pct: number | null): { background: string; color: string; label: string } {
  if (pct === null) {
    return { background: "repeating-linear-gradient(45deg,transparent,transparent 4px,var(--separator) 4px,var(--separator) 5px)", color: "var(--locked)", label: "-" };
  }
  // 0% → faint, 100% → full KOC blue.
  const alpha = 0.12 + (pct / 100) * 0.82;
  const color = pct >= 55 ? "#fff" : "var(--koc-navy)";
  return { background: `rgba(10,74,159,${alpha.toFixed(2)})`, color, label: `${pct}%` };
}

export function GapHeatmap() {
  const { t } = useTranslation();
  const { users, tracks, allProgress } = useSession();

  const { learners, cell } = useMemo(
    () => buildHeatmap(users, tracks, allProgress),
    [users, tracks, allProgress],
  );

  return (
    <div>
      <PageHeader title={t("manager.gapsTitle")} subtitle={t("manager.gapsSubtitle")} />

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="border-separate border-spacing-1 p-3">
            <thead>
              <tr>
                <th className="sticky start-0 z-10 bg-[var(--card)] px-3 py-2 text-start text-xs font-semibold text-[var(--text-muted)]">
                  Track
                </th>
                {learners.map((u) => (
                  <th
                    key={u.id}
                    className="px-1 py-2 text-center text-[11px] font-semibold text-[var(--text-muted)]"
                    title={u.name}
                  >
                    <div
                      className="mx-auto grid h-7 w-7 place-items-center rounded-full"
                      style={{ background: "var(--fill-subtle)", color: "var(--koc-blue)" }}
                    >
                      {u.initials}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tracks.map((track) => (
                <tr key={track.id}>
                  <th className="sticky start-0 z-10 whitespace-nowrap bg-[var(--card)] px-3 py-1.5 text-start text-xs font-medium text-[var(--text)]">
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name={track.icon} size={14} className="shrink-0 text-[var(--koc-sky)]" />
                      {trackTitle(track)}
                    </span>
                  </th>
                  {learners.map((u) => {
                    const pct = cell(track.id, u.id);
                    const s = cellStyle(pct);
                    return (
                      <td key={u.id} className="p-0">
                        <div
                          className="grid h-9 w-12 place-items-center rounded-md text-[11px] font-semibold"
                          style={{ background: s.background, color: s.color }}
                          title={`${trackTitle(track)} · ${u.name}: ${s.label}`}
                        >
                          {pct === null ? "" : s.label}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)]">
        <div className="flex items-center gap-2">
          <span>0%</span>
          <div className="h-3 w-32 rounded-full" style={{ background: "linear-gradient(90deg, rgba(10,74,159,.12), rgba(10,74,159,.94))" }} />
          <span>100%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="h-4 w-6 rounded"
            style={{ background: "repeating-linear-gradient(45deg,transparent,transparent 4px,var(--separator) 4px,var(--separator) 5px)" }}
          />
          <span>{t("manager.none")} not assigned</span>
        </div>
      </div>
    </div>
  );
}
