import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Listing from "@/models/Listing";
import Agency from "@/models/Agency";
import mongoose from "mongoose";

const TYPES = ["depto", "casa", "lote", "local"] as const;
const OPS = ["venta", "alquiler", "temporario"] as const;

function num(v: string | null | undefined) {
  if (!v || v.trim() === "") return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
}

export async function GET(request: Request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);

  const q = searchParams.get("q")?.trim() || undefined;
  const min = num(searchParams.get("priceMin")) ?? num(searchParams.get("min"));
  const max = num(searchParams.get("priceMax")) ?? num(searchParams.get("max"));
  const rooms = num(searchParams.get("rooms"));
  const type = searchParams.get("propertyType") || searchParams.get("type") || undefined;
  const op = searchParams.get("operationType") || searchParams.get("op") || undefined;

  const page = Math.max(num(searchParams.get("page")) || 1, 1);
  const pageSize = Math.min(Math.max(num(searchParams.get("pageSize")) || 12, 1), 60);

  const sortParam = (searchParams.get("sort") || "newest").toLowerCase();
  const sort: any =
    sortParam === "price_asc"  ? { price: 1,  createdAt: -1 } :
    sortParam === "price_desc" ? { price: -1, createdAt: -1 } :
                                 { createdAt: -1 };

  // 🔒 Mostrar SOLO publicaciones “completas”
  const where: any = {
    title: { $exists: true, $type: "string", $ne: "" },
    location: { $exists: true, $type: "string", $ne: "" },
    price: { $exists: true, $gt: 0 },
    currency: { $exists: true, $ne: "" },
    propertyType: { $in: [...TYPES] },
    operationType: { $in: [...OPS] },
    "images.0": { $exists: true, $ne: "" }
  };

  if (q) where.$or = [
    { title: { $regex: q, $options: "i" } },
    { location: { $regex: q, $options: "i" } },
    { description: { $regex: q, $options: "i" } },
  ];
  if (typeof min === "number") where.price = { ...(where.price || {}), $gte: min };
  if (typeof max === "number") where.price = { ...(where.price || {}), $lte: max };
  if (typeof rooms === "number") where.rooms = { $gte: rooms };
  if (type) where.propertyType = type;
  if (op) where.operationType = op;

  const total = await Listing.countDocuments(where);
  const docs = await Listing.find(where)
    .sort(sort)
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean();

  const agencyIds = docs
    .map((d: any) => d.agencyId)
    .filter(Boolean)
    .filter((id: any) => (typeof id === "string" ? /^[0-9a-fA-F]{24}$/.test(id) : mongoose.isValidObjectId(id)));

  const agencies = agencyIds.length ? await Agency.find({ _id: { $in: agencyIds } }).lean() : [];
  const amap = new Map(agencies.map((a: any) => [String(a._id), a]));

  const items = docs.map((d: any) => {
    const { _id, agencyId, ...rest } = d;
    const ag = agencyId ? amap.get(String(agencyId)) : null;
    return {
      id: String(_id),
      agency: ag ? { id: String(ag._id), name: ag.name, plan: ag.plan } : null,
      ...rest,
    };
  });

  return NextResponse.json({
    items,
    page,
    pageSize,
    total,
    pages: Math.max(1, Math.ceil(total / pageSize)),
    sort: sortParam,
  });
}
