import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Agency from "@/models/Agency";
import { hashPassword, signToken, setTokenCookie } from "@/lib/auth";

export async function POST(request: Request) {
  await dbConnect();
  const body = await request.json();
  const { name, email, password, phone, contactEmail } = body || {};

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const existing = await Agency.findOne({ email: email.toLowerCase().trim() });
  if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 });

  const passwordHash = await hashPassword(password);
  const agency = new Agency({ name: name.trim(), email: email.toLowerCase().trim(), passwordHash, phone: phone || "", contactEmail: contactEmail || "" });
  await agency.save();

  const token = signToken({ id: String(agency._id), role: agency.role });
  const res = NextResponse.json({ id: String(agency._id), name: agency.name, email: agency.email });
  setTokenCookie(res, token);
  return res;
}
