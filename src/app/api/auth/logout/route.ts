import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(_req: NextRequest) {
  const res = NextResponse.json({ ok: true });

  res.cookies.set("role", "", { path: "/", maxAge: 0 });
  res.cookies.set("uid", "", { path: "/", maxAge: 0 });
  res.cookies.set("name", "", { path: "/", maxAge: 0 });
  res.cookies.set("session", "", { path: "/", maxAge: 0 }); // por si quedó algo viejo

  return res;
}

