"use client";

import { getDepartmentIcon } from "./icons";
import { healthOf, HEALTH_COLOR } from "@/lib/kpi";

export function Hub({ departments, onSelect }) {
  const n = departments.length;
  const nodes = departments.map((d, i) => {
    const angle = (-90 + (360 / n) * i) * (Math.PI / 180);
    const x = 50 + 37 * Math.cos(angle);
    const y = 50 + 37 * Math.sin(angle);
    return { ...d, x, y };
  });

  return (
    <div className="hub-wrap">
      <svg className="hub-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
        {nodes.map((node) => (
          <line key={node.key} x1="50" y1="50" x2={node.x} y2={node.y} className="hub-line" />
        ))}
      </svg>
      <div className="hub-center">
        <div className="hub-center-label">MECHANICS</div>
        <div className="hub-center-sub">the machine</div>
      </div>
      {nodes.map((node) => {
        const avgHealth = node.kpis.length
          ? node.kpis.map(healthOf).reduce((acc, h) => (h === "bad" ? acc + 2 : h === "warn" ? acc + 1 : acc), 0) / node.kpis.length
          : 0;
        const status = avgHealth >= 1.2 ? "bad" : avgHealth >= 0.4 ? "warn" : "good";
        const Icon = getDepartmentIcon(node.icon);
        return (
          <button
            key={node.key}
            className="hub-node"
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            onClick={() => onSelect(node.key)}
          >
            <span className="hub-node-dot" style={{ background: HEALTH_COLOR[status] }} />
            <Icon size={18} strokeWidth={1.75} />
            <span className="hub-node-label">{node.short}</span>
          </button>
        );
      })}
    </div>
  );
}
