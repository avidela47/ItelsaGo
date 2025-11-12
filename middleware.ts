import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "./src/lib/auth";

export const config = {
  matcher: [
    "/panel/:path*",
    "/publicar",
    // Agregá otras rutas privadas si querés
  ],
};

export default function middleware(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const session = verifySession(token);
  const isAdmin = !!session && session.role === "admin";

  if (!isAdmin) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}


