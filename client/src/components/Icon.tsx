import type { SVGProps } from "react";

/**
 * Tamakan icon system — line-style SVG glyphs in the KOC/HIG idiom.
 *
 * No emoji anywhere in the UI: every pictogram is a themed vector that inherits
 * `currentColor`, so it tints to whatever text color its container sets and
 * mirrors correctly under RTL when flipped by the caller.
 *
 * Track `icon` fields (server data) are semantic keys resolved here, so content
 * stays data-driven while the rendering stays on-brand.
 */

export type IconName =
  // Track glyphs
  | "reservoir"
  | "gear"
  | "chart-bar"
  | "shield"
  | "gauge"
  | "flask"
  | "magnifier"
  | "pipe"
  | "grid"
  | "ruler"
  | "spark"
  | "wrench"
  | "layers"
  | "globe"
  // Stat / status glyphs
  | "trophy"
  | "book"
  | "flame"
  | "trend-up"
  | "check-circle"
  | "alert"
  // Content-type glyphs
  | "play"
  | "document"
  | "video"
  | "cursor"
  // UI glyphs
  | "link"
  | "assistant"
  | "lock"
  | "dot"
  | "clock"
  | "search"
  | "check"
  | "chevron"
  | "graduation"
  | "dashboard";

/** Stroke-based paths (share the svg's fill=none / stroke=currentColor). */
const STROKE: Partial<Record<IconName, React.ReactNode>> = {
  reservoir: <path d="M12 3s6 6.5 6 10.5a6 6 0 0 1-12 0C6 9.5 12 3 12 3Z" />,
  gear: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </>
  ),
  "chart-bar": <path d="M5 20V11M12 20V4M19 20v-6M4 20h16" />,
  shield: <path d="M12 3l7 3v5.5c0 4.5-3 7.5-7 9.5-4-2-7-5-7-9.5V6l7-3Z" />,
  gauge: (
    <>
      <path d="M4 15a8 8 0 0 1 16 0" />
      <path d="M12 15l4.5-3.5" />
      <circle cx="12" cy="15" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  flask: <path d="M9.5 3h5M10.5 3v5.2L5.6 16.8A2 2 0 0 0 7.4 20h9.2a2 2 0 0 0 1.8-3.2L13.5 8.2V3M8.5 14h7" />,
  magnifier: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="M20 20l-4.3-4.3" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="M20 20l-4.3-4.3" />
    </>
  ),
  pipe: <path d="M3 9h7a3 3 0 0 1 3 3v9M3 6h4M9 9V6M17 21h4M17 12h4v9" />,
  grid: <path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18" />,
  ruler: (
    <>
      <path d="M15.5 3.5l5 5L8.5 20.5l-5-5Z" />
      <path d="M9 7l1.5 1.5M12 4l1.5 1.5M6 10l1.5 1.5" />
    </>
  ),
  wrench: <path d="M15 4a4.5 4.5 0 0 0-5.6 5.6L3 16v5h5l6.4-6.4A4.5 4.5 0 0 0 20 9l-2.7 2.7-2.5-.5-.5-2.5L17 6Z" />,
  spark: <path d="M12.5 3 8 12h4l-1.5 9L17 10h-4l1.5-7Z" />,
  layers: <path d="M12 3 3 8l9 5 9-5-9-5ZM3 13l9 5 9-5M3 17.5l9 5 9-5" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </>
  ),
  trophy: <path d="M7 4h10v4a5 5 0 0 1-10 0V4ZM7 5H4v1.5A3.5 3.5 0 0 0 7.5 10M17 5h3v1.5A3.5 3.5 0 0 1 16.5 10M12 13v3M8.5 20h7M9.5 20l.5-4h4l.5 4" />,
  book: <path d="M12 6C10 4.8 6.5 4.5 4 4.8v13c2.5-.3 6 0 8 1.2 2-1.2 5.5-1.5 8-1.2v-13c-2.5-.3-6 0-8 1.2ZM12 6v13" />,
  flame: <path d="M12.5 3c.4 3-1.6 4.2-2.8 5.8C8.3 10 7 11.5 7 14a5 5 0 0 0 10 0c0-2-1-3.6-2-5-.5 1-1.2 1.6-2 1.8C13.6 8 13.6 5 12.5 3Z" />,
  "trend-up": <path d="M4 16l5-5 3 3 7-7M15 7h6v6" />,
  "check-circle": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.2l2.8 2.8L16.2 9.4" />
    </>
  ),
  alert: <path d="M12 4 2.5 20.5h19L12 4ZM12 10v5M12 18h.01" />,
  play: <path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" stroke="none" />,
  document: <path d="M7 3h7l4 4v14H7V3ZM14 3v4h4M9.5 12h5M9.5 15.5h5" />,
  video: <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h9A1.5 1.5 0 0 1 15 7.5v9A1.5 1.5 0 0 1 13.5 18h-9A1.5 1.5 0 0 1 3 16.5v-9ZM15 10.5l6-3.5v10l-6-3.5" />,
  cursor: <path d="M5 3.5l14.5 7.2-6.3 1.8-1.9 6.3L5 3.5Z" />,
  link: <path d="M10.5 13.5l3-3M9.5 8.5l1.5-1.5a3.5 3.5 0 0 1 5 5L14.5 13.5M14.5 15.5l-1.5 1.5a3.5 3.5 0 0 1-5-5L9.5 10.5" />,
  assistant: (
    <>
      <path d="M12 3l1.6 4.9L18.5 9.5l-4.9 1.6L12 16l-1.6-4.9L5.5 9.5l4.9-1.6L12 3Z" />
      <path d="M18.5 15l.7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7.7-2.1Z" />
    </>
  ),
  lock: (
    <>
      <path d="M6 10.5h12V21H6zM9 10.5V7a3 3 0 0 1 6 0v3.5" />
      <circle cx="12" cy="15.5" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  dot: <circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5.2l3.2 2" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7" />,
  chevron: <path d="M14.5 6l-6 6 6 6" />,
  graduation: <path d="M12 4 2.5 8.5 12 13l9.5-4.5L12 4ZM6.5 11v4.5c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5V11M21.5 8.5V14" />,
  dashboard: <path d="M3.5 3.5h7v7h-7zM13.5 3.5h7v4.5h-7zM13.5 11h7v9.5h-7zM3.5 13h7v7.5h-7z" />,
};

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: string;
  size?: number;
}

export function Icon({ name, size = 20, className, ...rest }: IconProps) {
  const glyph = STROKE[name as IconName] ?? STROKE.dot;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable={false}
      className={className}
      {...rest}
    >
      {glyph}
    </svg>
  );
}
