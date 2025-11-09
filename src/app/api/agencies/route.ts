import { NextResponse } from "next/server";
import { dbConnect } from "../../../lib/mongo";
import Agency from "../../../models/Agency";

export async function GET() {
  try {
    await dbConnect();
    const docs = await Agency.find().sort({ createdAt: -1 }).lean();
    const items = docs.map((a: any) => ({ id: String(a._id), name: a.name, plan: a.plan }));
    return NextResponse.json(items);
  } catch (e: any) {
    console.error("GET /api/agencies error:", e);
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
