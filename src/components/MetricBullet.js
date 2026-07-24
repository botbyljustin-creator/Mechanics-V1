"use client";

import { useState } from "react";
import { ChevronRight, Pencil, Check, X } from "lucide-react";
import { formatValue, healthOf, HEALTH_COLOR, STATUS_LEVELS, STATUS_LABEL, statusHealth } from "@/lib/kpi";

export function MetricBullet({ metric, canEdit, onChange }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draftType, setDraftType] = useState(metric.type);
  const [draftActual, setDraftActual] = useState(metric.actual);
  const [draftTarget, setDraftTarget] = useState(metric.target);
  const [draftStatus, setDraftStatus] = useState(metric.status);
  const [draftNote, setDraftNote] = useState(metric.note);

  const collapsedHealth = metric.type === "GAUGE" ? healthOf(metric) : statusHealth(metric.status);

  function startEdit() {
    setDraftType(metric.type);
    setDraftActual(metric.actual);
    setDraftTarget(metric.target);
    setDraftStatus(metric.status);
    setDraftNote(metric.note);
    setEditing(true);
    setExpanded(true);
  }

  function cancelEdit() {
    setEditing(false);
  }

  async function save() {
    setSaving(true);
    try {
      const payload =
        draftType === "GAUGE"
          ? { type: "GAUGE", actual: Number(draftActual) || 0, target: Number(draftTarget) || 0 }
          : { type: "STATUS", status: draftStatus, note: draftNote.trim() };
      await onChange(payload);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="metric-bullet">
      <button className="metric-bullet-row" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
        <ChevronRight size={13} strokeWidth={2} className={`metric-bullet-chevron ${expanded ? "open" : ""}`} />
        <span className="metric-bullet-label">{metric.label}</span>
        {metric.type === "GAUGE" ? (
          <span className="metric-bullet-value" style={{ color: HEALTH_COLOR[collapsedHealth] }}>
            {formatValue(metric.actual, metric.unit)}
          </span>
        ) : (
          <span className="metric-bullet-status" style={{ color: HEALTH_COLOR[collapsedHealth] }}>
            <span className="metric-status-dot" style={{ background: HEALTH_COLOR[collapsedHealth] }} />
            {STATUS_LABEL[metric.status]}
          </span>
        )}
      </button>

      {expanded && (
        <div className="metric-bullet-detail">
          {!editing ? (
            <>
              {metric.type === "GAUGE" ? (
                <div className="gauge">
                  <div className="gauge-track">
                    <div
                      className="gauge-fill"
                      style={{
                        width: `${Math.min((metric.actual / (Math.max(metric.target, metric.actual) * 1.15 || 1)) * 100, 100)}%`,
                        background: HEALTH_COLOR[collapsedHealth],
                      }}
                    />
                    <div
                      className="gauge-target"
                      style={{
                        left: `${Math.min((metric.target / (Math.max(metric.target, metric.actual) * 1.15 || 1)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="gauge-values">
                    <span style={{ color: HEALTH_COLOR[collapsedHealth] }}>{formatValue(metric.actual, metric.unit)}</span>
                    <span className="gauge-target-label">target {formatValue(metric.target, metric.unit)}</span>
                  </div>
                </div>
              ) : (
                <div className="status-view">
                  <span className="status-badge" style={{ color: HEALTH_COLOR[collapsedHealth], borderColor: HEALTH_COLOR[collapsedHealth] }}>
                    {STATUS_LABEL[metric.status]}
                  </span>
                  {metric.note ? <p className="status-note">{metric.note}</p> : <p className="status-note muted">No notes yet.</p>}
                </div>
              )}
              {canEdit && (
                <button className="icon-btn metric-edit-trigger" onClick={startEdit} aria-label={`Edit ${metric.label}`}>
                  <Pencil size={13} strokeWidth={1.75} />
                </button>
              )}
            </>
          ) : (
            <div className="metric-edit-form">
              <div className="metric-type-toggle">
                <button className={draftType === "GAUGE" ? "active" : ""} onClick={() => setDraftType("GAUGE")} type="button">
                  Number
                </button>
                <button className={draftType === "STATUS" ? "active" : ""} onClick={() => setDraftType("STATUS")} type="button">
                  Status
                </button>
              </div>

              {draftType === "GAUGE" ? (
                <div className="gauge-inputs">
                  <label>
                    actual
                    <input type="number" value={draftActual} onChange={(e) => setDraftActual(e.target.value)} />
                  </label>
                  <label>
                    target
                    <input type="number" value={draftTarget} onChange={(e) => setDraftTarget(e.target.value)} />
                  </label>
                </div>
              ) : (
                <div className="status-inputs">
                  <div className="status-pills">
                    {STATUS_LEVELS.map((level) => {
                      const active = draftStatus === level;
                      const color = HEALTH_COLOR[statusHealth(level)];
                      return (
                        <button
                          key={level}
                          type="button"
                          className={`status-pill ${active ? "active" : ""}`}
                          style={{
                            borderColor: color,
                            color: active ? "var(--bg)" : color,
                            background: active ? color : "transparent",
                          }}
                          onClick={() => setDraftStatus(level)}
                        >
                          {STATUS_LABEL[level]}
                        </button>
                      );
                    })}
                  </div>
                  <textarea
                    className="status-note-input"
                    value={draftNote}
                    onChange={(e) => setDraftNote(e.target.value)}
                    placeholder="What's the update?"
                    rows={2}
                  />
                </div>
              )}

              <div className="gauge-edit-actions">
                <button className="icon-btn" onClick={save} disabled={saving} aria-label="Save">
                  <Check size={14} />
                </button>
                <button className="icon-btn" onClick={cancelEdit} disabled={saving} aria-label="Cancel">
                  <X size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
