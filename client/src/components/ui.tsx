import { useEffect } from "react";
import type { ReactNode, ButtonHTMLAttributes } from "react";

/** Shared HIG-styled primitives. Themed via tokens; RTL-safe (logical props). */

/**
 * Centered modal sheet. Backdrop dismiss, Escape to close, focus-trapping-lite
 * via aria-modal. RTL-safe (no hard-coded left/right).
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  labelledBy = "sheet-title",
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  labelledBy?: string;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 fade-in"
      style={{ background: "rgba(13,27,75,0.36)" }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? labelledBy : undefined}
        className="sheet-enter w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-2xl bg-[var(--card)] border border-[var(--separator)]"
        style={{ boxShadow: "var(--shadow-sheet)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-start justify-between gap-4 border-b border-[var(--separator)] p-5">
            <div id={labelledBy} className="min-w-0">
              {title}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full text-[var(--text-muted)] hover:bg-[var(--fill-subtle)]"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M4 4l8 8M12 4l-8 8"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function Card({
  children,
  className = "",
  as: Tag = "div",
  interactive = false,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "button" | "a";
  interactive?: boolean;
} & Record<string, unknown>) {
  return (
    <Tag
      className={[
        "rounded-[var(--radius-2xl)] bg-[var(--card)] border border-[var(--separator)]",
        "shadow-[var(--shadow-card)]",
        interactive
          ? "cursor-pointer transition-[transform,box-shadow,border-color] duration-[var(--duration-quick)] ease-[var(--ease-out)] hover:-translate-y-px hover:border-[var(--separator-strong)] hover:shadow-[var(--shadow-raised)] text-start w-full"
          : "",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </Tag>
  );
}

type Tone = "blue" | "green" | "amber" | "gray" | "sky" | "red" | "sand";

/* Soft, borderless capsules. Desaturated fills; one restrained fg per tone. */
const TONES: Record<Tone, { bg: string; fg: string }> = {
  blue: { bg: "rgba(10,74,159,.09)", fg: "#0a4a9f" },
  sky: { bg: "rgba(43,108,176,.09)", fg: "#245a94" },
  green: { bg: "var(--success-soft)", fg: "#177544" },
  amber: { bg: "var(--warning-soft)", fg: "#8a6410" },
  red: { bg: "var(--danger-soft)", fg: "#b23a3a" },
  gray: { bg: "var(--fill)", fg: "var(--text-secondary)" },
  sand: { bg: "rgba(201,168,76,.16)", fg: "#8a6d1e" },
};

export function Badge({ children, tone = "gray" }: { children: ReactNode; tone?: Tone }) {
  const c = TONES[tone];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none whitespace-nowrap"
      style={{ background: c.bg, color: c.fg }}
    >
      {children}
    </span>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...rest
}: {
  variant?: "primary" | "secondary" | "ghost" | "success";
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-[transform,filter,background-color] duration-[var(--duration-quick)] active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100";
  const variants: Record<string, string> = {
    primary:
      "text-white bg-[var(--tint)] bg-[image:var(--grad-brand)] shadow-[0_4px_14px_rgba(10,74,159,0.28)] hover:brightness-[1.06] hover:-translate-y-px",
    secondary:
      "bg-[var(--fill)] text-[var(--text)] hover:bg-[var(--fill-strong)]",
    ghost: "text-[var(--tint)] hover:bg-[var(--fill-subtle)]",
    success: "bg-[var(--success-soft)] text-[var(--success)] hover:brightness-[0.97]",
  };
  return (
    <button className={[base, variants[variant], className].join(" ")} {...rest}>
      {children}
    </button>
  );
}

/** Thin linear progress bar (logical-property safe). Gradient fill for depth. */
export function ProgressBar({ value, tone = "blue" }: { value: number; tone?: Tone }) {
  const fill =
    tone === "green"
      ? "linear-gradient(90deg, #4ccb7e, #7fdda0)"
      : "linear-gradient(90deg, #4f9ce2, #8fc7f2)";
  return (
    <div className="h-1.5 w-full rounded-full bg-[var(--fill-strong)] overflow-hidden">
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-[var(--ease-out)]"
        style={{ inlineSize: `${Math.max(0, Math.min(100, value))}%`, background: fill }}
      />
    </div>
  );
}

/** Large-title page header, HIG-style. */
export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-7">
      <h1 className="text-[28px] font-bold leading-tight text-[var(--text)]">{title}</h1>
      {subtitle && (
        <p className="mt-1.5 text-[15px] text-[var(--text-secondary)]">{subtitle}</p>
      )}
    </header>
  );
}

/**
 * Metric tile. Each carries a named accent — a vivid gradient glyph chip over a
 * whisper-tinted card — so a row of tiles reads as a lively, coherent set rather
 * than a wall of gray. KOC blue still leads; the palette is curated, not random.
 */
export type AccentTone = "blue" | "sky" | "teal" | "violet" | "amber" | "orange" | "rose" | "green";

const ACCENTS: Record<AccentTone, string> = {
  blue: "var(--accent-blue)",
  sky: "var(--accent-sky)",
  teal: "var(--accent-teal)",
  violet: "var(--accent-violet)",
  amber: "var(--accent-amber)",
  orange: "var(--accent-orange)",
  rose: "var(--accent-rose)",
  green: "var(--accent-green)",
};

export function StatTile({
  icon,
  value,
  label,
  tone = "blue",
  onClick,
}: {
  icon: ReactNode;
  value: ReactNode;
  label: string;
  tone?: AccentTone;
  onClick?: () => void;
}) {
  const c = ACCENTS[tone];
  const cardBg = `color-mix(in srgb, ${c} 6%, var(--card))`;
  const cardBorder = `color-mix(in srgb, ${c} 16%, var(--separator))`;
  // Pastel chip: pale tinted fill with an accent-colored glyph (no dark solids)
  const chip = `linear-gradient(135deg, color-mix(in srgb, ${c} 14%, white), color-mix(in srgb, ${c} 30%, white))`;

  const inner = (
    <>
      <div
        className="mb-4 grid h-10 w-10 place-items-center rounded-[var(--radius-md)]"
        style={{
          background: chip,
          color: c,
          boxShadow: `0 4px 12px color-mix(in srgb, ${c} 16%, transparent)`,
        }}
      >
        {icon}
      </div>
      <div className="text-[22px] font-semibold leading-tight tracking-[-0.01em] text-[var(--text)]">
        {value}
      </div>
      <div className="mt-1 text-[13px] text-[var(--text-muted)]">{label}</div>
    </>
  );

  const cardStyle = { background: cardBg, borderColor: cardBorder } as const;

  if (onClick) {
    return (
      <Card className="h-full p-0" style={cardStyle}>
        <button
          type="button"
          onClick={onClick}
          className="group flex h-full w-full flex-col rounded-[var(--radius-2xl)] p-5 text-start transition-transform duration-[var(--duration-quick)] ease-[var(--ease-out)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tint)]"
        >
          {inner}
        </button>
      </Card>
    );
  }

  return (
    <Card className="h-full p-5" style={cardStyle}>
      {inner}
    </Card>
  );
}
