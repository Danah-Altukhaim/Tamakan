interface ProgressRingProps {
  value: number; // 0–100
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
  label?: string;
}

/** Apple-HIG-style progress ring. Uses currentColor-independent tokens. */
export function ProgressRing({
  value,
  size = 88,
  stroke = 8,
  color = "var(--koc-sand)",
  trackColor = "rgba(255,255,255,0.18)",
  label,
}: ProgressRingProps) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circ - (clamped / 100) * circ;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={label ?? `${clamped}% complete`}
    >
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.6s var(--ease-out)" }}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        style={{ fontSize: size * 0.24, fontWeight: 700, fill: "currentColor" }}
      >
        {clamped}%
      </text>
    </svg>
  );
}
