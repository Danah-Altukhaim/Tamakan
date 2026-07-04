import type { SVGProps } from "react";

/**
 * Tamakan icon system, line-style SVG glyphs in the KOC/HIG idiom.
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
  | "dashboard"
  | "refresh"
  | "users"
  | "target"
  | "hourglass"
  | "briefcase";

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
    // Nassour — a standing T-rex silhouette (plates, tail, carved eye).
    <path
      fill="currentColor"
      stroke="none"
      fillRule="evenodd"
      d="M15.88 1.7C15.17 1.96 14.5 2.64 14.27 3.37C14.16 3.7 13.95 5.12 13.78 6.52C13.6 8.12 13.4 9.34 13.22 9.81C12.86 10.75 12.08 11.59 11.05 12.14C10.47 12.44 9.75 13.05 8.62 14.19C6.42 16.41 5.6 16.78 2.96 16.8C1.67 16.8 1.57 16.81 1.57 17.07C1.57 17.43 2.74 18.33 3.67 18.68C4.5 18.98 6.73 19.25 7.96 19.19C8.83 19.15 8.78 19.23 8.59 18.11C8.54 17.78 8.56 17.6 8.67 17.6C8.75 17.6 8.82 17.75 8.82 17.92C8.82 18.1 8.91 18.5 9.03 18.82C9.16 19.16 9.29 20.08 9.34 20.96L9.42 22.5L10.97 22.5L12.51 22.5L12.47 22.16C12.46 21.98 12.25 21.68 12.04 21.49C11.81 21.31 11.64 21.08 11.64 20.97C11.64 20.88 11.85 20.55 12.12 20.26C12.89 19.4 13.25 18.5 13.25 17.39C13.25 16.86 13.18 16.25 13.1 16.01C12.89 15.37 13.07 15.32 13.33 15.94C13.5 16.35 13.53 16.73 13.48 17.7L13.41 18.94L13.89 18.73C15.7 17.98 16.87 16.61 17.26 14.81C17.46 13.85 17.46 13.86 16.94 13.64C16.58 13.48 16.47 13.35 16.39 12.97C16.31 12.56 16.25 12.5 15.86 12.5C15.3 12.5 14.63 12.26 14.54 12.02C14.44 11.78 14.59 11.79 14.91 12.03C15.06 12.15 15.46 12.23 15.82 12.23C16.24 12.23 16.5 12.3 16.52 12.4C16.74 13.23 16.83 13.38 17.14 13.42C17.82 13.52 18.07 12.41 17.5 11.75C17.26 11.47 17.01 11.36 16.41 11.28C15.68 11.19 15.41 11.09 15.54 10.97C15.57 10.95 15.93 10.97 16.33 11.03C16.74 11.08 17.13 11.09 17.19 11.05C17.26 11.03 17.27 10.61 17.23 10.15C17.06 8.29 17.54 7.81 19.55 7.81C21 7.81 21.5 7.61 21.97 6.84C22.43 6.08 22.4 6.06 20.57 6.06C19.14 6.06 18.87 6.02 18.6 5.81C18.43 5.66 18.32 5.5 18.37 5.45C18.44 5.39 18.59 5.45 18.72 5.57C18.92 5.75 19.27 5.79 20.68 5.79L22.4 5.79L22.35 4.26C22.32 2.96 22.27 2.67 22.02 2.35C21.49 1.61 21.06 1.5 18.62 1.5C17.09 1.51 16.24 1.57 15.88 1.7ZM17.94 3.43C17.94 3.77 17.74 3.93 17.45 3.81C17.26 3.75 17.21 3.35 17.37 3.2C17.41 3.15 17.57 3.11 17.7 3.11C17.86 3.11 17.94 3.2 17.94 3.43ZM13.15 3.73C12.66 3.94 12.44 4.12 12.44 4.28C12.44 4.52 13.37 5.91 13.53 5.93C13.6 5.93 13.95 3.49 13.88 3.43C13.87 3.42 13.53 3.55 13.15 3.73ZM12.68 7.04C12.34 7.28 12.01 7.54 11.99 7.63C11.89 7.86 12.98 9.2 13.13 9.05C13.23 8.95 13.5 7.38 13.52 6.83C13.52 6.52 13.42 6.55 12.68 7.04ZM12.38 9.6C11.81 9.77 11.66 10.05 11.83 10.71C11.96 11.2 12.25 11.09 12.64 10.42C13.13 9.6 13.07 9.42 12.38 9.6ZM17.54 10.64C17.54 10.93 17.61 11.07 17.81 11.12C17.97 11.16 18.08 11.31 18.08 11.5C18.08 11.66 18.2 11.9 18.35 12.03C18.58 12.23 18.67 12.25 18.95 12.13C19.23 11.99 19.29 11.87 19.29 11.43C19.29 10.68 18.83 10.22 18.08 10.22C17.57 10.22 17.54 10.24 17.54 10.64ZM9.91 10.91C9.68 11.51 9.6 12.34 9.76 12.44C9.93 12.54 11.77 11.48 11.77 11.28C11.77 11.13 11.02 10.79 10.43 10.66C10.09 10.61 10.01 10.65 9.91 10.91ZM8 12.58C7.97 13.2 8.04 14.06 8.14 14.15C8.19 14.21 8.55 13.91 8.95 13.51C9.76 12.64 9.73 12.5 8.7 12.4C8.1 12.34 8.01 12.37 8 12.58ZM6.73 14.61C6.51 14.82 6.47 15.59 6.67 15.59C6.83 15.59 7.75 14.8 7.75 14.65C7.75 14.45 6.93 14.42 6.73 14.61ZM15.26 18.27C15.07 18.41 14.64 18.66 14.29 18.82L13.68 19.12L13.58 20.27C13.53 20.98 13.54 21.57 13.64 21.79C13.77 22.16 13.78 22.16 15.13 22.16C16.33 22.16 16.47 22.14 16.47 21.92C16.47 21.79 16.32 21.53 16.13 21.36C15.81 21.06 15.8 20.97 15.8 19.6C15.8 18.81 15.74 18.13 15.69 18.09C15.64 18.06 15.44 18.14 15.26 18.27Z"
    />
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
  refresh: (
    <>
      <path d="M20 8a8 8 0 1 0 1 6" />
      <path d="M20 3.5V8h-4.5" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 5.2a3.2 3.2 0 0 1 0 5.6M17 20a5.5 5.5 0 0 0-3-4.9" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  hourglass: <path d="M7 3h10M7 21h10M7 3c0 4 5 5 5 9s-5 5-5 9M17 3c0 4-5 5-5 9s5 5 5 9" />,
  briefcase: (
    <>
      <rect x="3.5" y="7.5" width="17" height="12" rx="2" />
      <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3.5 12.5h17" />
    </>
  ),
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
