import { NextResponse } from "next/server";

export async function GET() {
  const res = NextResponse.redirect(new URL("/", "http://localhost:3000"));

  res.cookies.set("role", "", {
    path: "/",
    maxAge: 0, // borrar
  });

  return res;
}
