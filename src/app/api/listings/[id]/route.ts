// @ts-nocheck
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Listing from "@/models/Listing";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

function bad(msg: string, code = 400) {
  return NextResponse.json({ ok: false, error: msg }, { status: code });
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params;
  if (!id || !mongoose.isValidObjectId(id)) return bad("ID inválido");

  const doc = await Listing.findById(id).lean();
  if (!doc) return bad("No encontrado", 404);

  return NextResponse.json({
    ok: true,
    item: {
      id: String(doc._id),
      title: doc.title,
      location: doc.location,
      price: doc.price,
      currency: doc.currency,
      rooms: doc.rooms,
      description: doc.description || "",
      images: Array.isArray(doc.images) ? doc.images : [],
      propertyType: doc.propertyType,
      operationType: doc.operationType,
      agency: doc.agency || null,
      createdAt: doc.createdAt,
    },
  });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params;
  if (!id || !mongoose.isValidObjectId(id)) return bad("ID inválido");

  const body = await req.json().catch(() => ({}));
  const errors: string[] = [];

  const title = (body.title ?? "").trim();
  const location = (body.location ?? "").trim();
  const price = Number(body.price);
  const currency = body.currency ?? "ARS";
  const rooms = Number(body.rooms ?? 0);
  const propertyType = body.propertyType ?? "depto";
  const operationType = body.operationType ?? "venta";
  const images = Array.isArray(body.images) ? body.images.filter((x: any) => typeof x === "string" && x.trim()) : [];
  const description = body.description ?? "";

  const agency =
    body.agency && typeof body.agency === "object"
      ? { logo: body.agency.logo || undefined, plan: body.agency.plan || "free" }
      : undefined;

  if (!title) errors.push("Título requerido");
  if (!location) errors.push("Ubicación requerida");
  if (!price || Number.isNaN(price) || price <= 0) errors.push("Precio inválido");
  if (!images.length) errors.push("Al menos 1 imagen");

  if (errors.length) return NextResponse.json({ ok: false, errors }, { status: 400 });

  const update: any = { title, location, price, currency, rooms, propertyType, operationType, images, description };
  if (agency) update.agency = agency;

  const updated = await Listing.findByIdAndUpdate(id, update, { new: true, runValidators: false }).lean();
  if (!updated) return bad("No encontrado", 404);

  return NextResponse.json({ ok: true, id: String(updated._id) });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params;
  if (!id || !mongoose.isValidObjectId(id)) return bad("ID inválido");

  const res = await Listing.findByIdAndDelete(id);
  if (!res) return bad("No encontrado", 404);

  return NextResponse.json({ ok: true, deleted: String(id) });
}


