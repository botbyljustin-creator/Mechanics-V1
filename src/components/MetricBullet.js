"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { KpiGauge } from "./KpiGauge";
import { formatValue, healthOf, HEALTH_COLOR } from "@/lib/kpi";

export function MetricBullet({ metric, canEdit, onChange }) {
  const [expanded, setExpanded] = useState(false);
  const health = healthOf(metric);

  return (
    <div className="metric-bullet">
      <button
        className="metric-bullet-row"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <ChevronRight size={13} strokeWidth={2} className={`metric-bullet-chevron ${expanded ? "open" : ""}`} />
        <span className="metric-bullet-label">{metric.label}</span>
        <span className="metric-bullet-value" style={{ color: HEALTH_COLOR[health] }}>
          {formatValue(metric.actual, metric.unit)}
        </span>
      </button>
      {expanded && (
        <div className="metric-bullet-detail">
          <KpiGauge kpi={{ ...metric, name: metric.label }} canEdit={canEdit} onChange={onChange} />
        </div>
      )}
    </div>
  );
}
