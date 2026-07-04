import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSession } from "../../app/session";
import { Card, Badge, Button, ProgressBar, PageHeader, Sheet } from "../../components/ui";
import { ProgressRing } from "../../components/ProgressRing";
import { buildRoster, type LearnerStatus, type TeamMember } from "../../lib/manager";
import { deriveTrackProgress } from "../../lib/progress";
import { trackTitle } from "../../lib/format";

const STATUS_TONE: Record<LearnerStatus, "green" | "red" | "gray"> = {
  "on-track": "green",
  "at-risk": "red",
  idle: "gray",
};

export function Roster() {
  const { t } = useTranslation();
  const { users, tracks, allProgress } = useSession();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const rows = useMemo(
    () => buildRoster(users, tracks, allProgress).sort((a, b) => b.percent - a.percent),
    [users, tracks, allProgress],
  );

  const selected = useMemo(
    () => rows.find((r) => r.user.id === selectedId) ?? null,
    [rows, selectedId],
  );

  const statusLabel: Record<LearnerStatus, string> = {
    "on-track": t("manager.onTrack"),
    "at-risk": t("manager.atRisk"),
    idle: t("manager.idle"),
  };

  function lastActive(days: number) {
    return days === 0 ? t("manager.today") : t("manager.daysAgo", { count: days });
  }

  return (
    <div>
      <PageHeader
        title={t("manager.teamTitle")}
        subtitle={t("manager.teamSubtitle", {
          count: rows.length,
          department: t("app.department"),
        })}
        action={
          <Button onClick={() => setAdding(true)}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M8 3.5v9M3.5 8h9"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
            {t("manager.addMember")}
          </Button>
        }
      />

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-[var(--separator)] text-start text-xs uppercase tracking-wide text-[var(--text-muted)]">
                <th className="px-5 py-3 text-start font-semibold">{t("manager.engineer")}</th>
                <th className="px-5 py-3 text-start font-semibold">{t("manager.progress")}</th>
                <th className="px-5 py-3 text-start font-semibold">{t("manager.currentTrack")}</th>
                <th className="px-5 py-3 text-start font-semibold">{t("manager.lastActive")}</th>
                <th className="px-5 py-3 text-start font-semibold">{t("manager.status")}</th>
                <th className="px-5 py-3" aria-hidden="true" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.user.id}
                  onClick={() => setSelectedId(r.user.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedId(r.user.id);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={t("manager.viewEngineer", {
                    name: r.user.name,
                  })}
                  className="cursor-pointer border-b border-[var(--separator)] last:border-0 hover:bg-[var(--fill-subtle)] focus:outline-none focus-visible:bg-[var(--fill-subtle)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--koc-blue)]"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full text-xs font-bold"
                        style={{ background: "var(--fill-subtle)", color: "var(--koc-blue)" }}
                      >
                        {r.user.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold">
                          {r.user.name}
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">{r.user.jobTitle}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-24">
                        <ProgressBar value={r.percent} />
                      </div>
                      <span className="text-xs font-bold text-[var(--koc-blue)]">
                        {r.percent}%
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[var(--text-muted)]">
                    {r.currentTrack ? trackTitle(r.currentTrack) : t("manager.none")}
                  </td>
                  <td className="px-5 py-3 text-[var(--text-muted)]">
                    {lastActive(r.daysInactive)}
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={STATUS_TONE[r.status]}>{statusLabel[r.status]}</Badge>
                  </td>
                  <td className="px-5 py-3 text-[var(--text-muted)]">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                      className="opacity-60"
                    >
                      <path
                        d="M6 3l5 5-5 5"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Sheet
        open={selected != null}
        onClose={() => setSelectedId(null)}
        title={
          selected && (
            <div className="flex items-center gap-3">
              <div
                className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full text-sm font-bold"
                style={{ background: "var(--fill-subtle)", color: "var(--koc-blue)" }}
              >
                {selected.user.initials}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-[var(--text)]">
                  {selected.user.name}
                </h2>
                <p className="text-xs text-[var(--text-muted)]">{selected.user.jobTitle}</p>
              </div>
            </div>
          )
        }
      >
        {selected && (
          <EngineerDetail member={selected} lastActiveLabel={lastActive(selected.daysInactive)} />
        )}
      </Sheet>

      <Sheet
        open={adding}
        onClose={() => setAdding(false)}
        title={
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-[var(--text)]">{t("manager.addMemberTitle")}</h2>
            <p className="text-xs text-[var(--text-muted)]">{t("manager.addMemberSubtitle")}</p>
          </div>
        }
      >
        <AddMemberForm onDone={() => setAdding(false)} />
      </Sheet>
    </div>
  );
}

function AddMemberForm({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const { tracks, addMember } = useSession();
  const defaultTeam = t("app.department");

  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [team, setTeam] = useState(defaultTeam);
  const [trackIds, setTrackIds] = useState<string[]>([]);

  const sortedTracks = useMemo(
    () => [...tracks].sort((a, b) => a.order - b.order),
    [tracks],
  );

  function toggleTrack(id: string) {
    setTrackIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  const canSave = name.trim().length > 0 && jobTitle.trim().length > 0;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;
    addMember({
      name: name.trim(),
      jobTitle: jobTitle.trim(),
      department: team.trim() || defaultTeam,
      assignedTrackIds: trackIds,
    });
    onDone();
  }

  const fieldClass =
    "w-full rounded-xl border border-[var(--separator)] bg-[var(--card)] px-3.5 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--koc-blue)] focus:ring-2 focus:ring-[var(--koc-blue)]/20";
  const labelClass =
    "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]";

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="member-name" className={labelClass}>
          {t("manager.fieldName")}
        </label>
        <input
          id="member-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("manager.fieldNamePlaceholder")}
          className={fieldClass}
          autoFocus
        />
      </div>

      <div>
        <label htmlFor="member-role" className={labelClass}>
          {t("manager.fieldRole")}
        </label>
        <input
          id="member-role"
          type="text"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder={t("manager.fieldRolePlaceholder")}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="member-team" className={labelClass}>
          {t("manager.fieldTeam")}
        </label>
        <input
          id="member-team"
          type="text"
          value={team}
          onChange={(e) => setTeam(e.target.value)}
          className={fieldClass}
        />
      </div>

      <div>
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <span className={labelClass + " mb-0"}>{t("manager.assignTracks")}</span>
          <span className="text-xs text-[var(--text-muted)]">
            {t("manager.selectedCount", { count: trackIds.length })}
          </span>
        </div>
        <p className="mb-2.5 text-xs text-[var(--text-muted)]">{t("manager.assignTracksHint")}</p>
        <div className="max-h-56 overflow-y-auto rounded-xl border border-[var(--separator)]">
          {sortedTracks.map((tr, i) => {
            const checked = trackIds.includes(tr.id);
            return (
              <label
                key={tr.id}
                className={[
                  "flex cursor-pointer items-center gap-3 px-3.5 py-2.5 text-sm hover:bg-[var(--fill-subtle)]",
                  i > 0 ? "border-t border-[var(--separator)]" : "",
                ].join(" ")}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleTrack(tr.id)}
                  className="h-4 w-4 flex-shrink-0 accent-[var(--koc-blue)]"
                />
                <span className={checked ? "font-semibold text-[var(--text)]" : "text-[var(--text)]"}>
                  {trackTitle(tr)}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="mt-1 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onDone}>
          {t("manager.cancel")}
        </Button>
        <Button type="submit" disabled={!canSave}>
          {t("manager.save")}
        </Button>
      </div>
    </form>
  );
}

/** Inline track-assignment editor shown inside an engineer's detail sheet. */
function EngineerDetail({
  member,
  lastActiveLabel,
}: {
  member: TeamMember;
  lastActiveLabel: string;
}) {
  const { t } = useTranslation();
  const { tracks, allProgress, assignTracks, removeMember, learner } = useSession();
  const [editing, setEditing] = useState(false);
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  // The active learner is shown in the roster but isn't removable (demo self).
  const canRemove = member.user.id !== learner?.id;

  const mine = useMemo(
    () => allProgress.filter((p) => p.userId === member.user.id),
    [allProgress, member.user.id],
  );
  const assigned = useMemo(
    () =>
      tracks
        .filter((tr) => member.user.assignedTrackIds.includes(tr.id))
        .map((tr) => deriveTrackProgress(tr, mine))
        .sort((a, b) => b.percent - a.percent),
    [tracks, member.user.assignedTrackIds, mine],
  );

  const statusTone = STATUS_TONE[member.status];
  const statusText =
    member.status === "on-track"
      ? t("manager.onTrack")
      : member.status === "at-risk"
        ? t("manager.atRisk")
        : t("manager.idle");

  const stats: { label: string; value: string }[] = [
    { label: t("manager.lastActive"), value: lastActiveLabel },
    { label: t("overview.points"), value: member.user.points.toLocaleString() },
    { label: t("manager.streakLabel"), value: t("manager.streakDays", { count: member.user.streak }) },
    { label: t("overview.rank"), value: member.user.rank },
  ];

  return (
    <div>
      {/* Summary: ring + status + key stats */}
      <div className="flex items-center gap-5">
        <div
          className="flex-shrink-0 rounded-2xl p-3 text-white"
          style={{ background: "var(--koc-blue)" }}
        >
          <ProgressRing value={member.percent} size={84} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2">
            <Badge tone={statusTone}>{statusText}</Badge>
          </div>
          <p className="text-sm text-[var(--text-muted)]">
            {t("manager.overallLine", { percent: member.percent })}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-[var(--separator)] bg-[var(--fill-subtle)] px-4 py-3"
          >
            <div className="text-xs text-[var(--text-muted)]">{s.label}</div>
            <div className="mt-0.5 font-semibold text-[var(--text)]">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Per-track breakdown / assignment editor */}
      <div className="mt-6 mb-3 flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          {t("manager.trackBreakdown")}
        </h3>
        {!editing && (
          <Button
            variant="ghost"
            className="px-2.5 py-1 text-xs"
            onClick={() => setEditing(true)}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M11.5 2.5l2 2-7 7-2.5.5.5-2.5 7-7z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            {t("manager.editAssignments")}
          </Button>
        )}
      </div>
      {editing ? (
        <AssignEditor
          member={member}
          onDone={() => setEditing(false)}
          onSave={(ids) => {
            void assignTracks(member.user.id, ids);
            setEditing(false);
          }}
        />
      ) : assigned.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">{t("manager.noTracks")}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {assigned.map((tp) => {
            const done = tp.percent === 100;
            return (
              <li
                key={tp.track.id}
                className="rounded-xl border border-[var(--separator)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-[var(--text)]">
                      {trackTitle(tp.track)}
                    </div>
                    <div className="mt-0.5 text-xs text-[var(--text-muted)]">
                      {t("tracks.completeCount", { done: tp.completed, total: tp.total })}
                    </div>
                  </div>
                  <span
                    className="text-sm font-bold"
                    style={{ color: done ? "var(--success)" : "var(--koc-blue)" }}
                  >
                    {tp.percent}%
                  </span>
                </div>
                <div className="mt-3">
                  <ProgressBar value={tp.percent} tone={done ? "green" : "blue"} />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Danger zone: two-step remove so no one deletes a member by accident. */}
      {canRemove && !editing && (
        <div className="mt-8 border-t border-[var(--separator)] pt-6">
          {confirmingRemove ? (
            <div
              className="rounded-xl border border-[var(--danger)]/25 p-4"
              style={{ background: "var(--danger-soft)" }}
            >
              <div className="font-semibold text-[var(--text)]">
                {t("manager.removeMemberConfirmTitle", { name: member.user.name })}
              </div>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {t("manager.removeMemberConfirmBody", { name: member.user.name })}
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setConfirmingRemove(false)}
                >
                  {t("manager.cancel")}
                </Button>
                <Button
                  type="button"
                  className="border-transparent text-white hover:opacity-90"
                  style={{ background: "var(--danger)" }}
                  onClick={() => removeMember(member.user.id)}
                >
                  {t("manager.removeMemberConfirm")}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="ghost"
              className="hover:bg-[var(--danger-soft)]"
              style={{ color: "var(--danger)" }}
              onClick={() => setConfirmingRemove(true)}
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M3 4.5h10M6.5 4.5V3.5a1 1 0 011-1h1a1 1 0 011 1v1M5 4.5l.5 8a1 1 0 001 .9h3a1 1 0 001-.9l.5-8"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {t("manager.removeMember")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/** Inline editor for a member's assigned tracks. Preselects current assignments. */
function AssignEditor({
  member,
  onDone,
  onSave,
}: {
  member: TeamMember;
  onDone: () => void;
  onSave: (trackIds: string[]) => void;
}) {
  const { t } = useTranslation();
  const { tracks } = useSession();
  const [trackIds, setTrackIds] = useState<string[]>(member.user.assignedTrackIds);

  const sortedTracks = useMemo(
    () => [...tracks].sort((a, b) => a.order - b.order),
    [tracks],
  );

  function toggleTrack(id: string) {
    setTrackIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <div>
      <div className="mb-2.5 flex items-baseline justify-between gap-2">
        <p className="text-xs text-[var(--text-muted)]">{t("manager.assignTracksHint")}</p>
        <span className="flex-shrink-0 text-xs text-[var(--text-muted)]">
          {t("manager.selectedCount", { count: trackIds.length })}
        </span>
      </div>
      <div className="max-h-56 overflow-y-auto rounded-xl border border-[var(--separator)]">
        {sortedTracks.map((tr, i) => {
          const checked = trackIds.includes(tr.id);
          return (
            <label
              key={tr.id}
              className={[
                "flex cursor-pointer items-center gap-3 px-3.5 py-2.5 text-sm hover:bg-[var(--fill-subtle)]",
                i > 0 ? "border-t border-[var(--separator)]" : "",
              ].join(" ")}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleTrack(tr.id)}
                className="h-4 w-4 flex-shrink-0 accent-[var(--koc-blue)]"
              />
              <span className={checked ? "font-semibold text-[var(--text)]" : "text-[var(--text)]"}>
                {trackTitle(tr)}
              </span>
            </label>
          );
        })}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onDone}>
          {t("manager.cancel")}
        </Button>
        <Button type="button" onClick={() => onSave([...new Set(trackIds)])}>
          {t("manager.saveAssignments")}
        </Button>
      </div>
    </div>
  );
}
