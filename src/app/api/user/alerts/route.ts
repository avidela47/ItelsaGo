import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Alert from "@/models/Alert";
import User from "@/models/User";

// GET: Listar alertas del usuario
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const userId = req.cookies.get("uid")?.value;
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    const alerts = await Alert.find({ user: userId });
    return NextResponse.json({ ok: true, alerts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al obtener alertas" }, { status: 500 });
  }
}

// POST: Crear nueva alerta
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const userId = req.cookies.get("uid")?.value;
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    const { criteria } = await req.json();
    if (!criteria) {
      return NextResponse.json({ error: "Criterios requeridos" }, { status: 400 });
    }
    const alert = await Alert.create({ user: userId, criteria });
    return NextResponse.json({ ok: true, alert });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al crear alerta" }, { status: 500 });
  }
}
