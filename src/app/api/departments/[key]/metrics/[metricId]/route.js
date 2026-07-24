import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/getSession";
import { canEditDepartment } from "@/lib/permissions";

const STATUS_LEVELS = ["GOOD", "WATCH", "RISK"];

export async function PATCH(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { key, metricId } = await params;
  if (!canEditDepartment(session, key)) {
    return NextResponse.json({ error: "You don't have permission to edit this department" }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const type = body.type === "STATUS" ? "STATUS" : "GAUGE";

  const metric = await prisma.metricItem.findUnique({ where: { id: metricId }, include: { department: true } });
  if (!metric || metric.department.key !== key) {
    return NextResponse.json({ error: "Metric not found" }, { status: 404 });
  }

  let data;
  let historyData;

  if (type === "GAUGE") {
    const target = Number(body.target);
    const actual = Number(body.actual);
    if (!Number.isFinite(target) || !Number.isFinite(actual)) {
      return NextResponse.json({ error: "target and actual must be numbers" }, { status: 400 });
    }
    data = { type, target, actual };
    historyData = { type, target, actual };
  } else {
    const status = STATUS_LEVELS.includes(body.status) ? body.status : "GOOD";
    const note = String(body.note || "").trim();
    data = { type, status, note };
    historyData = { type, status, note };
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedMetric = await tx.metricItem.update({
      where: { id: metricId },
      data,
    });
    await tx.metricItemHistory.create({
      data: {
        metricItemId: metricId,
        ...historyData,
        changedBy: session.email,
      },
    });
    return updatedMetric;
  });

  return NextResponse.json({
    id: updated.id,
    key: updated.key,
    label: updated.label,
    type: updated.type,
    unit: updated.unit,
    higherBetter: updated.higherBetter,
    target: updated.target,
    actual: updated.actual,
    status: updated.status,
    note: updated.note,
    updatedAt: updated.updatedAt,
  });
}
