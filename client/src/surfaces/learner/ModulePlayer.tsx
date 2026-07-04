import { useCallback, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSession } from "../../app/session";
import { Badge, Button, Card } from "../../components/ui";
import { Icon, type IconName } from "../../components/Icon";
import { Markdown } from "../../components/Markdown";
import { deriveTrackProgress } from "../../lib/progress";
import { SBHP_LESSONS, type LessonBlock } from "../../data/sbhp";
import { SbhpBuilder } from "./SbhpBuilder";
import type { ModuleType } from "../../data/types";

const TYPE_ICON: Record<ModuleType, IconName> = {
  video: "play",
  reading: "book",
  interactive: "cursor",
};

const CALLOUT_STYLE: Record<
  string,
  { bg: string; fg: string; border: string }
> = {
  blue: { bg: "rgba(10,74,159,.06)", fg: "#0a4a9f", border: "rgba(10,74,159,.18)" },
  sky: { bg: "rgba(43,108,176,.06)", fg: "#245a94", border: "rgba(43,108,176,.18)" },
  green: { bg: "var(--success-soft)", fg: "#177544", border: "rgba(34,197,94,.24)" },
  amber: { bg: "var(--warning-soft)", fg: "#8a6410", border: "rgba(201,168,76,.3)" },
  sand: { bg: "rgba(201,168,76,.1)", fg: "#8a6d1e", border: "rgba(201,168,76,.3)" },
};

