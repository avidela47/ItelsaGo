import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Listing from "@/models/Listing";

const TYPES = ["depto", "casa", "lote", "local"] as const;
const OPS = ["venta", "alquiler", "temporario"] as const;

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const doc = await Listing.findById(params.id).lean();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ id: String(doc._id), ...doc });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const body = await req.json();

  const images: string[] = Array.isArray(body.images)
    ? body.images
    : typeof body.images === "string"
    ? body.images.split(/[\n,]+/).map((s: string) => s.trim()).filter(Boolean)
    : [];

  const update: any = {
    title: String(body.title ?? "").trim(),
    description: String(body.description ?? ""),
    price: Number(body.price ?? 0),
    currency: String(body.currency ?? "USD").toUpperCase(),
    location: String(body.location ?? "").trim(),
    rooms: Number(body.rooms ?? 0),
    propertyType: String(body.propertyType ?? ""),
    operationType: String(body.operationType ?? ""),
    images,
  };

  if (!update.title) return NextResponse.json({ error: "Falta título" }, { status: 400 });
  if (!update.location) return NextResponse.json({ error: "Falta ubicación" }, { status: 400 });
  if (!TYPES.includes(update.propertyType)) return NextResponse.json({ error: "propertyType inválido" }, { status: 400 });
  if (!OPS.includes(update.operationType)) return NextResponse.json({ error: "operationType inválido" }, { status: 400 });

  const doc = await Listing.findByIdAndUpdate(params.id, update, { new: true }).lean();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true, id: String(doc._id) });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  await Listing.findByIdAndDelete(params.id);
  return NextResponse.json({ ok: true });
}
