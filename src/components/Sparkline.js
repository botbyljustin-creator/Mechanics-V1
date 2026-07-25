"use client";

import { sparklinePoints } from "@/lib/kpi";

export function Sparkline({ history, color }) {
  const values = (history || []).map((h) => h.actual);
  const points = sparklinePoints(values);

  if (points.length === 0) {
    return <div className="trend-label muted">Not enough history yet</div>;
  }

  const line = points.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `0,32 ${line} 120,32`;
  const last = points[points.length - 1];

  return (
    <svg width="120" height="32" viewBox="0 0 120 32">
      <line x1="0" y1="28" x2="120" y2="28" stroke="var(--line)" strokeWidth="1" />
      {points.length > 1 && <polygon points={area} fill={color} opacity="0.12" />}
      {points.length > 1 && (
        <polyline points={line} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      )}
      <circle cx={last.x} cy={last.y} r="2.75" fill={color} />
    </svg>
  );
}