function Block({ block }: { block: LessonBlock }) {
  switch (block.kind) {
    case "p":
      return (
        <div className="text-[15px] leading-relaxed text-[var(--text-secondary)]">
          <Markdown text={block.text} />
        </div>
      );
    case "h":
      return (
        <h2 className="pt-1 text-[19px] font-bold text-[var(--text)]">{block.text}</h2>
      );
    case "codepath":
      return (
        <div className="rounded-[var(--radius-lg)] border border-[var(--separator)] bg-[var(--fill-subtle)] p-3">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)]">
            <Icon name="link" size={13} /> {block.label}
          </div>
          <code className="block overflow-x-auto whitespace-nowrap text-[13px] text-[var(--text)]">
            {block.path}
          </code>
        </div>
      );
    case "callout": {
      const c = CALLOUT_STYLE[block.tone] ?? CALLOUT_STYLE.blue;
      return (
        <div
          className="flex gap-3 rounded-[var(--radius-lg)] border p-4"
          style={{ background: c.bg, borderColor: c.border }}
        >
          <Icon name={block.icon} size={18} className="mt-0.5 shrink-0" style={{ color: c.fg }} />
          <div>
            {block.title && (
              <div className="mb-0.5 text-sm font-bold" style={{ color: c.fg }}>
                {block.title}
              </div>
            )}
            <div className="text-[14px] leading-relaxed text-[var(--text-secondary)]">
              <Markdown text={block.text} />
            </div>
          </div>
        </div>
      );
    }
    case "cards":
      return (
        <div className="grid gap-3 sm:grid-cols-3">
          {block.items.map((it) => (
            <div
              key={it.title}
              className="rounded-[var(--radius-lg)] border border-[var(--separator)] bg-[var(--card)] p-4"
            >
              <div className="mb-2.5 grid h-9 w-9 place-items-center rounded-[var(--radius-md)] bg-[var(--fill-subtle)] text-[var(--tint)]">
                <Icon name={it.icon} size={18} />
              </div>
              <div className="text-sm font-bold text-[var(--text)]">{it.title}</div>
              <div className="mt-1 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                {it.text}
              </div>
            </div>
          ))}
        </div>
      );
    case "steps":
      return (
        <ol className="space-y-3">
          {block.items.map((it, i) => (
            <li key={it.title} className="flex gap-3.5">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--fill-subtle)] text-sm font-bold text-[var(--tint)]">
                {i + 1}
              </span>
              <div className="pt-0.5">
                <div className="text-sm font-bold text-[var(--text)]">{it.title}</div>
                <div className="mt-0.5 text-[14px] leading-relaxed text-[var(--text-secondary)]">
                  {it.text}
                </div>
              </div>
            </li>
          ))}
        </ol>
      );
    case "checklist":
      return (
        <div className="space-y-2.5">
          {block.items.map((it) => (
            <div
              key={it.title}
              className="flex gap-3 rounded-[var(--radius-lg)] border border-[var(--separator)] bg-[var(--card)] p-3.5"
            >
              <Icon
                name="check-circle"
                size={18}
                className="mt-0.5 shrink-0 text-[var(--success)]"
              />
              <div>
                <div className="text-sm font-bold text-[var(--text)]">{it.title}</div>
                <div className="mt-0.5 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                  {it.text}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
  }
}

export function ModulePlayer() {
  const { t } = useTranslation();
  const { trackId, moduleId } = useParams();
  const navigate = useNavigate();
  const { tracks, myProgress, setModuleState } = useSession();

  const track = useMemo(() => tracks.find((tk) => tk.id === trackId), [tracks, trackId]);
  const progress = useMemo(
    () => (track ? deriveTrackProgress(track, myProgress) : null),
    [track, myProgress],
  );
  const mod = progress?.modules.find((m) => m.id === moduleId) ?? null;

  const backToTrack = useCallback(() => navigate(`/tracks/${trackId}`), [navigate, trackId]);

  // Opening an available module starts it (mirrors "Start"/"Continue").
  useEffect(() => {
    if (mod && mod.state === "available") {
      void setModuleState(mod.id, "in-progress");
    }
    // Only when the identity of the opened module changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mod?.id]);

  if (!track || !progress || !mod) {
    return <div className="py-16 text-center text-[var(--text-muted)]">Module not found.</div>;
  }
  if (mod.state === "locked") {
    backToTrack();
    return null;
  }

  const lesson = moduleId ? SBHP_LESSONS[moduleId] : undefined;
  const isBuilder = mod.type === "interactive" && moduleId === "t5-m5";
  const ordered = progress.modules;
  const idx = ordered.findIndex((m) => m.id === mod.id);
  const next = idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1] : null;

  async function complete() {
    await setModuleState(mod!.id, "completed");
    // Continue to the next module if there is one, else back to the track.
    if (next) navigate(`/tracks/${trackId}/m/${next.id}`);
    else backToTrack();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <button
        onClick={backToTrack}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--koc-blue)] hover:opacity-80"
      >
        <Icon name="chevron" size={16} /> {track.title}
      </button>

      {/* Module header */}
      <div className="rounded-[var(--radius-2xl)] border border-[var(--separator)] bg-[var(--card)] p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <span className="inline-flex items-center gap-1">
            <Icon name={TYPE_ICON[mod.type]} size={13} /> {mod.type}
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <Icon name="clock" size={13} /> {mod.duration} {t("common.minutes")}
          </span>
          <span>·</span>
          <span>
            {t("module.stepOf", {
              n: idx + 1,
              total: ordered.length,
              defaultValue: `Module ${idx + 1} of ${ordered.length}`,
            })}
          </span>
          {mod.state === "completed" && (
            <>
              <span>·</span>
              <Badge tone="green">{t("common.completed")}</Badge>
            </>
          )}
        </div>
        <h1 className="mt-2 text-[24px] font-bold leading-tight text-[var(--text)]">
          {mod.title}
        </h1>
        {lesson && (
          <p className="mt-1.5 text-[15px] text-[var(--text-secondary)]">{lesson.summary}</p>
        )}
      </div>

      {/* Body */}
      {isBuilder ? (
        <SbhpBuilder onComplete={complete} />
      ) : lesson ? (
        <>
          <Card className="space-y-4 p-5 sm:p-6">
            {lesson.blocks.map((b, i) => (
              <Block key={i} block={b} />
            ))}
          </Card>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-[var(--text-muted)]">
              {next
                ? t("module.next", { title: next.title, defaultValue: `Next: ${next.title}` })
                : t("module.lastInTrack", { defaultValue: "Last module in this track" })}
            </span>
            <Button variant={mod.state === "completed" ? "success" : "primary"} onClick={complete}>
              <Icon name="check" size={16} />
              {mod.state === "completed"
                ? next
                  ? t("module.next", { title: "", defaultValue: "Next module" }).trim()
                  : t("common.back")
                : next
                  ? t("module.completeNext", { defaultValue: "Complete & continue" })
                  : t("module.complete", { defaultValue: "Mark complete" })}
            </Button>
          </div>
        </>
      ) : (
        <Card className="space-y-3 p-6 text-center">
          <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[var(--fill-subtle)] text-[var(--tint)]">
            <Icon name={TYPE_ICON[mod.type]} size={22} />
          </div>
          <p className="text-[15px] text-[var(--text-secondary)]">
            {t("module.placeholder", {
              defaultValue:
                "This module's content is being authored. Mark it complete to continue the track.",
            })}
          </p>
          <div className="pt-1">
            <Button variant={mod.state === "completed" ? "success" : "primary"} onClick={complete}>
              <Icon name="check" size={16} />{" "}
              {mod.state === "completed"
                ? t("common.back")
                : t("module.complete", { defaultValue: "Mark complete" })}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
