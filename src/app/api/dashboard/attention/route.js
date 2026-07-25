import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/getSession";
import { healthOf } from "@/lib/kpi";

const CAP = 8;
const SEVERITY_WEIGHT = { bad: 2, warn: 1 };

// Company-wide "needs attention" list: KPIs and Number-type bullets in
// bad/warn health, plus Status-type bullets flagged Watch/Red Flag.
// Worst-first, capped so it doesn't grow unbounded as more gets flagged.
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const [kpis, metricItems] = await Promise.all([
    prisma.kpi.findMany({ include: { department: true } }),
    prisma.metricItem.findMany({ include: { department: true } }),
  ]);

  const items = [];

  for (const kpi of kpis) {
    const health = healthOf(kpi);
    if (health === "good") continue;
    items.push({
      id: kpi.id,
      kind: "gauge",
      label: kpi.name,
      departmentKey: kpi.department.key,
      departmentName: kpi.department.name,
      severity: health,
      unit: kpi.unit,
      higherBetter: kpi.higherBetter,
      target: kpi.target,
      actual: kpi.actual,
      status: null,
      note: null,
      updatedAt: kpi.updatedAt,
    });
  }

  for (const metric of metricItems) {
    if (metric.type === "GAUGE") {
      const health = healthOf(metric);
      if (health === "good") continue;
      items.push({
        id: metric.id,
        kind: "gauge",
        label: metric.label,
        departmentKey: metric.department.key,
        departmentName: metric.department.name,
        severity: health,
        unit: metric.unit,
        higherBetter: metric.higherBetter,
        target: metric.target,
        actual: metric.actual,
        status: null,
        note: null,
        updatedAt: metric.updatedAt,
      });
    } else {
      if (metric.status === "GOOD") continue;
      items.push({
        id: metric.id,
        kind: "status",
        label: metric.label,
        departmentKey: metric.department.key,
        departmentName: metric.department.name,
        severity: metric.status === "RISK" ? "bad" : "warn",
        unit: null,
        higherBetter: null,
        target: null,
        actual: null,
        status: metric.status,
        note: metric.note,
        updatedAt: metric.updatedAt,
      });
    }
  }

  items.sort((a, b) => {
    const weightDiff = SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity];
    if (weightDiff !== 0) return weightDiff;
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  return NextResponse.json({
    items: items.slice(0, CAP),
    totalCount: items.length,
  });
}
