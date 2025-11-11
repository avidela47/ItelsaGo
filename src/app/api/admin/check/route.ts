import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdminFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const isAdmin = isAdminFromRequest(req);
  if (!isAdmin) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true });
}
