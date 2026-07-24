import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/getSession";
import { canEditDepartment } from "@/lib/permissions";

async function ensureAccessible(session, key, sopId) {
  if (!canEditDepartment(session, key)) {
    return { error: NextResponse.json({ error: "You don't have permission to edit this department" }, { status: 403 }) };
  }
  const sop = await prisma.sop.findUnique({ where: { id: sopId }, include: { department: true } });
  if (!sop || sop.department.key !== key) {
    return { error: NextResponse.json({ error: "SOP not found" }, { status: 404 }) };
  }
  return { sop };
}

export async function PATCH(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { key, sopId } = await params;
  const { error } = await ensureAccessible(session, key, sopId);
  if (error) return error;

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

  const updated = await prisma.sop.update({
    where: { id: sopId },
    data: { title, body: text, updatedBy: session.email },
  });

  return NextResponse.json({ id: updated.id, title: updated.title, body: updated.body, updatedAt: updated.updatedAt });
}

export async function DELETE(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { key, sopId } = await params;
  const { error } = await ensureAccessible(session, key, sopId);
  if (error) return error;

  await prisma.sop.delete({ where: { id: sopId } });
  return NextResponse.json({ ok: true });
}
