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
  colors = ["var(--mint)", "var(--teal)", "var(--bronze)"],
  className = "",
}: DonutProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;
  const stroke = colors[0] || "var(--mint)";

  return (
    <div className={`relative inline-grid place-items-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(150,118,43,0.25)"
          strokeWidth={thickness}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth={thickness}
          strokeLinecap="butt"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="ox-donut-draw"
          style={{ ["--ox-donut-offset" as string]: offset }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display leading-none" style={{ fontSize: size * 0.22, color: "var(--ox-fg-dark)", fontWeight: 500 }}>
            {clamped}%
          </div>
          {sublabel && (
            <div className="font-display text-[10px] uppercase tracking-[0.16em] mt-1" style={{ color: "var(--ox-muted)" }}>
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
            <div className="font-display text-2xl" style={{ color: "var(--ox-fg-dark)", fontWeight: 500 }}>
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
  values?: number[];
  path?: string;
  areaPath?: string;
  width?: number;
  height?: number;
  gradientId: string;
};

/** Build a smooth-ish polyline path from raw series values (empty → flat baseline). */
export function buildAreaPaths(values: number[], width: number, height: number) {
  const padX = 4;
  const padY = 8;
  const usableW = width - padX * 2;
  const usableH = height - padY * 2;
  const n = values.length;
  if (n === 0 || values.every((v) => v === 0)) {
    const y = height - padY;
    const line = `M${padX} ${y} L${width - padX} ${y}`;
    return { path: line, areaPath: `${line} L${width - padX} ${y} L${padX} ${y} Z` };
  }
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) => {
    const x = padX + (n === 1 ? usableW / 2 : (i / (n - 1)) * usableW);
    const y = padY + usableH - (v / max) * usableH;
    return { x, y };
  });
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${path} L${pts[pts.length - 1].x.toFixed(1)} ${height - padY} L${pts[0].x.toFixed(1)} ${height - padY} Z`;
  return { path, areaPath };
}

export function AreaTrendChart({
  values,
  path: pathProp,
  areaPath: areaProp,
  width = 280,
  height = 88,
  gradientId: _gradientId,
}: AreaChartProps) {
  const built = values ? buildAreaPaths(values, width, height) : null;
  const path = built?.path ?? pathProp ?? `M4 ${height - 8} L${width - 4} ${height - 8}`;
  const fill = areaProp || built?.areaPath || `${path} L${width - 4} ${height - 8} L4 ${height - 8} Z`;
  const empty = values ? values.length === 0 || values.every((v) => v === 0) : false;

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28" aria-hidden>
        <path d={fill} fill="rgba(42,161,135,0.12)" className="ox-area-fade" />
        <path
          d={path}
          fill="none"
          stroke="var(--mint)"
          strokeWidth="2.4"
          strokeLinecap="round"
          className="ox-line-draw"
        />
        <path d={`M4 ${height - 8} L${width - 4} ${height - 8}`} stroke="rgba(150,118,43,0.35)" strokeWidth="1" />
      </svg>
      {empty && (
        <p className="absolute inset-0 grid place-items-center text-[11px]" style={{ color: "var(--ox-muted)" }}>
          No activity in this period
        </p>
      )}
    </div>
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
  if (!data.length || data.every((d) => d.value === 0)) {
    return (
      <div className="grid place-items-center text-[12px]" style={{ height, color: "var(--ox-muted)" }}>
        No activity in this period
      </div>
    );
  }
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="grid items-end gap-2" style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))`, height }}>
      {data.map((item, idx) => (
        <div key={item.label} className="flex flex-col items-center justify-end gap-2 h-full">
          <span className="font-body text-[10px] ox-count-in" style={{ color: "var(--ox-muted)", animationDelay: `${idx * 70}ms` }}>
            {item.value}
          </span>
          <div
            className="ox-bar w-full"
            style={{
              height: `${item.value <= 0 ? 0 : Math.max(4, (item.value / max) * (height - 36))}px`,
              animationDelay: `${idx * 80}ms`,
              background: "var(--mint)",
              opacity: 0.85,
              borderRadius: "1px 1px 0 0",
            }}
          />
          <span className="font-body text-[10px] text-center leading-tight" style={{ color: "var(--ox-muted)" }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function Sparkline({
  values,
  color = "var(--mint)",
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
