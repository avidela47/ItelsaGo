// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export const config = {
  api: {
    bodyParser: false, // ⛔ importante para multipart/form-data
  },
};

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// aseguro carpeta
function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function uniqueName(original: string) {
  const ext = path.extname(original) || ".jpg";
  const base = crypto.randomBytes(10).toString("hex");
  return `${Date.now()}_${base}${ext}`;
}

function isImage(mime?: string) {
  return !!mime && /^image\//i.test(mime);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  ensureDir(UPLOAD_DIR);

  const form = formidable({
    multiples: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB por imagen (ajustable)
    filter: ({ mimetype }) => isImage(mimetype || undefined), // solo imágenes
  });

  try {
    const { files } = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const arr: File[] = [];
    // Puede venir como 'file' o 'files[]' según el input
    Object.values(files).forEach((v) => {
      if (Array.isArray(v)) arr.push(...v);
      else if (v) arr.push(v as File);
    });

    if (arr.length === 0) {
      return res.status(400).json({ ok: false, error: "No se recibió ninguna imagen" });
    }

    const urls: string[] = [];

    for (const f of arr) {
      const oldPath = (f as any).filepath || (f as any).path;
      const original = f.originalFilename || "img.jpg";
      const fileName = uniqueName(original);
      const newPath = path.join(UPLOAD_DIR, fileName);

      await fs.promises.copyFile(oldPath, newPath);

      // URL pública
      const publicUrl = `/uploads/${fileName}`;
      urls.push(publicUrl);
    }

    return res.status(200).json({ ok: true, urls });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || "Error al subir" });
  }
}
