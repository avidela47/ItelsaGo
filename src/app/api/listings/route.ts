import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Listing, { IListing } from "@/models/Listing";
import { dbConnect } from "@/lib/mongo"; // tu helper de conexión

// orden por plan (premium > sponsor > free)
const PLAN_ORDER: Record<string, number> = { premium: 0, sponsor: 1, free: 2 };

function parseIntOr(def: number, v?: string | null) {
  const n = Number(v ?? "");
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : def;
}

export async function GET(req: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const page = parseIntOr(1, searchParams.get("page"));
  const pageSize = Math.min(50, parseIntOr(12, searchParams.get("pageSize")));
  const q = (searchParams.get("q") || "").trim();
  const sort = (searchParams.get("sort") || "recent") as
    | "recent"
    | "priceAsc"
    | "priceDesc"
    | "plan";

  const where: any = {};
  if (q) {
    where.$or = [
      { title: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } },
    ];
  }

  let sortSpec: any = {};
  if (sort === "recent") sortSpec = { createdAt: -1 };
  if (sort === "priceAsc") sortSpec = { price: 1 };
  if (sort === "priceDesc") sortSpec = { price: -1 };
  // plan: hacemos sort por plan y luego recientes
  if (sort === "plan") sortSpec = { "agency.plan": 1, createdAt: -1 };

  const total = await Listing.countDocuments(where);

  // Si el orden es por plan, vamos a traer y ordenar en memoria con nuestro orden
  if (sort === "plan") {
    const all = await Listing.find(where).sort({ createdAt: -1 }).lean();
    const ordered = all.sort((a: any, b: any) => {
      const pa = PLAN_ORDER[a?.agency?.plan || "free"] ?? 9;
      const pb = PLAN_ORDER[b?.agency?.plan || "free"] ?? 9;
      if (pa !== pb) return pa - pb;
      // tie-breaker por fecha
      return (b.createdAt as any) - (a.createdAt as any);
    });
    const start = (page - 1) * pageSize;
    const items = ordered.slice(start, start + pageSize);
    return NextResponse.json({ ok: true, page, pageSize, total, items });
  }

  const items = await Listing.find(where)
    .sort(sortSpec)
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean();

  return NextResponse.json({ ok: true, page, pageSize, total, items });
}

export async function POST(req: NextRequest) {
  await dbConnect();

  const body = (await req.json()) as Partial<IListing> & {
    idempotencyKey?: string;
  };

  // idempotencia
  if (body.idempotencyKey) {
    const exists = await Listing.findOne({
      idempotencyKey: body.idempotencyKey,
    }).lean();
    if (exists)
      return NextResponse.json(
        { ok: true, dedup: true, id: (exists as any)._id?.toString() },
        { status: 200 }
      );
  }

  const doc = await Listing.create({
    title: body.title,
    location: body.location,
    price: body.price,
    currency: body.currency,
    rooms: body.rooms ?? 0,
    propertyType: body.propertyType,
    operationType: body.operationType,
    images: Array.isArray(body.images) ? body.images : [],
    description: body.description ?? "",
    agency: body.agency ?? { plan: "free" },
    idempotencyKey: body.idempotencyKey,
  } as IListing);

  return NextResponse.json(
    { ok: true, id: (doc as any)._id?.toString() },
    { status: 201 }
  );
}

