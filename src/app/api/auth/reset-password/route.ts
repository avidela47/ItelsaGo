import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { token, password } = await req.json();
    if (!token || typeof token !== "string" || !password || typeof password !== "string") {
      return NextResponse.json({ error: "Token y nueva contraseña requeridos" }, { status: 400 });
    }
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 });
    }
    // Validar seguridad de la contraseña
    if (password.length < 8) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 });
    }
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return NextResponse.json({ ok: true, message: "Contraseña restablecida correctamente" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al restablecer contraseña" }, { status: 500 });
  }
}
