import path from "path";
import { promises as fs } from "fs";
import crypto from "crypto";
import sharp from "sharp";
import { StorageDriver, SaveResult } from "./types";

function safeName(original: string) {
  const base = original.replace(/[^a-zA-Z0-9._-]/g, "_");
  const ext = path.extname(base) || "";
  const name = path.basename(base, ext);
  const stamp = Date.now().toString(36) + "-" + crypto.randomBytes(4).toString("hex");
  return `${name}-${stamp}${ext}`.toLowerCase();
}
function todayPrefix(basePrefix: string) {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${basePrefix}/${yyyy}/${mm}`;
}

type LocalOpts = {
  baseDir: string;        // ej: public/uploads
  publicBasePath: string; // ej: /uploads
  basePrefix: string;     // ej: listings
};

export class LocalStorageDriver implements StorageDriver {
  constructor(private opts: LocalOpts) {}

  async save(params: {
    buffer: Buffer;
    originalName: string;
    contentType?: string;
    subpath?: string;
    makeThumb?: boolean;
    thumbWidth?: number;
  }): Promise<SaveResult> {
    const fileName = safeName(params.originalName || "file.bin");
    const sub = params.subpath || todayPrefix(this.opts.basePrefix);
    const dir = path.join(process.cwd(), this.opts.baseDir, sub);
    await fs.mkdir(dir, { recursive: true });

    const filePath = path.join(dir, fileName);
    await fs.writeFile(filePath, params.buffer);

    const publicUrl = path.posix.join(this.opts.publicBasePath, sub, fileName);

    let thumbUrl: string | undefined;
    if (params.makeThumb) {
      try {
        const thumbName = fileName.replace(/\.(\w+)$/, (_m, ext) => `-thumb.$1`);
        const thumbDir = dir; // guardo junto al original
        const thumbPath = path.join(thumbDir, thumbName);
        const width = params.thumbWidth && params.thumbWidth > 10 ? params.thumbWidth : 800;

        // generar thumbnail (solo si es imagen)
        await sharp(params.buffer).resize({ width, withoutEnlargement: true }).toFile(thumbPath);

        thumbUrl = path.posix.join(this.opts.publicBasePath, sub, thumbName);
      } catch {
        // si falla (por no ser imagen), ignoro
      }
    }

    return { url: publicUrl, thumbUrl, key: path.posix.join(sub, fileName), contentType: params.contentType };
  }
}
