"use client";

import { useEffect, useState } from "react";
import { Panel } from "./Panel";
import { formatValue, HEALTH_COLOR, STATUS_LABEL } from "@/lib/kpi";

function relativeTime(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

function RollupRow({ item, onSelect }) {
  const color = HEALTH_COLOR[item.severity];
  const badgeText = item.kind === "status" ? STATUS_LABEL[item.status] : item.severity === "bad" ? "BAD" : "WARN";
  const detail =
    item.kind === "status"
      ? item.note || "No notes yet."
      : `${formatValue(item.actual, item.unit)} vs. target ${formatValue(item.target, item.unit)}`;

  return (
    <button className="rollup-row" onClick={() => onSelect(item.departmentKey)}>
      <div className="rollup-stripe" style={{ background: color }} />
      <span className="rollup-badge" style={{ color }}>
        {badgeText}
      </span>
      <div className="rollup-main">
        <div className="rollup-title-row">
          <span className="rollup-label">{item.label}</span>
          <span className="rollup-dept">{item.departmentName.toUpperCase()}</span>
        </div>
        <div className="rollup-detail">{detail}</div>
      </div>
      <span className="rollup-time">{relativeTime(item.updatedAt)}</span>
    </button>
  );
}

export function AttentionRollup({ onSelectDepartment }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/dashboard/attention")
      .then((res) => {
        if (!res.ok) throw new Error("failed");
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load the attention list.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const extra = data ? data.totalCount - data.items.length : 0;

  return (
    <Panel>
      <div className="panel-title">
        <span>NEEDS ATTENTION</span>
        {data && <span className="panel-title-badge">{data.totalCount} across all departments</span>}
      </div>
      {error && <div className="error-banner">{error}</div>}
      {!data && !error && <div className="loading">LOADING…</div>}
      {data && data.items.length === 0 && <div className="sop-empty">Nothing flagged right now.</div>}
      {data && data.items.length > 0 && (
        <div className="rollup-list">
          {data.items.map((item) => (
            <RollupRow key={item.id} item={item} onSelect={onSelectDepartment} />
          ))}
        </div>
      )}
      {extra > 0 && <div className="rollup-more">+{extra} more not shown</div>}
    </Panel>
  );
}
