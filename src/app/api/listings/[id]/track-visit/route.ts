import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Visit from "@/models/Visit";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const listingId = params.id;
    if (!listingId) {
      return NextResponse.json({ error: "listingId requerido" }, { status: 400 });
    }
    let userId: string | null = null;
    try {
      userId = req.cookies.get("uid")?.value || null;
    } catch {}
    const referrer = req.headers.get("referer") || null;
    await Visit.create({ listing: listingId, user: userId, referrer });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al registrar visita" }, { status: 500 });
  }
}
