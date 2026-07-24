import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/getSession";

function serializeMetric(m) {
  return {
    id: m.id,
    key: m.key,
    label: m.label,
    type: m.type,
    unit: m.unit,
    higherBetter: m.higherBetter,
    target: m.target,
    actual: m.actual,
    status: m.status,
    note: m.note,
    updatedAt: m.updatedAt,
  };
}

function serializeDepartment(dept) {
  return {
    key: dept.key,
    name: dept.name,
    short: dept.short,
    icon: dept.icon,
    purpose: dept.purpose,
    order: dept.order,
    includes: dept.metricItems.filter((m) => m.section === "INCLUDE").map(serializeMetric),
    outputs: dept.metricItems.filter((m) => m.section === "OUTPUT").map(serializeMetric),
    kpis: dept.kpis.map((k) => ({
      id: k.id,
      key: k.key,
      name: k.name,
      unit: k.unit,
      higherBetter: k.higherBetter,
      target: k.target,
      actual: k.actual,
      updatedAt: k.updatedAt,
    })),
    sops: dept.sops.map((s) => ({
      id: s.id,
      title: s.title,
      body: s.body,
      updatedAt: s.updatedAt,
    })),
  };
}

// Every authenticated account can view all departments read-only.
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const departments = await prisma.department.findMany({
    orderBy: { order: "asc" },
    include: {
      kpis: { orderBy: { createdAt: "asc" } },
      sops: { orderBy: { createdAt: "asc" } },
      metricItems: { orderBy: { order: "asc" } },
    },
  });

  return NextResponse.json(departments.map(serializeDepartment));
}
