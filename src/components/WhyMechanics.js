"use client";

import { Panel } from "./Panel";

const EXISTS_TO = ["Identify bottlenecks", "Improve workflows", "Create visibility", "Reduce friction", "Increase scalability", "Build consistency"];

const WITHOUT = ["Problems repeat", "Information gets lost", "Teams operate differently", "Leadership lacks visibility", "Growth creates chaos"];

const WITH = ["Work becomes repeatable", "Bottlenecks become visible", "Teams stay aligned", "Decisions improve", "Scaling becomes possible"];

export function WhyMechanics() {
  return (
    <>
      <Panel className="why-panel">
        <div className="panel-title">WHY MECHANICS MATTERS</div>
        <p className="why-thesis">
          Mechanics is the initiative to map, improve, and connect every system inside the business — so the company
          runs smoother, faster, and more predictably, instead of operating reactively.
        </p>
        <div className="why-exists-title">Mechanics exists to</div>
        <ul className="why-exists-list">
          {EXISTS_TO.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Panel>

      <Panel className="why-panel">
        <div className="panel-title">WITHOUT SYSTEMS / WITH SYSTEMS</div>
        <div className="why-compare-grid">
          <div>
            <div className="why-compare-title" style={{ color: "var(--bad)", borderColor: "var(--bad)" }}>
              Without Systems
            </div>
            {WITHOUT.map((item) => (
              <div className="why-compare-item" key={item}>
                <span className="why-compare-mark" style={{ color: "var(--bad)" }}>
                  ✕
                </span>
                {item}
              </div>
            ))}
          </div>
          <div>
            <div className="why-compare-title" style={{ color: "var(--good)", borderColor: "var(--good)" }}>
              With Systems
            </div>
            {WITH.map((item) => (
              <div className="why-compare-item" key={item}>
                <span className="why-compare-mark" style={{ color: "var(--good)" }}>
                  ✓
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </>
  );
}
