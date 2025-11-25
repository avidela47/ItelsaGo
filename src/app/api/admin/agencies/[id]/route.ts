import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Agency from "@/models/Agency";

// PATCH: Actualizar inmobiliaria
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = params;
    const body = await req.json();
    

  const { name, email, phone, whatsapp, plan, logo, status } = body;
  const updateFields: any = {};
  if (name !== undefined) updateFields.name = name;
  if (email !== undefined) updateFields.email = email;
  if (phone !== undefined) updateFields.phone = phone;
  if (whatsapp !== undefined) updateFields.whatsapp = whatsapp;
  if (plan !== undefined) updateFields.plan = plan;
  if (logo !== undefined) updateFields.logo = logo;
  if (status !== undefined) updateFields.status = status;

  console.log("PATCH /api/admin/agencies/[id] body:", body);
  console.log("PATCH /api/admin/agencies/[id] updateFields:", updateFields);

    const agency = await Agency.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    );
    console.log("PATCH /api/admin/agencies/[id] result:", agency);
    
    if (!agency) {
      return NextResponse.json(
        { error: "Inmobiliaria no encontrada" },
        { status: 404 }
      );
    }
    
    console.log("✅ Inmobiliaria actualizada:", agency.name);
    
    return NextResponse.json({
      ok: true,
      agency,
      message: "Inmobiliaria actualizada exitosamente",
    });
  } catch (error: any) {
    console.error("Error en PATCH /api/admin/agencies/[id]:", error);
    return NextResponse.json(
      { error: error.message || "Error al actualizar inmobiliaria" },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar inmobiliaria
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = params;
    
    const agency = await Agency.findByIdAndDelete(id);
    
    if (!agency) {
      return NextResponse.json(
        { error: "Inmobiliaria no encontrada" },
        { status: 404 }
      );
    }
    
    console.log("✅ Inmobiliaria eliminada:", agency.name);
    
    return NextResponse.json({
      ok: true,
      message: "Inmobiliaria eliminada exitosamente",
    });
  } catch (error: any) {
    console.error("Error en DELETE /api/admin/agencies/[id]:", error);
    return NextResponse.json(
      { error: error.message || "Error al eliminar inmobiliaria" },
      { status: 500 }
    );
  }
}
