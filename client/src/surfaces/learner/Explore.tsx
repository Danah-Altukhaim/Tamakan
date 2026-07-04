import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSession } from "../../app/session";
import { Card, Badge, Button, PageHeader } from "../../components/ui";
import { Icon, type IconName } from "../../components/Icon";
import { resourceTitle, resourceDesc } from "../../lib/format";
import type { ResourceLevel, ResourceType } from "../../data/types";

const TYPE_META: Record<ResourceType, { icon: IconName; labelKey: string }> = {
  pdf: { icon: "document", labelKey: "PDF Guide" },
  "video-series": { icon: "video", labelKey: "Video Series" },
  interactive: { icon: "cursor", labelKey: "Interactive" },
  "recorded-lecture": { icon: "play", labelKey: "Recorded Lecture" },
};

const LEVEL_TONE: Record<ResourceLevel, "green" | "sky" | "sand" | "blue"> = {
  beginner: "green",
  intermediate: "sky",
  advanced: "sand",
  reference: "blue",
};

const TYPE_LABEL: Record<ResourceType, string> = {
  pdf: "PDF Guide",
  "video-series": "Video Series",
  interactive: "Interactive",
  "recorded-lecture": "Recorded Lecture",
};

export function Explore() {
  const { t } = useTranslation();
  const { resources } = useSession();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<ResourceType | "all">("all");
  const [level, setLevel] = useState<ResourceLevel | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return resources.filter((r) => {
      if (type !== "all" && r.type !== type) return false;
      if (level !== "all" && r.level !== level) return false;
      if (!q) return true;
      const hay = `${r.title} ${r.description} ${r.tags.join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [resources, query, type, level]);

  const types: (ResourceType | "all")[] = [
    "all",
    "pdf",
    "video-series",
    "interactive",
    "recorded-lecture",
  ];
  const levels: (ResourceLevel | "all")[] = [
    "all",
    "beginner",
    "intermediate",
    "advanced",
    "reference",
  ];

  return (
    <div>
      <PageHeader
        title={t("explore.title")}
        subtitle={t("explore.subtitle", { department: t("app.department") })}
      />

      {/* Controls */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute inset-y-0 start-3 grid place-items-center text-[var(--text-muted)]">
            <Icon name="search" size={16} />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("common.search")}
            className="w-full rounded-xl border border-[var(--separator)] bg-[var(--card)] py-2.5 ps-9 pe-3 text-sm outline-none focus:border-[var(--koc-blue)]"
            aria-label={t("common.search")}
          />
        </div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as ResourceType | "all")}
          className="rounded-xl border border-[var(--separator)] bg-[var(--card)] px-3 py-2.5 text-sm outline-none focus:border-[var(--koc-blue)]"
          aria-label={t("explore.filterType")}
        >
          {types.map((ty) => (
            <option key={ty} value={ty}>
              {ty === "all" ? t("common.all") : TYPE_LABEL[ty]}
            </option>
          ))}
        </select>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value as ResourceLevel | "all")}
          className="rounded-xl border border-[var(--separator)] bg-[var(--card)] px-3 py-2.5 text-sm outline-none focus:border-[var(--koc-blue)] capitalize"
          aria-label={t("explore.filterLevel")}
        >
          {levels.map((lv) => (
            <option key={lv} value={lv}>
              {lv === "all" ? t("common.all") : lv}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-[var(--text-muted)]">
          {t("explore.noResults")}
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <Card key={r.id} className="flex flex-col p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--fill-subtle)] text-[var(--koc-blue)]">
                  <Icon name={TYPE_META[r.type].icon} size={22} />
                </div>
                <Badge tone={LEVEL_TONE[r.level]}>
                  <span className="capitalize">{r.level}</span>
                </Badge>
              </div>
              <h3 className="text-[15px] font-semibold leading-snug text-[var(--text)]">
                {resourceTitle(r)}
              </h3>
              <p className="mb-2 mt-1 text-xs font-medium text-[var(--text-muted)]">
                {TYPE_LABEL[r.type]}
              </p>
              <p className="mb-5 flex-1 text-xs leading-relaxed text-[var(--text-muted)]">
                {resourceDesc(r)}
              </p>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => r.url !== "#" && window.open(r.url, "_blank")}
              >
                {t("explore.openResource")}
                <Icon name="chevron" size={16} className="rotate-180" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
