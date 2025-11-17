import { NextResponse, NextRequest } from "next/server";
import { dbConnect } from "@/lib/mongo";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import Agency from "@/models/Agency";

/**
 * POST /api/auth/login
 * body: { email, password }
 * ?guest=1 -> setea cookie guest
 */
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Modo invitado
  if (searchParams.get("guest") === "1") {
    const res = NextResponse.json({ ok: true, role: "guest" });
    res.cookies.set("role", "guest", { httpOnly: true, sameSite: "lax", path: "/" });
    res.cookies.set("uid", "", { httpOnly: true, sameSite: "lax", path: "/" });
    res.cookies.set("name", "", { httpOnly: false, sameSite: "lax", path: "/" });
    return res;
  }

  try {
    await dbConnect();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña requeridos" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email }).lean();
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const role = user.role || "user";

    // Si es agency, buscar su inmobiliaria por email
    let agencyId: string | null = null;
    if (role === "agency") {
      const agency = await Agency.findOne({ email: user.email }).lean();
      if (agency) {
        agencyId = String((agency as any)._id);
        console.log("✅ Agency vinculada al login:", (agency as any).name);
      }
    }

    const res = NextResponse.json({
      ok: true,
      role,
      name: user.name,
      email: user.email,
    });

    res.cookies.set("role", role, { httpOnly: false, sameSite: "lax", path: "/" });
    res.cookies.set("uid", String(user._id), { httpOnly: true, sameSite: "lax", path: "/" });
    res.cookies.set("name", user.name || "", {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
    });
    
    // Guardar agencyId si existe
    if (agencyId) {
      res.cookies.set("agencyId", agencyId, { httpOnly: true, sameSite: "lax", path: "/" });
    }

    return res;
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Error interno" },
      { status: 500 }
    );
  }
}
