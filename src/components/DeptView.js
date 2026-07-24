"use client";

import { ArrowLeft } from "lucide-react";
import { Panel } from "./Panel";
import { KpiGauge } from "./KpiGauge";
import { SopList } from "./SopList";
import { getDepartmentIcon } from "./icons";

export function DeptView({ dept, index, canEdit, onBack, onKpiChange, onSopAdd, onSopEdit, onSopDelete }) {
  const Icon = getDepartmentIcon(dept.icon);

  return (
    <div>
      <button className="back-btn" onClick={onBack}>
        <ArrowLeft size={14} /> All systems
      </button>

      <div className="dept-header">
        <div className="dept-icon-wrap">
          <Icon size={22} strokeWidth={1.75} />
        </div>
        <div>
          <div className="eyebrow">
            <span>SYSTEM {String(index + 1).padStart(2, "0")}</span>
            {!canEdit && <span className="readonly-badge">READ-ONLY</span>}
          </div>
          <h1 className="dept-title">{dept.name}</h1>
          <p className="dept-purpose">{dept.purpose}</p>
        </div>
      </div>

      <div className="dept-grid">
        <Panel>
          <div className="panel-title">INCLUDES</div>
          <ul className="plain-list">
            {dept.includes.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </Panel>
        <Panel>
          <div className="panel-title">OUTPUTS</div>
          <ul className="plain-list">
            {dept.outputs.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel>
        <div className="panel-title">KPI GAUGES</div>
        <div className="gauge-grid">
          {dept.kpis.map((kpi) => (
            <KpiGauge key={kpi.id} kpi={kpi} canEdit={canEdit} onChange={(updated) => onKpiChange(kpi.id, updated)} />
          ))}
        </div>
      </Panel>

      <Panel>
        <div className="panel-title">STANDARD OPERATING PROCEDURES</div>
        <SopList sops={dept.sops} canEdit={canEdit} onAdd={onSopAdd} onEdit={onSopEdit} onDelete={onSopDelete} />
      </Panel>
    </div>
  );
}
