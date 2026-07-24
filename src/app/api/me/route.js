import { NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json({
    id: session.userId,
    email: session.email,
    name: session.name,
    role: session.role,
    departmentKey: session.departmentKey,
  });
}
