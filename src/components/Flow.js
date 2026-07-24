"use client";

import { Panel } from "./Panel";
import { FLOW_CHAIN } from "@/lib/kpi";

export function Flow() {
  return (
    <Panel className="flow-panel">
      <div className="panel-title">CAUSE &amp; EFFECT — HOW ONE SYSTEM MOVES THE NEXT</div>
      <div className="flow-row">
        {FLOW_CHAIN.map((step, i) => (
          <div className="flow-step" key={step}>
            <div className="flow-node">{step}</div>
            {i < FLOW_CHAIN.length - 1 && (
              <svg className="flow-connector" viewBox="0 0 60 10" preserveAspectRatio="none">
                <line x1="0" y1="5" x2="60" y2="5" className="flow-line" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </Panel>
  );
}
