import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const role = req.cookies.get("role")?.value || "guest";

  const adminOnly =
    pathname.startsWith("/panel") ||
    pathname.startsWith("/publicar") ||
    pathname.startsWith("/inmuebles/") && pathname.endsWith("/editar");

  if (adminOnly && role !== "admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/panel/:path*",
    "/publicar",
    "/inmuebles/:id/editar",
  ],
};


