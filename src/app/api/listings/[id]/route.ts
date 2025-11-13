import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Listing from "@/models/Listing";
import { isAdminFromRequest } from "@/lib/auth";

type Params = { params: { id: string } };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const item = await Listing.findById(params.id).lean();
    if (!item) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, item });
  } catch (err: any) {
    console.error("GET /api/listings/[id] error:", err);
    return NextResponse.json(
      { error: err?.message || "Error interno" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  if (!isAdminFromRequest(req)) {
    return NextResponse.json({ error: "Solo admin" }, { status: 401 });
  }

  try {
    await dbConnect();
    const body = await req.json();
    const {
      title,
      location,
      price,
      currency,
      rooms,
      propertyType,
      operationType,
      images,
      description,
      agency,
    } = body;

    const update: any = {
      title,
      location,
      price,
      currency,
      rooms,
      propertyType,
      operationType,
      description,
      agency,
    };

    if (images) {
      update.images = Array.isArray(images)
        ? images
        : String(images)
            .split(",")
            .map((x: string) => x.trim())
            .filter(Boolean);
    }

    const item = await Listing.findByIdAndUpdate(params.id, update, {
      new: true,
    }).lean();

    if (!item) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, item });
  } catch (err: any) {
    console.error("PUT /api/listings/[id] error:", err);
    return NextResponse.json(
      { error: err?.message || "Error interno" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!isAdminFromRequest(req)) {
    return NextResponse.json({ error: "Solo admin" }, { status: 401 });
  }

  try {
    await dbConnect();
    const deleted = await Listing.findByIdAndDelete(params.id).lean();
    if (!deleted) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("DELETE /api/listings/[id] error:", err);
    return NextResponse.json(
      { error: err?.message || "Error interno" },
      { status: 500 }
    );
  }
}






