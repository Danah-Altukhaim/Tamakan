import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useSession } from "../../app/session";
import { ProgressRing } from "../../components/ProgressRing";
import { Badge, Button } from "../../components/ui";
import { Icon, type IconName } from "../../components/Icon";
import { deriveTrackProgress } from "../../lib/progress";
import { trackTitle, moduleTitle } from "../../lib/format";
import type { ModuleState, ModuleType } from "../../data/types";

const TYPE_ICON: Record<ModuleType, IconName> = {
  video: "play",
  reading: "book",
  interactive: "cursor",
};

const STATE_TONE: Record<ModuleState, "green" | "amber" | "gray" | "blue"> = {
  completed: "green",
  "in-progress": "amber",
  available: "blue",
  locked: "gray",
};

function stateGlyph(state: ModuleState): IconName {
  if (state === "completed") return "check";
  if (state === "in-progress") return "play";
  if (state === "locked") return "lock";
  return "dot";
}

export function TrackDetail() {
  const { t } = useTranslation();
  const { trackId } = useParams();
  const navigate = useNavigate();
  const { tracks, myProgress } = useSession();

  const track = useMemo(() => tracks.find((tk) => tk.id === trackId), [tracks, trackId]);
  const progress = useMemo(
    () => (track ? deriveTrackProgress(track, myProgress) : null),
    [track, myProgress],
  );

  if (!track || !progress) {
    return (
      <div className="py-16 text-center text-[var(--text-muted)]">Track not found.</div>
    );
  }

  function open(moduleId: string) {
    // Open the module in the player, which runs the lesson / interactive session
    // and records completion.
    navigate(`/tracks/${track!.id}/m/${moduleId}`);
  }

  const stateLabel: Record<ModuleState, string> = {
    completed: t("common.completed"),
    "in-progress": t("common.inProgress"),
    available: t("common.available"),
    locked: t("common.locked"),
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/tracks")}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--koc-blue)] hover:opacity-80"
      >
        <Icon name="chevron" size={16} /> {t("common.back")}
      </button>

      {/* Track header, clean card, one tint */}
      <div className="flex flex-wrap items-center justify-between gap-6 rounded-[var(--radius-2xl)] border border-[var(--separator)] bg-[var(--card)] p-6 shadow-[var(--shadow-card)] sm:p-7">
        <div className="min-w-0">
          <div className="mb-3 grid h-12 w-12 place-items-center rounded-[var(--radius-lg)] bg-[var(--fill-subtle)] text-[var(--tint)]">
            <Icon name={track.icon} size={26} />
          </div>
          <h1 className="text-[26px] font-bold leading-tight text-[var(--text)]">
            {trackTitle(track)}
          </h1>
          <p className="mt-1.5 text-[15px] text-[var(--text-secondary)]">
            {t("tracks.modulesCompleted", { done: progress.completed, total: progress.total })}
          </p>
          {track.overlapsWith && (
            <p className="mt-3 flex max-w-md items-start gap-1.5 rounded-[var(--radius-md)] bg-[var(--warning-soft)] px-3 py-2 text-xs text-[var(--warning)]">
              <Icon name="alert" size={14} className="mt-0.5 shrink-0" />
              {t("tracks.overlapNote", {
                title: trackTitle(
                  tracks.find((x) => x.id === track.overlapsWith) ?? track,
                ),
              })}
            </p>
          )}
        </div>
        <div className="text-[var(--tint)]">
          <ProgressRing value={progress.percent} size={100} stroke={9} />
        </div>
      </div>

      {/* Module list */}
      <ol className="space-y-3">
        {progress.modules.map((m) => {
          const locked = m.state === "locked";
          return (
            <li
              key={m.id}
              className="flex items-center gap-4 rounded-2xl border border-[var(--separator)] bg-[var(--card)] p-4 shadow-[var(--shadow-card)]"
              style={{ opacity: locked ? 0.6 : 1 }}
            >
              <div
                className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full text-sm font-bold"
                style={{
                  color:
                    m.state === "completed"
                      ? "var(--success)"
                      : m.state === "in-progress"
                        ? "var(--warning)"
                        : m.state === "locked"
                          ? "var(--text-muted)"
                          : "var(--koc-blue)",
                  border: "2px solid currentColor",
                }}
                aria-hidden
              >
                <Icon name={stateGlyph(m.state)} size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">{moduleTitle(m)}</div>
                <div className="mt-1 flex items-center gap-3 text-xs text-[var(--text-muted)]">
                  <span className="inline-flex items-center gap-1">
                    <Icon name={TYPE_ICON[m.type]} size={13} /> {m.type}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Icon name="clock" size={13} /> {m.duration} {t("common.minutes")}
                  </span>
                </div>
              </div>
              <Badge tone={STATE_TONE[m.state]}>{stateLabel[m.state]}</Badge>
              {!locked && (
                <Button
                  variant={m.state === "completed" ? "success" : "primary"}
                  onClick={() => open(m.id)}
                >
                  {m.state === "completed"
                    ? t("common.review")
                    : m.state === "in-progress"
                      ? t("common.continue")
                      : t("common.start")}
                </Button>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
