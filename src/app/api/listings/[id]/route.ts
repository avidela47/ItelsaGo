import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongo";
import Listing from "@/models/Listing";
import { isAdminFromRequest } from "@/lib/auth";

type Ctx = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    await dbConnect();
    const item = await Listing.findById(params.id).lean();
    if (!item) return NextResponse.json({ ok: false, error: "No encontrado" }, { status: 404 });
    return NextResponse.json({ ok: true, item });
  } catch (err: any) {
    console.error("GET /api/listings/[id] error:", err);
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    if (!isAdminFromRequest(req)) {
      return NextResponse.json({ error: "Solo admin" }, { status: 401 });
    }
    await dbConnect();
    const body = await req.json();
    const agency = body.agency || {};

    const update = {
      title: body.title,
      location: body.location,
      price: Number(body.price),
      currency: body.currency,
      rooms: Number(body.rooms ?? 0),
      propertyType: body.propertyType,
      operationType: body.operationType,
      images: Array.isArray(body.images) ? body.images : [],
      description: body.description || "",
      agency: {
        logo: agency.logo || "",
        plan: agency.plan || "free",
        whatsapp: agency.whatsapp || "", // ✅ NUEVO
      },
    };

    const item = await Listing.findByIdAndUpdate(params.id, update, { new: true });
    if (!item) return NextResponse.json({ ok: false, error: "No encontrado" }, { status: 404 });

    return NextResponse.json({ ok: true, item });
  } catch (err: any) {
    console.error("PUT /api/listings/[id] error:", err);
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    if (!isAdminFromRequest(req)) {
      return NextResponse.json({ error: "Solo admin" }, { status: 401 });
    }
    await dbConnect();
    const out = await Listing.findByIdAndDelete(params.id);
    if (!out) return NextResponse.json({ ok: false, error: "No encontrado" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("DELETE /api/listings/[id] error:", err);
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}





