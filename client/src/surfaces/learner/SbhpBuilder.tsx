import { useMemo, useState } from "react";
import { Badge, Button, Card } from "../../components/ui";
import { Icon } from "../../components/Icon";
import { BUILDER_INTRO } from "../../data/sbhp";
import {
  WELLS,
  generateProposal,
  midPerf,
  type Proposal,
  type Well,
} from "../../lib/sbhp";

type Stage = "select" | "confirm" | "generate" | "result";

const THRESHOLDS = [5, 25, 50, 100];

function today(): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const mon = d.toLocaleString("en-US", { month: "short" });
  const yr = String(d.getFullYear()).slice(2);
  return `${day}-${mon}-${yr}`;
}

function wellLabel(w: Well): string {
  return w.sidetrack ? `${w.name} (${w.sidetrack})` : w.name;
}

/** Section shell, numbered header + card body, matching the app's HIG cards. */
function Section({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--fill-subtle)] text-sm font-bold text-[var(--tint)]">
          {step}
        </span>
        <h2 className="text-[17px] font-bold text-[var(--text)]">{title}</h2>
      </div>
      {children}
    </Card>
  );
}

function DataTable({
  head,
  rows,
}: {
  head: string[];
  rows: (string | number)[][];
}) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--separator)]">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-[var(--fill-subtle)] text-start">
            {head.map((h) => (
              <th
                key={h}
                className="whitespace-nowrap px-3 py-2 text-start text-xs font-semibold text-[var(--text-secondary)]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-[var(--separator)]">
              {r.map((c, j) => (
                <td key={j} className="whitespace-nowrap px-3 py-2 text-[var(--text)]">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SbhpBuilder({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState<Stage>("select");
  const [wellName, setWellName] = useState<string>(WELLS[0].name);
  const [checks, setChecks] = useState({ perf: false, survey: false, schematic: false });
  const [threshold, setThreshold] = useState(50);
  const [proposal, setProposal] = useState<Proposal | null>(null);

  const well = useMemo(
    () => WELLS.find((w) => w.name === wellName) ?? WELLS[0],
    [wellName],
  );
  const allChecked = checks.perf && checks.survey && checks.schematic;

  function generate() {
    setProposal(generateProposal(well, threshold));
    setStage("result");
  }

  function reset() {
    setChecks({ perf: false, survey: false, schematic: false });
    setThreshold(50);
    setProposal(null);
    setStage("select");
  }

  return (
    <div className="space-y-4">
      <p className="text-[15px] leading-relaxed text-[var(--text-secondary)]">{BUILDER_INTRO}</p>

      {/* Stepper */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
        {(["select", "confirm", "generate", "result"] as Stage[]).map((s, i) => {
          const order: Stage[] = ["select", "confirm", "generate", "result"];
          const active = order.indexOf(stage) >= i;
          const labels = ["Well", "Confirm data", "Threshold", "Proposal"];
          return (
            <span key={s} className="flex items-center gap-1.5">
              <span
                className="rounded-full px-2.5 py-1"
                style={{
                  background: active ? "var(--fill-subtle)" : "transparent",
                  color: active ? "var(--tint)" : "var(--text-muted)",
                }}
              >
                {labels[i]}
              </span>
              {i < 3 && (
                <Icon
                  name="chevron"
                  size={12}
                  className="text-[var(--text-muted)]"
                  style={{ transform: "rotate(180deg)" }}
                />
              )}
            </span>
          );
        })}
      </div>

      {/* 1, Select the well */}
      <Section step={1} title="Select your assigned well">
        <p className="mb-3 text-sm text-[var(--text-secondary)]">
          In the generator you'd type the well name in ALL CAPS and the tool pulls its data from
          the database. Pick a well to load its Well Summary and Deviation Survey.
        </p>
        <div className="flex flex-wrap gap-2">
          {WELLS.map((w) => {
            const selected = w.name === wellName;
            return (
              <button
                key={w.name}
                type="button"
                onClick={() => {
                  setWellName(w.name);
                  if (stage === "select") setStage("confirm");
                }}
                className="rounded-[var(--radius-lg)] border px-4 py-2.5 text-start transition-colors"
                style={{
                  borderColor: selected ? "var(--tint)" : "var(--separator)",
                  background: selected ? "var(--fill-subtle)" : "var(--card)",
                }}
              >
                <div className="text-sm font-bold text-[var(--text)]">{wellLabel(w)}</div>
                <div className="text-xs text-[var(--text-muted)]">
                  {w.formation} · {w.inclination === 0 ? "vertical" : `${w.inclination}° dev.`}
                </div>
              </button>
            );
          })}
        </div>
      </Section>

      {/* 2, Confirm the required data (mirrors the requirements module) */}
      {stage !== "select" && (
        <Section step={2} title="Confirm the required data is current">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="mb-1.5 text-xs font-semibold text-[var(--text-secondary)]">
                Perforation table, current open perfs
              </div>
              <DataTable
                head={["#", "Top MD", "Bottom MD", "Zone", "Mid perf"]}
                rows={well.perforations.map((p, i) => [
                  `#${i + 1}`,
                  p.top,
                  p.bottom,
                  p.zone,
                  midPerf(p).toFixed(0),
                ])}
              />
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-[var(--radius-md)] bg-[var(--fill-subtle)] px-2 py-1.5">
                  <div className="font-semibold text-[var(--text)]">{well.formation}</div>
                  <div className="text-[var(--text-muted)]">Formation</div>
                </div>
                <div className="rounded-[var(--radius-md)] bg-[var(--fill-subtle)] px-2 py-1.5">
                  <div className="font-semibold text-[var(--text)]">{well.completionType}</div>
                  <div className="text-[var(--text-muted)]">Completion</div>
                </div>
                <div className="rounded-[var(--radius-md)] bg-[var(--fill-subtle)] px-2 py-1.5">
                  <div className="font-semibold text-[var(--text)]">{well.inclination}°</div>
                  <div className="text-[var(--text-muted)]">Inclination</div>
                </div>
              </div>
            </div>
            <div>
              <div className="mb-1.5 text-xs font-semibold text-[var(--text-secondary)]">
                Deviation survey: MD → TVD ({well.deviationSurvey.length} points)
              </div>
              <DataTable
                head={["MD (ft)", "TVD (ft)"]}
                rows={well.deviationSurvey.map((s) => [s.md, s.tvd])}
              />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {(
              [
                ["perf", "Perforation table reflects the latest well status"],
                ["survey", "Deviation survey covers the latest trajectory (incl. sidetracks)"],
                ["schematic", "Well schematic confirms completion type & open perfs"],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-md)] px-1 py-1 text-sm text-[var(--text)]"
              >
                <input
                  type="checkbox"
                  checked={checks[key]}
                  onChange={(e) => setChecks((c) => ({ ...c, [key]: e.target.checked }))}
                  className="h-4 w-4 accent-[var(--tint)]"
                />
                {label}
              </label>
            ))}
          </div>

          <div className="mt-4 flex justify-end">
            <Button disabled={!allChecked} onClick={() => setStage("generate")}>
              Data confirmed{" "}
              <Icon name="chevron" size={15} style={{ transform: "rotate(180deg)" }} />
            </Button>
          </div>
        </Section>
      )}

      {/* 3, Threshold + generate */}
      {(stage === "generate" || stage === "result") && (
        <Section step={3} title="Set the TVD diff threshold, then generate">
          <p className="mb-3 text-sm text-[var(--text-secondary)]">
            Any two stops closer than this in TVD are cancelled. Lower it to keep more stations;
            raise it to collapse close zones. This well is{" "}
            <strong>{well.inclination === 0 ? "vertical" : `${well.inclination}° deviated`}</strong>.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {THRESHOLDS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setThreshold(v)}
                className="rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors"
                style={{
                  borderColor: threshold === v ? "var(--tint)" : "var(--separator)",
                  background: threshold === v ? "var(--fill-subtle)" : "var(--card)",
                  color: threshold === v ? "var(--tint)" : "var(--text-secondary)",
                }}
              >
                {v} ft
              </button>
            ))}
            <div className="flex items-center gap-1.5 ps-1 text-sm text-[var(--text-muted)]">
              <input
                type="number"
                min={1}
                value={threshold}
                onChange={(e) => setThreshold(Math.max(1, Number(e.target.value) || 1))}
                className="w-20 rounded-[var(--radius-md)] border border-[var(--separator)] bg-[var(--card)] px-2 py-1.5 text-[var(--text)]"
              />
              ft
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={generate}>
              <Icon name="gear" size={16} /> Generate SBHP proposal
            </Button>
          </div>
        </Section>
      )}

      {/* 4, The generated proposal (the "perfect template") */}
      {stage === "result" && proposal && (
        <ProposalResult proposal={proposal} onRegenerate={reset} onComplete={onComplete} />
      )}
    </div>
  );
}

function ProposalResult({
  proposal,
  onRegenerate,
  onComplete,
}: {
  proposal: Proposal;
  onRegenerate: () => void;
  onComplete: () => void;
}) {
  const { well, stops, cancelled, totalDuration, tvdThreshold } = proposal;
  const [copied, setCopied] = useState(false);
  const date = today();

  const asText = useMemo(() => {
    const lines: string[] = [];
    lines.push(`SBHP PROPOSAL: ${well.sidetrack ? `${well.name} ${well.sidetrack}` : well.name}`);
    lines.push(`SBHP proposal date: ${date}`);
    lines.push(`Formation: ${well.formation}   Completion: ${well.completionType}   Inclination: ${well.inclination}°`);
    lines.push("");
    lines.push("Perforation intervals (MD ft):");
    well.perforations.forEach((p, i) => lines.push(`  #${i + 1}  ${p.top} – ${p.bottom}  (${p.zone})`));
    lines.push("");
    lines.push("Stops\tMD (ft)\tTVD (ft)\tDuration (min)\tReference");
    stops.forEach((s) =>
      lines.push(
        `${s.n}\t${s.md ?? s.label}\t${s.tvd ?? ""}\t${s.duration}\t${s.reference}`,
      ),
    );
    lines.push("");
    lines.push(`Total duration: ${totalDuration} min   ·   TVD diff threshold: ${tvdThreshold} ft`);
    return lines.join("\n");
  }, [well, stops, totalDuration, tvdThreshold, date]);

  function download() {
    const rows = [
      ["Stops", "MD (ft)", "TVD (ft)", "Duration (min)", "Reference"],
      ...stops.map((s) => [s.n, s.md ?? s.label, s.tvd ?? "", s.duration, s.reference]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${well.name}_SBHP_Proposal.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(asText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked, download remains available */
    }
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-[var(--separator)] bg-[var(--fill-subtle)] px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Icon name="check-circle" size={18} className="text-[var(--success)]" />
              <h2 className="text-[17px] font-bold text-[var(--text)]">
                SBHP proposal: {well.sidetrack ? `${well.name} ${well.sidetrack}` : well.name}
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              Generated {date} · this is the template your proposals should match.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={copy}>
              <Icon name="document" size={15} /> {copied ? "Copied" : "Copy"}
            </Button>
            <Button variant="secondary" onClick={download}>
              <Icon name="link" size={15} /> Download .csv
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        {/* Header + perforation intervals, matches the deck's Step 4 layout */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="mb-1.5 text-xs font-semibold text-[var(--text-secondary)]">
              Well header
            </div>
            <DataTable
              head={["Field", "Value"]}
              rows={[
                ["Well", well.sidetrack ? `${well.name} ${well.sidetrack}` : well.name],
                ["SBHP proposal date", date],
                ["Formation", well.formation],
                ["Completion type", well.completionType],
                ["Inclination", `${well.inclination}°`],
              ]}
            />
          </div>
          <div>
            <div className="mb-1.5 text-xs font-semibold text-[var(--text-secondary)]">
              Perforation intervals
            </div>
            <DataTable
              head={["Interval", "Top", "Bottom", "Zone"]}
              rows={well.perforations.map((p, i) => [`#${i + 1}`, p.top, p.bottom, p.zone])}
            />
          </div>
        </div>

        {/* Stops schedule */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <div className="text-xs font-semibold text-[var(--text-secondary)]">
              Gauge-stop schedule
            </div>
            <div className="flex items-center gap-2">
              <Badge tone="blue">{stops.length} stops</Badge>
              <Badge tone="sky">{totalDuration} min total</Badge>
            </div>
          </div>
          <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--separator)]">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[var(--fill-subtle)]">
                  {["Stops", "MD (ft)", "TVD (ft)", "Duration (min)", "Reference"].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-start text-xs font-semibold text-[var(--text-secondary)]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stops.map((s) => {
                  const final = s.reference.startsWith("Final");
                  return (
                    <tr
                      key={s.n}
                      className="border-t border-[var(--separator)]"
                      style={final ? { background: "var(--success-soft)" } : undefined}
                    >
                      <td className="px-3 py-2 font-semibold text-[var(--text)]">{s.n}</td>
                      <td className="px-3 py-2 text-[var(--text)]">
                        {s.md ?? <span className="font-semibold">{s.label}</span>}
                      </td>
                      <td className="px-3 py-2 text-[var(--text-secondary)]">{s.tvd ?? "-"}</td>
                      <td className="px-3 py-2 text-[var(--text)]">{s.duration}</td>
                      <td className="px-3 py-2">
                        <span
                          className="text-xs font-medium"
                          style={{ color: final ? "var(--success)" : "var(--text-muted)" }}
                        >
                          {s.reference}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {cancelled.length > 0 && (
            <p className="mt-2.5 flex items-start gap-1.5 text-xs text-[var(--text-muted)]">
              <Icon name="alert" size={13} className="mt-0.5 shrink-0" />
              <span>
                {cancelled.length} candidate station{cancelled.length > 1 ? "s" : ""} cancelled by
                the {tvdThreshold} ft TVD threshold:{" "}
                {cancelled.map((c) => `${c.md} ft MD (Δ${c.gap.toFixed(0)} ft TVD)`).join(", ")}.
              </span>
            </p>
          )}
        </div>

        {/* What makes it correct */}
        <div className="rounded-[var(--radius-lg)] bg-[var(--fill-subtle)] p-4">
          <div className="mb-2 text-sm font-semibold text-[var(--text)]">
            What makes this a valid proposal
          </div>
          <ul className="space-y-1.5 text-sm text-[var(--text-secondary)]">
            {[
              "Starts at the lubricator and steps down on a gradient grid.",
              "Every MD is converted to TVD from the deviation survey.",
              "Stops closer than the TVD threshold are collapsed, no unresolvable stations.",
              "The deepest zone carries the long final soak, the datum reading.",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <Icon name="check" size={15} className="mt-0.5 shrink-0 text-[var(--success)]" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--separator)] pt-4">
          <Button variant="ghost" onClick={onRegenerate}>
            <Icon name="refresh" size={15} /> Try another well
          </Button>
          <Button variant="success" onClick={onComplete}>
            <Icon name="check" size={16} /> Complete module
          </Button>
        </div>
      </div>
    </Card>
  );
}
