import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL("/inmuebles", req.url);
  const res = NextResponse.redirect(url);

  // Limpiar cookies básicas de auth
  res.cookies.set("role", "", { path: "/", httpOnly: true, maxAge: 0 });
  res.cookies.set("uid", "", { path: "/", httpOnly: true, maxAge: 0 });
  res.cookies.set("name", "", { path: "/", httpOnly: false, maxAge: 0 });

  return res;
}
