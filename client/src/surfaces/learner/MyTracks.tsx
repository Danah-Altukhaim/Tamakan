import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSession } from "../../app/session";
import { Card, Badge, ProgressBar, PageHeader } from "../../components/ui";
import { Icon } from "../../components/Icon";
import { deriveTrackProgress } from "../../lib/progress";
import { trackTitle } from "../../lib/format";

export function MyTracks() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const navigate = useNavigate();
  const { learner, tracks, myProgress } = useSession();

  const assigned = useMemo(
    () =>
      tracks
        .filter((tk) => learner?.assignedTrackIds.includes(tk.id))
        .map((tk) => deriveTrackProgress(tk, myProgress)),
    [tracks, learner, myProgress],
  );

  return (
    <div>
      <PageHeader
        title={t("tracks.title")}
        subtitle={t("tracks.subtitle", { department: t("app.department") })}
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {assigned.map(({ track, completed, total, percent }) => {
          const done = percent === 100;
          return (
            <Card
              key={track.id}
              as="button"
              interactive
              onClick={() => navigate(`/tracks/${track.id}`)}
              className="p-6"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-[var(--fill-subtle)] text-[var(--koc-blue)]">
                  <Icon name={track.icon} size={26} />
                </div>
                {done ? (
                  <Badge tone="green">
                    <Icon name="check" size={12} /> {t("common.complete")}
                  </Badge>
                ) : percent > 0 ? (
                  <Badge tone="blue">{t("common.inProgress")}</Badge>
                ) : (
                  <Badge tone="gray">{t("common.notStarted")}</Badge>
                )}
              </div>
              <h3 className="mb-1 text-base font-bold leading-snug">{trackTitle(track, lang)}</h3>
              <p className="mb-4 text-xs text-[var(--text-muted)]">
                {total} {t("common.modules")}
              </p>
              <ProgressBar value={percent} tone={done ? "green" : "blue"} />
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)]">
                  {t("tracks.completeCount", { done: completed, total })}
                </span>
                <span
                  className="font-bold"
                  style={{ color: done ? "var(--success)" : "var(--koc-blue)" }}
                >
                  {percent}%
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
