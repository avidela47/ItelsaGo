import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Listing from "@/models/Listing";
import Product from "@/models/Product";

export async function POST() {
  await dbConnect();
  await Listing.deleteMany({});
  await Product.deleteMany({});

  await Listing.insertMany([
    { title:"Depto 2 amb Nueva Córdoba", rooms:2, price:78000, currency:"USD", location:"Nueva Córdoba", lat:-31.423, lng:-64.185 },
    { title:"Casa 3 dorm con cochera", rooms:4, price:125000, currency:"USD", location:"Cerro de las Rosas", lat:-31.353, lng:-64.220 },
  ]);

  await Product.insertMany([
    { title:"Sensor Optex CTD-2500P-IR", category:"Sensores", price:123000, currency:"ARS" },
    { title:"Fuente Mean Well LRS-75-12", category:"Fuentes", price:35600, currency:"ARS" },
  ]);

  return NextResponse.json({ ok: true });
}
