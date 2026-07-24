import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/getSession";
import { canEditDepartment } from "@/lib/permissions";

export async function POST(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { key } = await params;
  if (!canEditDepartment(session, key)) {
    return NextResponse.json({ error: "You don't have permission to edit this department" }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const title = String(body.title || "").trim();
  const text = String(body.body || "").trim();
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const department = await prisma.department.findUnique({ where: { key } });
  if (!department) {
    return NextResponse.json({ error: "Department not found" }, { status: 404 });
  }

  const sop = await prisma.sop.create({
    data: {
      title,
      body: text,
      departmentId: department.id,
      updatedBy: session.email,
    },
  });

  return NextResponse.json(
    { id: sop.id, title: sop.title, body: sop.body, updatedAt: sop.updatedAt },
    { status: 201 }
  );
}
