// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Listing from "@/models/Listing";
import { isAdminFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const location = searchParams.get("location");
    const showAll = searchParams.get("showAll"); // Para admin panel

    const query: any = {};
    if (location) query.location = location;
    
    // Si showAll=true (admin), mostrar todas las propiedades
    // Si no, solo mostrar propiedades activas en el listado público
    if (showAll !== "true") {
      query.$or = [
        { status: { $exists: false } },
        { status: "active" }
      ];
    }

    const items = await Listing.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ ok: true, items });
  } catch (err: any) {
    console.error("GET /api/listings error:", err);
    return NextResponse.json(
      { error: err?.message || "Error interno" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminFromRequest(req)) {
    return NextResponse.json({ error: "Solo admin" }, { status: 401 });
  }

  try {
    await dbConnect();
    const body = await req.json();

    const {
      idempotencyKey,
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

    if (!title || !location || !price || !currency || !images) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    // Idempotencia opcional
    if (idempotencyKey) {
      const existing: any = await Listing.findOne({ idempotencyKey }).lean();
      if (existing) {
        return NextResponse.json({
          ok: true,
          dedup: true,
          id: String(existing._id),
        });
      }
    }

    const doc: any = await Listing.create({
      idempotencyKey: idempotencyKey || undefined,
      title,
      location,
      price,
      currency,
      rooms,
      propertyType,
      operationType,
      images: Array.isArray(images)
        ? images
        : String(images)
            .split(",")
            .map((x: string) => x.trim())
            .filter(Boolean),
      description,
      agency,
    });

    return NextResponse.json({ ok: true, id: String(doc._id) });
  } catch (err: any) {
    console.error("POST /api/listings error:", err);
    return NextResponse.json(
      { error: err?.message || "Error interno" },
      { status: 500 }
    );
  }
}

type Params = { params: { id: string } };

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

