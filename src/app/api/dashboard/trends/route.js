import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/getSession";
import { healthOf } from "@/lib/kpi";

const HEALTH_WEIGHT = { bad: 2, warn: 1, good: 0 };
const HISTORY_POINTS = 8;

// One representative KPI per department (the worst-health one, so the
// dashboard highlights what's most worth watching) with its recent
// history for a trend sparkline.
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const departments = await prisma.department.findMany({
    orderBy: { order: "asc" },
    include: {
      kpis: { orderBy: { createdAt: "asc" } },
    },
  });

  const results = [];
  for (const dept of departments) {
    if (dept.kpis.length === 0) continue;

    let worst = dept.kpis[0];
    let worstWeight = HEALTH_WEIGHT[healthOf(worst)];
    for (const kpi of dept.kpis.slice(1)) {
      const weight = HEALTH_WEIGHT[healthOf(kpi)];
      if (weight > worstWeight) {
        worst = kpi;
        worstWeight = weight;
      }
    }

    const historyDesc = await prisma.kpiHistory.findMany({
      where: { kpiId: worst.id },
      orderBy: { changedAt: "desc" },
      take: HISTORY_POINTS,
    });
    const history = historyDesc.reverse().map((h) => ({ actual: h.actual, changedAt: h.changedAt }));

    results.push({
      departmentKey: dept.key,
      departmentName: dept.name,
      kpi: {
        id: worst.id,
        name: worst.name,
        unit: worst.unit,
        higherBetter: worst.higherBetter,
        target: worst.target,
        actual: worst.actual,
      },
      history,
    });
  }

  return NextResponse.json(results);
}
