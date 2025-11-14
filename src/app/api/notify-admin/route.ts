import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { listingTitle, listingId, agencyName } = body;

    if (!process.env.RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY no configurada");
      return NextResponse.json({ ok: false });
    }

    const adminEmail = "ariel_videla@hotmail.com"; // Email del admin (debe estar registrado en Resend)

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #D9A441; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .property { background: white; padding: 15px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #D9A441; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
            .button { display: inline-block; background: #2A6EBB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏠 Nueva Propiedad Publicada</h1>
            </div>
            <div class="content">
              <p>Hola Admin,</p>
              <p>Una inmobiliaria ha publicado una nueva propiedad en <strong>ITELSA Go</strong>:</p>
              
              <div class="property">
                <h3>${listingTitle}</h3>
                <p><strong>Inmobiliaria:</strong> ${agencyName || "Sin especificar"}</p>
                <p><strong>ID:</strong> ${listingId}</p>
              </div>

              <p>
                <strong>Acción requerida:</strong><br>
                Ingresá al panel de administración para asignar el plan (FREE, PRO o PREMIUM) a esta inmobiliaria.
              </p>

              <a href="http://localhost:3000/panel/agencies" class="button">
                Ir al Panel de Inmobiliarias
              </a>

              <div class="footer">
                <p>Este email fue enviado desde <strong>ITELSA Go</strong></p>
                <p>Sistema automático de notificaciones</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const { error } = await resend.emails.send({
      from: "ITELSA Go <onboarding@resend.dev>",
      to: [adminEmail],
      subject: `Nueva propiedad: ${listingTitle}`,
      html: htmlContent,
    });

    if (error) {
      console.error("❌ Error enviando email al admin:", error);
      return NextResponse.json({ ok: false, error: error.message });
    }

    console.log("✅ Email enviado al admin");
    return NextResponse.json({ ok: true });

  } catch (error: any) {
    console.error("❌ Error en /api/notify-admin:", error);
    return NextResponse.json({ ok: false, error: error.message });
  }
}
