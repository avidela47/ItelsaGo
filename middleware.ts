import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_PATHS = [
  "/panel",
  "/publicar",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const role = req.cookies.get("role")?.value || "guest";

  // Protegemos también /inmuebles/[id]/editar
  const isEditInmueble =
    pathname.startsWith("/inmuebles/") && pathname.endsWith("/editar");

  const needsAdmin =
    ADMIN_PATHS.some((p) => pathname.startsWith(p)) || isEditInmueble;

  if (needsAdmin && role !== "admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", pathname);
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
