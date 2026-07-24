import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/getSession";

// Everyone authenticated can view history — same read-only rule as the
// rest of the dashboard.
export async function GET(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { key, metricId } = await params;
  const metric = await prisma.metricItem.findUnique({ where: { id: metricId }, include: { department: true } });
  if (!metric || metric.department.key !== key) {
    return NextResponse.json({ error: "Metric not found" }, { status: 404 });
  }

  const history = await prisma.metricItemHistory.findMany({
    where: { metricItemId: metricId },
    orderBy: { changedAt: "desc" },
  });

  return NextResponse.json(
    history.map((h) => ({
      id: h.id,
      type: h.type,
      target: h.target,
      actual: h.actual,
      status: h.status,
      note: h.note,
      changedBy: h.changedBy,
      changedAt: h.changedAt,
    }))
  );
}
