"use client";

import { useEffect, useState, useCallback } from "react";
import { Hub } from "@/components/Hub";
import { WhyMechanics } from "@/components/WhyMechanics";
import { DeptView } from "@/components/DeptView";
import { MetricDetailPane } from "@/components/MetricDetailPane";
import { AccountMenu } from "@/components/AccountMenu";

function canEditDepartment(user, departmentKey) {
  if (!user) return false;
  if (user.role === "ADMIN" || user.role === "LEADERSHIP") return true;
  return user.role === "DEPT_HEAD" && user.departmentKey === departmentKey;
}

export default function MechanicsOS() {
  const [user, setUser] = useState(null);
  const [departments, setDepartments] = useState(null);
  const [view, setView] = useState("dashboard");
  const [detail, setDetail] = useState(null); // { deptKey, metricId } | null
  const [error, setError] = useState(null);

  function navigateTo(key) {
    setDetail(null);
    setView(key);
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [meRes, deptRes] = await Promise.all([fetch("/api/me"), fetch("/api/departments")]);
        if (!meRes.ok || !deptRes.ok) throw new Error("load failed");
        const me = await meRes.json();
        const depts = await deptRes.json();
        if (!cancelled) {
          setUser(me);
          setDepartments(depts);
        }
      } catch {
        if (!cancelled) setError("Could not load Mechanics OS data. Try refreshing the page.");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleKpiChange = useCallback(async (deptKey, kpiId, updated) => {
    const res = await fetch(`/api/departments/${deptKey}/kpis/${kpiId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    if (!res.ok) {
      setError("Could not save that KPI change.");
      return;
    }
    const saved = await res.json();
    setDepartments((prev) =>
      prev.map((d) => (d.key !== deptKey ? d : { ...d, kpis: d.kpis.map((k) => (k.id === kpiId ? saved : k)) }))
    );
  }, []);

  const handleMetricChange = useCallback(async (deptKey, metricId, updated) => {
    const res = await fetch(`/api/departments/${deptKey}/metrics/${metricId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    if (!res.ok) {
      setError("Could not save that metric change.");
      return;
    }
    const saved = await res.json();
    setDepartments((prev) =>
      prev.map((d) =>
        d.key !== deptKey
          ? d
          : {
              ...d,
              includes: d.includes.map((m) => (m.id === metricId ? saved : m)),
              outputs: d.outputs.map((m) => (m.id === metricId ? saved : m)),
            }
      )
    );
  }, []);

  const handleSopAdd = useCallback(async (deptKey, sop) => {
    const res = await fetch(`/api/departments/${deptKey}/sops`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sop),
    });
    if (!res.ok) {
      setError("Could not add that procedure.");
      return;
    }
    const saved = await res.json();
    setDepartments((prev) => prev.map((d) => (d.key !== deptKey ? d : { ...d, sops: [...d.sops, saved] })));
  }, []);

  const handleSopEdit = useCallback(async (deptKey, sopId, sop) => {
    const res = await fetch(`/api/departments/${deptKey}/sops/${sopId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sop),
    });
    if (!res.ok) {
      setError("Could not save that procedure.");
      return;
    }
    const saved = await res.json();
    setDepartments((prev) =>
      prev.map((d) => (d.key !== deptKey ? d : { ...d, sops: d.sops.map((s) => (s.id === sopId ? saved : s)) }))
    );
  }, []);

  const handleSopDelete = useCallback(async (deptKey, sopId) => {
    const res = await fetch(`/api/departments/${deptKey}/sops/${sopId}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Could not delete that procedure.");
      return;
    }
    setDepartments((prev) => prev.map((d) => (d.key !== deptKey ? d : { ...d, sops: d.sops.filter((s) => s.id !== sopId) })));
  }, []);

  const activeDept = departments && view !== "dashboard" ? departments.find((d) => d.key === view) : null;
  const activeIndex = activeDept ? departments.findIndex((d) => d.key === view) : -1;
  const detailMetric =
    detail && activeDept ? [...activeDept.includes, ...activeDept.outputs].find((m) => m.id === detail.metricId) : null;

  return (
    <div className="app">
      <div className="topbar">
        <div>
          <div className="wordmark">
            MECHANICS<span>_OS</span>
          </div>
          <div className="tagline">ENGINEERING THE BUSINESS</div>
        </div>
        <div className="topbar-right">
          <div className="status-pill">
            <span className="status-dot" /> OPERATIONAL
          </div>
          {user && <AccountMenu user={user} />}
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {!departments || !user ? (
        <div className="loading">LOADING SYSTEMS…</div>
      ) : view === "dashboard" ? (
        <>
          <div className="rail">
            <button className="rail-btn active" onClick={() => navigateTo("dashboard")}>
              DASHBOARD
            </button>
            {departments.map((d) => (
              <button key={d.key} className="rail-btn" onClick={() => navigateTo(d.key)}>
                {d.short.toUpperCase()}
              </button>
            ))}
          </div>
          <Hub departments={departments} onSelect={navigateTo} />
          <WhyMechanics />
        </>
      ) : (
        <>
          <div className="rail">
            <button className="rail-btn" onClick={() => navigateTo("dashboard")}>
              DASHBOARD
            </button>
            {departments.map((d) => (
              <button key={d.key} className={`rail-btn ${view === d.key ? "active" : ""}`} onClick={() => navigateTo(d.key)}>
                {d.short.toUpperCase()}
              </button>
            ))}
          </div>
          {detail && detailMetric ? (
            <MetricDetailPane
              metric={detailMetric}
              deptKey={activeDept.key}
              deptName={activeDept.name}
              onBack={() => setDetail(null)}
            />
          ) : (
            <DeptView
              dept={activeDept}
              index={activeIndex}
              canEdit={canEditDepartment(user, activeDept.key)}
              onBack={() => navigateTo("dashboard")}
              onKpiChange={(kpiId, updated) => handleKpiChange(activeDept.key, kpiId, updated)}
              onMetricChange={(metricId, updated) => handleMetricChange(activeDept.key, metricId, updated)}
              onOpenMetricDetail={(metric) => setDetail({ deptKey: activeDept.key, metricId: metric.id })}
              onSopAdd={(sop) => handleSopAdd(activeDept.key, sop)}
              onSopEdit={(sopId, sop) => handleSopEdit(activeDept.key, sopId, sop)}
              onSopDelete={(sopId) => handleSopDelete(activeDept.key, sopId)}
            />
          )}
        </>
      )}
    </div>
  );
}
