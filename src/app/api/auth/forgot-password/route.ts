import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import User from "@/models/User";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }
    const user = await User.findOne({ email });
    if (!user) {
      // No revelar si existe o no
      return NextResponse.json({ ok: true, message: "Si el email existe, se enviará un enlace de recuperación." });
    }
    // Generar token seguro
    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = Date.now() + 1000 * 60 * 30; // 30 minutos
    user.resetPasswordToken = token;
    user.resetPasswordExpires = tokenExpiry;
    await user.save();
    // Email de recuperación
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/reset-password?token=${token}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">Recuperación de contraseña</h2>
        <p>Hola,</p>
        <p>Recibimos una solicitud para restablecer tu contraseña en <strong>ITELSA Go</strong>.</p>
        <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
        <a href="${resetUrl}" style="display:inline-block; background:#4CAF50; color:#fff; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:bold;">Restablecer contraseña</a>
        <p style="margin-top:24px; color:#888; font-size:13px;">Si no solicitaste este cambio, puedes ignorar este email.</p>
        <p style="margin-top:24px; font-size:12px; color:#666;">ITELSA Go | Tu plataforma inmobiliaria de confianza</p>
      </div>
    `;
    await resend.emails.send({
      from: "ITELSA Go <no-reply@itelsago.com>",
      to: [email],
      subject: "Recuperación de contraseña - ITELSA Go",
      html: htmlContent,
  replyTo: "soporte@itelsago.com"
    });
    return NextResponse.json({ ok: true, message: "Si el email existe, se enviará un enlace de recuperación." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al solicitar recuperación" }, { status: 500 });
  }
}
