import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import { getAgencyFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  await dbConnect();
  const agency = await getAgencyFromRequest(request);
  if (!agency) return NextResponse.json({ ok: false }, { status: 401 });

  return NextResponse.json({
    ok: true,
    agency: {
      id: String((agency as any)._id),
      name: agency.name,
      email: (agency as any).email || null,
      logoUrl: (agency as any).logoUrl || null,
      phone: (agency as any).phone || null,
      contactEmail: (agency as any).contactEmail || null,
      plan: agency.plan || "free",
    },
  });
}
