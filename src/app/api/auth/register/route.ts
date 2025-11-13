import { NextResponse, NextRequest } from "next/server";
import { dbConnect } from "@/lib/mongo";
import bcrypt from "bcryptjs";
import User from "@/models/User";

/**
 * POST /api/auth/register
 * body: { name, email, password, role? }
 * Sólo el primer usuario será admin automáticamente si no hay ninguno.
 */
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nombre, email y contraseña requeridos" },
        { status: 400 }
      );
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 });
    }

    // El rol final será el que se envía (nunca admin desde el formulario)
    // Los admin se crean manualmente desde MongoDB Atlas
    const finalRole: "user" | "agency" = role === "agency" ? "agency" : "user";

    const hashed = await bcrypt.hash(password, 10);

    const doc = await User.create({
      name,
      email,
      password: hashed,
      role: finalRole,
    });

    return NextResponse.json({
      ok: true,
      id: String(doc._id),
      role: finalRole,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Error interno" },
      { status: 500 }
    );
  }
}


