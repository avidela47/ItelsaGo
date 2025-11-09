import { NextResponse } from "next/server";
import { dbConnect } from "../../../lib/mongo";
import Listing from "../../../models/Listing";
import Agency from "../../../models/Agency";

export async function GET() {
  try {
    await dbConnect();

    await Listing.deleteMany({});
    await Agency.deleteMany({});

    const agency = await Agency.create({
      name: "Inmobiliaria Córdoba",
      phone: "+54 351 555-1234",
      email: "contacto@inmocba.test",
      plan: "basic"
    } as any);

    const docs = await Listing.insertMany([
      { title:"Depto 2 amb Nueva Córdoba", rooms:2, price:78000, currency:"USD", location:"Nueva Córdoba", lat:-31.423, lng:-64.185, agencyId: agency._id, propertyType: "depto", operationType: "venta" },
      { title:"Casa 3 dorm con cochera", rooms:4, price:320000, currency:"USD", location:"Cerro de las Rosas", lat:-31.353, lng:-64.220, agencyId: agency._id, propertyType: "casa", operationType: "venta" },
      { title:"Monoambiente céntrico", rooms:1, price:230000, currency:"ARS", location:"Centro", lat:-31.416, lng:-64.183, agencyId: agency._id, propertyType: "depto", operationType: "alquiler" },
      { title:"Dúplex 3 amb patio", rooms:3, price:180000, currency:"ARS", location:"General Paz", lat:-31.413, lng:-64.171, agencyId: agency._id, propertyType: "casa", operationType: "alquiler" },
      { title:"Lote 450 m²", rooms:0, price:33000, currency:"USD", location:"Mendiolaza", lat:-31.258, lng:-64.295, agencyId: agency._id, propertyType: "lote", operationType: "venta" },
    ]);

    return NextResponse.json({ ok: true, agency: agency.name, inserted: docs.length });
  } catch (e: any) {
    console.error("GET /api/seed-listings error:", e);
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}



