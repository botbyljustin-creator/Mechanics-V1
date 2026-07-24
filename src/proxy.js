import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

const PUBLIC_PATHS = ["/login"];

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  const isApiAuth = pathname.startsWith("/api/auth/login") || pathname.startsWith("/api/auth/logout");
  const isPublicPage = PUBLIC_PATHS.includes(pathname);

  if (isApiAuth || isPublicPage) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Run on everything except:
     * - _next/static, _next/image (Next internals)
     * - favicon.ico and other static files
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
