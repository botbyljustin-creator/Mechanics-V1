import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/getSession";
import { canEditDepartment } from "@/lib/permissions";

export async function PATCH(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { key, kpiId } = await params;
  if (!canEditDepartment(session, key)) {
    return NextResponse.json({ error: "You don't have permission to edit this department" }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const target = Number(body.target);
  const actual = Number(body.actual);
  if (!Number.isFinite(target) || !Number.isFinite(actual)) {
    return NextResponse.json({ error: "target and actual must be numbers" }, { status: 400 });
  }

  const kpi = await prisma.kpi.findUnique({ where: { id: kpiId }, include: { department: true } });
  if (!kpi || kpi.department.key !== key) {
    return NextResponse.json({ error: "KPI not found" }, { status: 404 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedKpi = await tx.kpi.update({
      where: { id: kpiId },
      data: { target, actual },
    });
    await tx.kpiHistory.create({
      data: {
        kpiId,
        target,
        actual,
        changedBy: session.email,
      },
    });
    return updatedKpi;
  });

  return NextResponse.json({
    id: updated.id,
    key: updated.key,
    name: updated.name,
    unit: updated.unit,
    higherBetter: updated.higherBetter,
    target: updated.target,
    actual: updated.actual,
    updatedAt: updated.updatedAt,
  });
}
