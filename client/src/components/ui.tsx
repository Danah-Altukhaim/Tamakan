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
        "rounded-2xl bg-[var(--card)] border border-[var(--separator)]",
        "shadow-[var(--shadow-card)]",
        interactive
          ? "cursor-pointer transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-raised)] text-start w-full"
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

const TONES: Record<Tone, { bg: string; fg: string; bd: string }> = {
  blue: { bg: "rgba(10,74,159,.10)", fg: "#0a4a9f", bd: "rgba(10,74,159,.22)" },
  sky: { bg: "rgba(43,108,176,.10)", fg: "#2b6cb0", bd: "rgba(43,108,176,.22)" },
  green: { bg: "rgba(22,163,74,.12)", fg: "#15803d", bd: "rgba(22,163,74,.24)" },
  amber: { bg: "rgba(176,127,24,.12)", fg: "#96690f", bd: "rgba(176,127,24,.26)" },
  red: { bg: "rgba(220,38,38,.10)", fg: "#b91c1c", bd: "rgba(220,38,38,.22)" },
  gray: { bg: "rgba(100,116,139,.12)", fg: "#475569", bd: "rgba(100,116,139,.24)" },
  sand: { bg: "rgba(201,168,76,.16)", fg: "#8a6d1e", bd: "rgba(201,168,76,.3)" },
};

export function Badge({ children, tone = "blue" }: { children: ReactNode; tone?: Tone }) {
  const c = TONES[tone];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap"
      style={{ background: c.bg, color: c.fg, border: `1px solid ${c.bd}` }}
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
    "inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: Record<string, string> = {
    primary: "bg-[var(--koc-blue)] text-white hover:bg-[var(--koc-navy)]",
    secondary:
      "bg-[var(--fill-subtle)] text-[var(--koc-blue)] hover:bg-[rgba(10,74,159,.14)]",
    ghost: "text-[var(--koc-blue)] hover:bg-[var(--fill-subtle)]",
    success: "bg-[var(--success-soft)] text-[var(--success)] hover:brightness-95",
  };
  return (
    <button className={[base, variants[variant], className].join(" ")} {...rest}>
      {children}
    </button>
  );
}

/** Thin linear progress bar (logical-property safe). */
export function ProgressBar({ value, tone = "blue" }: { value: number; tone?: Tone }) {
  const fill = tone === "green" ? "var(--success)" : "var(--koc-blue)";
  return (
    <div className="h-1.5 w-full rounded-full bg-[var(--separator)] overflow-hidden">
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{ inlineSize: `${Math.max(0, Math.min(100, value))}%`, background: fill }}
      />
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>}
    </header>
  );
}

export function StatTile({
  icon,
  value,
  label,
  accent = "var(--koc-blue)",
  onClick,
}: {
  icon: ReactNode;
  value: ReactNode;
  label: string;
  accent?: string;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <div
        className="mb-3 grid h-10 w-10 place-items-center rounded-xl"
        style={{ background: `color-mix(in srgb, ${accent} 12%, transparent)`, color: accent }}
      >
        {icon}
      </div>
      <div className="text-lg font-bold" style={{ color: accent }}>
        {value}
      </div>
      <div className="mt-0.5 text-xs text-[var(--text-muted)]">{label}</div>
    </>
  );

  if (onClick) {
    return (
      <Card className="p-0">
        <button
          type="button"
          onClick={onClick}
          className="w-full rounded-2xl p-5 text-start transition hover:bg-[var(--fill-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--koc-blue)]"
        >
          {inner}
        </button>
      </Card>
    );
  }

  return <Card className="p-5">{inner}</Card>;
}
