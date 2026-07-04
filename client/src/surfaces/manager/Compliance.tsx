import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSession } from "../../app/session";
import { Card, PageHeader, StatTile, Badge } from "../../components/ui";
import { Icon } from "../../components/Icon";
import { buildCompliance, type CertStatus } from "../../lib/workforce";

const STATUS_TONE: Record<CertStatus, "green" | "amber" | "red" | "gray"> = {
  valid: "green",
  expiring: "amber",
  expired: "red",
  missing: "gray",
};
const STATUS_COLOR: Record<CertStatus, { bg: string; fg: string }> = {
  valid: { bg: "var(--success-soft)", fg: "#177544" },
  expiring: { bg: "var(--warning-soft)", fg: "#8a6410" },
  expired: { bg: "var(--danger-soft)", fg: "#b23a3a" },
  missing: { bg: "var(--fill-strong)", fg: "var(--text-muted)" },
};

export function Compliance() {
  const { t } = useTranslation();
  const { users } = useSession();

  const c = useMemo(() => buildCompliance(users), [users]);

  const certName = (id: string) => c.certs.find((x) => x.id === id)?.short ?? id;
  const statusText: Record<CertStatus, string> = {
    valid: t("compliance.valid"),
    expiring: t("compliance.expiring"),
    expired: t("compliance.expired"),
    missing: t("compliance.missing"),
  };

  function cellLabel(status: CertStatus, daysLeft: number | null): string {
    if (status === "missing") return "-";
    if (status === "expired") return t("compliance.expiredShort");
    if (status === "expiring") return daysLeft != null ? t("compliance.inDays", { count: daysLeft }) : t("compliance.soon");
    return "✓";
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("compliance.title")} subtitle={t("compliance.subtitle")} />

      {/* Roll-up */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile tone={c.rate >= 90 ? "green" : "amber"} icon={<Icon name="shield" size={22} />} value={`${c.rate}%`} label={t("compliance.rate")} />
        <StatTile tone="rose" icon={<Icon name="alert" size={22} />} value={c.totals.expired} label={t("compliance.expired")} />
        <StatTile tone="amber" icon={<Icon name="clock" size={22} />} value={c.totals.expiring} label={t("compliance.expiringSoon")} />
        <StatTile tone="orange" icon={<Icon name="document" size={22} />} value={c.totals.missing} label={t("compliance.missing")} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        {/* Matrix: engineer × certificate */}
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] border-separate border-spacing-1 p-3">
              <thead>
                <tr>
                  <th className="sticky start-0 z-10 bg-[var(--card)] px-3 py-2 text-start text-xs font-semibold text-[var(--text-muted)]">
                    {t("compliance.engineer")}
                  </th>
                  {c.certs.map((cert) => (
                    <th key={cert.id} className="px-1 py-2 text-center text-[11px] font-semibold text-[var(--text-muted)]" title={`${cert.name} · ${cert.authority}`}>
                      {cert.short}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {c.rows.map((row) => (
                  <tr key={row.user.id}>
                    <th className="sticky start-0 z-10 whitespace-nowrap bg-[var(--card)] px-3 py-1.5 text-start">
                      <span className="inline-flex items-center gap-2">
                        <span className="grid h-7 w-7 place-items-center rounded-full text-[10px] font-bold" style={{ background: "var(--fill-subtle)", color: "var(--koc-blue)" }}>
                          {row.user.initials}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-semibold text-[var(--text)]">{row.user.name}</span>
                          <span className="block text-[10px] text-[var(--text-muted)]">
                            {t("compliance.validOf", { valid: row.validCount, total: row.requiredCount })}
                          </span>
                        </span>
                      </span>
                    </th>
                    {row.cells.map((cell) => {
                      const col = STATUS_COLOR[cell.status];
                      return (
                        <td key={cell.certId} className="p-0">
                          <div
                            className="mx-auto grid h-9 w-14 place-items-center rounded-md text-[10px] font-bold"
                            style={{ background: col.bg, color: col.fg }}
                            title={`${certName(cell.certId)}: ${statusText[cell.status]}${cell.expires ? " · " + cell.expires : ""}`}
                          >
                            {cellLabel(cell.status, cell.daysLeft)}
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

        {/* Action queue */}
        <Card className="p-6">
          <h2 className="mb-1 text-[15px] font-semibold text-[var(--text)]">{t("compliance.actionQueue")}</h2>
          <p className="mb-4 text-xs text-[var(--text-muted)]">{t("compliance.actionHint")}</p>
          {c.actions.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">{t("compliance.allClear")}</p>
          ) : (
            <ul className="space-y-2.5">
              {c.actions.map((a, i) => (
                <li key={`${a.user.id}-${a.certId}-${i}`} className="flex items-center gap-3 rounded-xl border border-[var(--separator)] p-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-bold" style={{ background: "var(--fill-subtle)", color: "var(--koc-blue)" }}>
                    {a.user.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-[var(--text)]">{a.user.name}</div>
                    <div className="text-xs text-[var(--text-muted)]">{certName(a.certId)}</div>
                  </div>
                  <Badge tone={STATUS_TONE[a.status]}>{statusText[a.status]}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
