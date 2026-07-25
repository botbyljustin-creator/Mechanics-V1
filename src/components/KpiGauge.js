"use client";

import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { Sparkline } from "./Sparkline";
import { formatValue, healthOf, HEALTH_COLOR, trendDirection } from "@/lib/kpi";

const TONE_COLOR = { good: "var(--good)", bad: "var(--bad)", muted: "var(--muted)" };

export function KpiGauge({ kpi, canEdit, onChange }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draftActual, setDraftActual] = useState(kpi.actual);
  const [draftTarget, setDraftTarget] = useState(kpi.target);

  const health = healthOf(kpi);
  const max = Math.max(kpi.target, kpi.actual) * 1.15 || 1;
  const fillPct = Math.min((kpi.actual / max) * 100, 100);
  const targetPct = Math.min((kpi.target / max) * 100, 100);
  const history = kpi.history || [];
  const trend = trendDirection(
    history.map((h) => h.actual),
    kpi.higherBetter
  );

  async function save() {
    setSaving(true);
    try {
      await onChange({ actual: Number(draftActual) || 0, target: Number(draftTarget) || 0 });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="gauge">
      <div className="gauge-head">
        <span className="gauge-name">{kpi.name}</span>
        {canEdit &&
          (!editing ? (
            <button className="icon-btn" onClick={() => setEditing(true)} aria-label={`Edit ${kpi.name}`}>
              <Pencil size={13} strokeWidth={1.75} />
            </button>
          ) : (
            <div className="gauge-edit-actions">
              <button className="icon-btn" onClick={save} disabled={saving} aria-label="Save">
                <Check size={14} />
              </button>
              <button
                className="icon-btn"
                disabled={saving}
                onClick={() => {
                  setEditing(false);
                  setDraftActual(kpi.actual);
                  setDraftTarget(kpi.target);
                }}
                aria-label="Cancel"
              >
                <X size={14} />
              </button>
            </div>
          ))}
      </div>

      {!editing ? (
        <>
          <div className="gauge-track">
            <div className="gauge-fill" style={{ width: `${fillPct}%`, background: HEALTH_COLOR[health] }} />
            <div className="gauge-target" style={{ left: `${targetPct}%` }} />
          </div>
          <div className="gauge-values">
            <span style={{ color: HEALTH_COLOR[health] }}>{formatValue(kpi.actual, kpi.unit)}</span>
            <span className="gauge-target-label">target {formatValue(kpi.target, kpi.unit)}</span>
          </div>
          <div className="sparkline-wrap">
            <Sparkline history={history} color={HEALTH_COLOR[health]} />
            {trend && (
              <div className="trend-label">
                <b style={{ color: TONE_COLOR[trend.tone] }}>
                  {trend.arrow} {trend.word}
                </b>
              </div>
            )}
          </div>
        </>
      ) : (
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
      )}
    </div>
  );
}
