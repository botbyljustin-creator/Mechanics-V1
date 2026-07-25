"use client";

import { useEffect, useState } from "react";
import { Panel } from "./Panel";
import { Sparkline } from "./Sparkline";
import { formatValue, healthOf, HEALTH_COLOR, trendDirection } from "@/lib/kpi";

const TONE_COLOR = { good: "var(--good)", bad: "var(--bad)", muted: "var(--muted)" };

function TrendGauge({ item, onSelect }) {
  const { kpi, history, departmentName, departmentKey } = item;
  const health = healthOf(kpi);
  const color = HEALTH_COLOR[health];
  const max = Math.max(kpi.target, kpi.actual) * 1.15 || 1;
  const fillPct = Math.min((kpi.actual / max) * 100, 100);
  const targetPct = Math.min((kpi.target / max) * 100, 100);
  const trend = trendDirection(
    history.map((h) => h.actual),
    kpi.higherBetter
  );

  return (
    <button className="gauge trend-gauge" onClick={() => onSelect(departmentKey)}>
      <div className="gauge-head">
        <div>
          <div className="gauge-name">{kpi.name}</div>
          <div className="gauge-dept">{departmentName.toUpperCase()}</div>
        </div>
      </div>
      <div className="gauge-track">
        <div className="gauge-fill" style={{ width: `${fillPct}%`, background: color }} />
        <div className="gauge-target" style={{ left: `${targetPct}%` }} />
      </div>
      <div className="gauge-values">
        <span style={{ color }}>{formatValue(kpi.actual, kpi.unit)}</span>
        <span className="gauge-target-label">target {formatValue(kpi.target, kpi.unit)}</span>
      </div>
      <div className="sparkline-wrap">
        <Sparkline history={history} color={color} />
        {trend && (
          <div className="trend-label">
            <b style={{ color: TONE_COLOR[trend.tone] }}>
              {trend.arrow} {trend.word}
            </b>
          </div>
        )}
      </div>
    </button>
  );
}

export function TrendPanel({ onSelectDepartment }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/dashboard/trends")
      .then((res) => {
        if (!res.ok) throw new Error("failed");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load KPI trends.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Panel>
      <div className="panel-title">
        <span>KPI TRENDS</span>
        <span className="panel-title-badge">one per department</span>
      </div>
      {error && <div className="error-banner">{error}</div>}
      {!items && !error && <div className="loading">LOADING TRENDS…</div>}
      {items && items.length === 0 && <div className="sop-empty">No KPIs tracked yet.</div>}
      {items && items.length > 0 && (
        <div className="gauge-grid">
          {items.map((item) => (
            <TrendGauge key={item.departmentKey} item={item} onSelect={onSelectDepartment} />
          ))}
        </div>
      )}
    </Panel>
  );
}
