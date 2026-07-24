import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "./auth";

// For use inside App Router route handlers / server components.
export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}
