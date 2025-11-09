import { NextResponse } from "next/server";
import { dbConnect } from "../../../lib/mongo";
import Listing from "../../../models/Listing";

export async function GET() {
  await dbConnect();
  const items = await Listing.find().limit(50).lean();
  return NextResponse.json(items);
}

