import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Agency from "@/models/Agency";
import { comparePassword, signToken, setTokenCookie } from "@/lib/auth";

export async function POST(request: Request) {
  await dbConnect();
  const body = await request.json();
  const { email, password } = body || {};
  if (!email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const agency = await Agency.findOne({ email: email.toLowerCase().trim() });
  if (!agency || !agency.passwordHash) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const ok = await comparePassword(password, agency.passwordHash);
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const token = signToken({ id: String(agency._id), role: agency.role });
  const res = NextResponse.json({ id: String(agency._id), name: agency.name, email: agency.email });
  setTokenCookie(res, token);
  return res;
}
