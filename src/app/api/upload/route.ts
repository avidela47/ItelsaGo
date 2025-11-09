import { NextResponse } from "next/server";
import { storage } from "../../../lib/storage";
import crypto from "crypto";
import mime from "mime";

export const runtime = "nodejs";

/**
 * Estructura de carpeta por batch:
 *   <UPLOADS_BASE_PREFIX>/<YYYY>/<MM>/<batchId>/archivo.ext
 * Un batch se genera por request (para agrupar fotos de una publicación).
 */
function buildSubpath() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const batchId = crypto.randomBytes(4).toString("hex");
  const basePrefix = process.env.UPLOADS_BASE_PREFIX || "listings";
  return `${basePrefix}/${yyyy}/${mm}/${batchId}`;
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const files = form.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const subpath = buildSubpath();
    const makeThumb = true;      // generamos thumb para imágenes
    const thumbWidth = 800;

    const st = storage();

    const results = [];
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const contentType = (file as any).type || mime.getType((file as any).name) || "application/octet-stream";

      const saved = await st.save({
        buffer,
        originalName: (file as any).name || "file.bin",
        contentType,
        subpath,
        makeThumb,
        thumbWidth
      });

      results.push(saved);
    }

    return NextResponse.json({
      ok: true,
      urls: results.map(r => r.url),
      thumbs: results.map(r => r.thumbUrl || null),
      keys: results.map(r => r.key || null)
    });
  } catch (e: any) {
    console.error("POST /api/upload error:", e);
    return NextResponse.json({ error: e?.message || "Upload error" }, { status: 500 });
  }
}
