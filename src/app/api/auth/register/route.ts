import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { dbConnect } from "@/lib/mongo";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email: string = (body?.email || "").toLowerCase().trim();
    const password: string = body?.password || "";
    const name: string = (body?.name || "").trim();

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: "Email y contraseña requeridos" }, { status: 400 });
    }

    await dbConnect();

    // si no hay ningún usuario admin, el primero que se registre será admin
    const adminExists = await User.exists({ role: "admin" });
    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json({ ok: false, error: "Email ya registrado" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const role = adminExists ? "user" : "admin";

    const user = await User.create({ email, passwordHash, name, role });

    return NextResponse.json({
      ok: true,
      user: { id: user._id.toString(), email: user.email, name: user.name, role: user.role },
      info: !adminExists ? "Primer usuario es ADMIN" : undefined,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: "Error al registrar" }, { status: 500 });
  }
}
