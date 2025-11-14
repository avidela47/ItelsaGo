import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Agency from "@/models/Agency";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const dynamic = "force-dynamic";

// GET: Listar todas las inmobiliarias
export async function GET() {
  try {
    await dbConnect();
    const agencies = await Agency.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json({
      ok: true,
      agencies,
    });
  } catch (error: any) {
    console.error("Error en GET /api/admin/agencies:", error);
    return NextResponse.json(
      { error: error.message || "Error al obtener inmobiliarias" },
      { status: 500 }
    );
  }
}

// POST: Crear nueva inmobiliaria
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    
    const { name, email, phone, whatsapp, plan, logo } = body;
    
    // Validaciones
    if (!name) {
      return NextResponse.json(
        { error: "El nombre es obligatorio" },
        { status: 400 }
      );
    }
    
    if (!email) {
      return NextResponse.json(
        { error: "El email es obligatorio" },
        { status: 400 }
      );
    }
    
    // Crear inmobiliaria
    const agency = await Agency.create({
      name,
      email,
      phone: phone || "",
      whatsapp: whatsapp || phone || "",
      plan: plan || "free",
      logo: logo || "",
    });
    
    console.log("✅ Inmobiliaria creada:", agency.name);
    
    // Enviar email de bienvenida
    console.log("📧 Intentando enviar email de bienvenida a:", email);
    console.log("🔑 RESEND_API_KEY configurada:", !!process.env.RESEND_API_KEY);
    
    if (process.env.RESEND_API_KEY) {
      try {
        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #2A6EBB; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #2A6EBB; }
                .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
                .button { display: inline-block; background: #2A6EBB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
                h2 { color: #2A6EBB; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎉 ¡Bienvenido a ITELSA Go!</h1>
                </div>
                <div class="content">
                  <p>Hola <strong>${name}</strong>,</p>
                  <p>Tu inmobiliaria fue dada de alta exitosamente en <strong>ITELSA Go</strong>.</p>
                  
                  <div class="box">
                    <h2>📋 Tus datos registrados:</h2>
                    <p><strong>Nombre:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Plan:</strong> ${plan?.toUpperCase() || "FREE"}</p>
                    ${phone ? `<p><strong>Teléfono:</strong> ${phone}</p>` : ""}
                  </div>

                  <h2>🚀 ¡Ya podés empezar a publicar!</h2>
                  <p>Ingresá a ITELSA Go con tu email <strong>${email}</strong> y comenzá a cargar tus inmuebles.</p>

                  <a href="http://localhost:3000/login" class="button">
                    Ingresar a ITELSA Go
                  </a>

                  <div class="box" style="margin-top: 30px; background: #fff3cd; border-left-color: #D9A441;">
                    <p><strong>💡 Próximos pasos:</strong></p>
                    <ol>
                      <li>Ingresá con tu email</li>
                      <li>Andá a "Publicar"</li>
                      <li>Cargá tus propiedades</li>
                      <li>Tus inmuebles se mostrarán con tu plan: <strong>${plan?.toUpperCase() || "FREE"}</strong></li>
                    </ol>
                  </div>

                  <div class="footer">
                    <p>Este email fue enviado desde <strong>ITELSA Go</strong></p>
                    <p>Tu plataforma inmobiliaria de confianza</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `;

        const result = await resend.emails.send({
          from: "ITELSA Go <onboarding@resend.dev>",
          to: [email],
          subject: `¡Bienvenido a ITELSA Go! - ${name}`,
          html: htmlContent,
        });

        console.log("📨 Respuesta de Resend:", JSON.stringify(result, null, 2));

        if (result.error) {
          console.error("❌ Resend retornó error:", result.error);
        } else {
          console.log("✅ Email de bienvenida enviado exitosamente a:", email);
          console.log("📧 Email ID:", result.data?.id);
        }
      } catch (emailError: any) {
        console.error("⚠️ Error enviando email de bienvenida:");
        console.error("Error completo:", emailError);
        console.error("Error message:", emailError.message);
        console.error("Error details:", JSON.stringify(emailError, null, 2));
        // No fallar la creación si el email falla
      }
    } else {
      console.warn("⚠️ RESEND_API_KEY no está configurada, no se envió email");
    }
    
    return NextResponse.json({
      ok: true,
      agency,
      message: "Inmobiliaria creada exitosamente",
    });
  } catch (error: any) {
    console.error("Error en POST /api/admin/agencies:", error);
    return NextResponse.json(
      { error: error.message || "Error al crear inmobiliaria" },
      { status: 500 }
    );
  }
}
