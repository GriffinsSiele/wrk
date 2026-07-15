"use client";

type DonutProps = {
  value: number;
  size?: number;
  thickness?: number;
  label?: string;
  sublabel?: string;
  colors?: string[];
  className?: string;
};

export function DonutChart({
  value,
  size = 160,
  thickness = 14,
  label,
  sublabel = "score",
  colors = ["var(--ox-accent)", "var(--ox-blue)", "var(--ox-indigo)"],
  className = "",
}: DonutProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;

  return (
    <div className={`relative inline-grid place-items-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="ox-donut-spin -rotate-90" aria-hidden>
        <defs>
          <linearGradient id={`donut-grad-${label || "d"}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors[0]} />
            <stop offset="55%" stopColor={colors[1]} />
            <stop offset="100%" stopColor={colors[2] || colors[1]} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(62,128,204,0.12)"
          strokeWidth={thickness}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#donut-grad-${label || "d"})`}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="ox-donut-draw"
          style={{ ["--ox-donut-offset" as string]: offset }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-outfit font-bold leading-none" style={{ fontSize: size * 0.22, color: "var(--ox-fg-dark)" }}>
            {clamped}%
          </div>
          {sublabel && (
            <div className="text-[10px] uppercase tracking-[0.16em] mt-1" style={{ color: "var(--ox-muted)" }}>
              {sublabel}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type MultiDonutSegment = { value: number; color: string; label: string };

export function MultiSegmentDonut({
  segments,
  size = 150,
  thickness = 16,
  centerLabel,
  centerValue,
}: {
  segments: MultiDonutSegment[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  let acc = 0;
  const stops = segments.map((seg) => {
    const start = (acc / total) * 100;
    acc += seg.value;
    const end = (acc / total) * 100;
    return `${seg.color} ${start}% ${end}%`;
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="ox-donut-spin rounded-full grid place-items-center"
        style={{
          width: size,
          height: size,
          background: `conic-gradient(${stops.join(", ")})`,
          boxShadow: "0 18px 40px -28px rgba(46,60,142,0.55)",
        }}
      >
        <div
          className="rounded-full grid place-items-center text-center"
          style={{
            width: size - thickness * 2,
            height: size - thickness * 2,
            background: "var(--ox-surface-strong)",
          }}
        >
          <div>
            <div className="font-outfit font-bold text-2xl" style={{ color: "var(--ox-fg-dark)" }}>
              {centerValue}
            </div>
            {centerLabel && (
              <div className="text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--ox-muted)" }}>
                {centerLabel}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--ox-muted)" }}>
            <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}

type AreaChartProps = {
  path: string;
  areaPath?: string;
  width?: number;
  height?: number;
  gradientId: string;
};

export function AreaTrendChart({ path, areaPath, width = 280, height = 88, gradientId }: AreaChartProps) {
  const fill = areaPath || `${path} L${width - 4} ${height - 8} L4 ${height - 8} Z`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28" aria-hidden>
      <defs>
        <linearGradient id={`${gradientId}-stroke`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(37,192,210,0.95)" />
          <stop offset="100%" stopColor="rgba(62,128,204,0.95)" />
        </linearGradient>
        <linearGradient id={`${gradientId}-fill`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(37,192,210,0.28)" />
          <stop offset="100%" stopColor="rgba(37,192,210,0)" />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#${gradientId}-fill)`} className="ox-area-fade" />
      <path
        d={path}
        fill="none"
        stroke={`url(#${gradientId}-stroke)`}
        strokeWidth="2.8"
        strokeLinecap="round"
        className="ox-line-draw"
      />
      <path d={`M4 ${height - 8} L${width - 4} ${height - 8}`} stroke="rgba(62,128,204,0.18)" strokeWidth="1" />
    </svg>
  );
}

type BarSeriesItem = { label: string; value: number };

export function AnimatedBarChart({
  data,
  height = 160,
}: {
  data: BarSeriesItem[];
  height?: number;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="grid items-end gap-2" style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))`, height }}>
      {data.map((item, idx) => (
        <div key={item.label} className="flex flex-col items-center justify-end gap-2 h-full">
          <span className="text-[10px] font-medium ox-count-in" style={{ color: "var(--ox-fg)", animationDelay: `${idx * 70}ms` }}>
            {item.value}
          </span>
          <div
            className="ox-bar w-full rounded-t-md"
            style={{
              height: `${Math.max(12, (item.value / max) * (height - 36))}px`,
              animationDelay: `${idx * 80}ms`,
              background: "linear-gradient(to top, rgba(62,128,204,0.25), rgba(37,192,210,0.9))",
            }}
          />
          <span className="text-[10px] text-center leading-tight" style={{ color: "var(--ox-muted)" }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function Sparkline({
  values,
  color = "var(--ox-accent)",
}: {
  values: number[];
  color?: string;
}) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1 || 1)) * 64;
      const y = 22 - ((v - min) / range) * 18;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 64 24" className="w-16 h-6" aria-hidden>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="ox-line-draw"
      />
    </svg>
  );
}
