// @ts-nocheck
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Listing from "@/models/Listing";

export const dynamic = "force-dynamic";

type Plan = "free" | "sponsor" | "premium";
const TYPES = ["depto", "casa", "lote", "local"] as const;
const OPS = ["venta", "alquiler", "temporario"] as const;

function toNum(v?: string | null) {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
}

// ---------------- GET ----------------
export async function GET(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const propertyType = searchParams.get("propertyType") || "";
  const operationType = searchParams.get("operationType") || "";
  const priceMin = toNum(searchParams.get("priceMin"));
  const priceMax = toNum(searchParams.get("priceMax"));
  const page = Number(searchParams.get("page") || 1) || 1;
  const pageSize = Number(searchParams.get("pageSize") || 9) || 9;

  const where: any = {};
  if (q) {
    where.$or = [
      { title: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ];
  }
  if (propertyType) where.propertyType = propertyType;
  if (operationType) where.operationType = operationType;

  if (priceMin !== undefined || priceMax !== undefined) {
    where.price = {};
    if (priceMin !== undefined) where.price.$gte = priceMin;
    if (priceMax !== undefined) where.price.$lte = priceMax;
  }

  // mínimos razonables
  where["images.0"] = { $exists: true, $ne: "" };

  const total = await Listing.countDocuments(where);
  const docs = await Listing.find(where)
    .sort({ createdAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean();

  return NextResponse.json({
    items: docs.map((x: any) => ({
      id: String(x._id),
      title: x.title,
      location: x.location,
      price: x.price,
      currency: x.currency,
      rooms: x.rooms,
      images: x.images || [],
      propertyType: x.propertyType,
      operationType: x.operationType,
      agency: x.agency || null, // {logo, plan, name}
    })),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / pageSize)),
    pageSize,
  });
}

// ---------------- POST ----------------
// Idempotente + anti-duplicado por “contenido similar”
export async function POST(req: Request) {
  await dbConnect();

  const headerKey = req.headers.get("x-idempotency-key") || "";
  let body: any;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  const idempotencyKey = String(body?.idempotencyKey || headerKey || "").trim();

  if (idempotencyKey) {
    const existingByKey = await Listing.findOne({ idempotencyKey }).lean();
    if (existingByKey) {
      return NextResponse.json(
        { ok: true, id: String(existingByKey._id), dedup: true },
        { status: 200 }
      );
    }
  }

  const images: string[] = Array.isArray(body.images)
    ? body.images
    : typeof body.images === "string"
      ? body.images.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];

  const agencyLogo = String(body?.agency?.logo || body?.agency?.name || "").trim();
  const agencyPlan = (body?.agency?.plan || "free") as Plan;

  const doc = {
    title: String(body.title || "").trim(),
    location: String(body.location || "").trim(),
    price: Number(body.price || 0),
    currency: String(body.currency || "ARS").toUpperCase(),
    rooms: Number(body.rooms || 0),
    description: String(body.description || "").trim(),
    propertyType: String(body.propertyType || "").toLowerCase(),
    operationType: String(body.operationType || "").toLowerCase(),
    images,
    agency: {
      name: "",
      logo: agencyLogo,
      plan: ["free", "sponsor", "premium"].includes(agencyPlan) ? agencyPlan : "free",
    },
    idempotencyKey: idempotencyKey || undefined,
  };

  const errors: string[] = [];
  if (!doc.title) errors.push("title es obligatorio");
  if (!doc.location) errors.push("location es obligatorio");
  if (!doc.price || Number.isNaN(doc.price) || doc.price <= 0) errors.push("price debe ser > 0");
  if (!["ARS", "USD"].includes(doc.currency)) errors.push("currency inválida");
  if (!TYPES.includes(doc.propertyType as any)) errors.push(`propertyType debe ser: ${TYPES.join(", ")}`);
  if (!OPS.includes(doc.operationType as any)) errors.push(`operationType debe ser: ${OPS.join(", ")}`);
  if (images.length === 0) errors.push("images debe tener al menos 1 URL");

  if (errors.length) {
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  // anti-duplicado por contenido (15 minutos)
  const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000);
  const firstImage = images[0] || "";
  const existingSimilar = await Listing.findOne({
    title: doc.title,
    location: doc.location,
    price: doc.price,
    currency: doc.currency,
    propertyType: doc.propertyType,
    operationType: doc.operationType,
    "images.0": firstImage || { $exists: true },
    createdAt: { $gte: fifteenMinAgo },
  }).lean();

  if (existingSimilar) {
    return NextResponse.json(
      { ok: true, id: String(existingSimilar._id), dedup: true },
      { status: 200 }
    );
  }

  const created = await Listing.create(doc);
  return NextResponse.json({ ok: true, id: String(created._id) }, { status: 201 });
}

