"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, FileText } from "lucide-react";
import { Panel } from "./Panel";
import { formatValue, healthOf, HEALTH_COLOR, STATUS_LABEL, statusHealth } from "@/lib/kpi";

function formatDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function HistoryEntry({ entry }) {
  const health = entry.type === "GAUGE" ? healthOf(entry) : statusHealth(entry.status);
  return (
    <div className="history-entry">
      <div className="history-entry-meta">
        <span className="history-entry-date">{formatDate(entry.changedAt)}</span>
        <span className="history-entry-by">{entry.changedBy || "unknown"}</span>
      </div>
      {entry.type === "GAUGE" ? (
        <div className="history-entry-body">
          <span style={{ color: HEALTH_COLOR[health] }}>{formatValue(entry.actual, entry.unit || "%")}</span>
          <span className="history-entry-target">target {formatValue(entry.target, entry.unit || "%")}</span>
        </div>
      ) : (
        <div className="history-entry-body">
          <span className="status-badge" style={{ color: HEALTH_COLOR[health], borderColor: HEALTH_COLOR[health] }}>
            {STATUS_LABEL[entry.status]}
          </span>
          {entry.note && <p className="history-entry-note">{entry.note}</p>}
        </div>
      )}
    </div>
  );
}

export function MetricDetailPane({ metric, deptKey, deptName, onBack }) {
  const [history, setHistory] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setHistory(null);
    fetch(`/api/departments/${deptKey}/metrics/${metric.id}/history`)
      .then((res) => {
        if (!res.ok) throw new Error("failed");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setHistory(data);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load history for this item.");
      });
    return () => {
      cancelled = true;
    };
  }, [metric.id, deptKey]);

  const health = metric.type === "GAUGE" ? healthOf(metric) : statusHealth(metric.status);

  return (
    <div>
      <button className="back-btn" onClick={onBack}>
        <ArrowLeft size={14} /> Back to {deptName}
      </button>

      <div className="metric-detail-header">
        <div className="eyebrow">METRIC DETAIL</div>
        <h1 className="dept-title">{metric.label}</h1>
        {metric.type === "GAUGE" ? (
          <div className="metric-detail-current">
            <span style={{ color: HEALTH_COLOR[health] }}>{formatValue(metric.actual, metric.unit)}</span>
            <span className="gauge-target-label">target {formatValue(metric.target, metric.unit)}</span>
          </div>
        ) : (
          <div className="metric-detail-current">
            <span className="status-badge" style={{ color: HEALTH_COLOR[health], borderColor: HEALTH_COLOR[health] }}>
              {STATUS_LABEL[metric.status]}
            </span>
          </div>
        )}
      </div>

      <Panel>
        <div className="panel-title">HISTORY</div>
        {error && <div className="error-banner">{error}</div>}
        {!history && !error && <div className="loading">LOADING HISTORY…</div>}
        {history && history.length === 0 && <div className="sop-empty">No changes recorded yet.</div>}
        {history && history.length > 0 && (
          <div className="history-list">
            {history.map((entry) => (
              <HistoryEntry key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </Panel>

      <Panel>
        <div className="panel-title">REPORTS</div>
        <div className="reports-empty">
          <FileText size={16} strokeWidth={1.5} />
          <p>
            Automated weekly report ingestion isn&apos;t wired up yet. Once it is, the specific report each update
            came from will show up here.
          </p>
        </div>
      </Panel>
    </div>
  );
}
