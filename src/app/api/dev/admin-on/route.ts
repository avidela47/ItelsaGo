import { NextResponse } from "next/server";

export async function GET() {
  const res = NextResponse.redirect(new URL("/panel", "http://localhost:3000"));

  res.cookies.set("role", "admin", {
    path: "/",
    maxAge: 60 * 60 * 24, // 1 día
    httpOnly: false,
    sameSite: "lax",
  });

  return res;
}
