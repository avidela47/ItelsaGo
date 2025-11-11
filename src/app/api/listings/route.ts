import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongo";
import Listing from "@/models/Listing";
import { isAdminFromRequest } from "@/lib/auth";

export async function GET(_req: NextRequest) {
  try {
    await dbConnect();
    const items = await Listing.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ ok: true, items });
  } catch (err: any) {
    console.error("GET /api/listings error:", err);
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isAdminFromRequest(req)) {
      return NextResponse.json({ error: "Solo admin" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();

    const images: string[] = Array.isArray(body.images)
      ? body.images
      : typeof body.images === "string"
      ? body.images.split(",").map((x: string) => x.trim())
      : [];

    const agency = body.agency || {};

    const doc = await Listing.create({
      title: body.title,
      location: body.location,
      price: Number(body.price),
      currency: body.currency || "ARS",
      rooms: Number(body.rooms ?? 0),
      propertyType: body.propertyType || "depto",
      operationType: body.operationType || "venta",
      images,
      description: body.description || "",
      agency: {
        logo: agency.logo || "",
        plan: agency.plan || "free",
        whatsapp: agency.whatsapp || "", // ✅ NUEVO
      },
    });

    return NextResponse.json({ ok: true, id: String(doc._id) }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/listings error:", err);
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}
