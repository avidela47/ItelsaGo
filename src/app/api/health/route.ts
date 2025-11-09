import { NextResponse } from "next/server";

export async function GET() {
  const hasEnv = !!process.env.MONGODB_URI;
  return NextResponse.json({
    ok: true,
    MONGODB_URI: hasEnv ? "present" : "missing",
  });
}
