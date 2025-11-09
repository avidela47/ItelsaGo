import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
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

type S3Opts = {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  region: string;
  forcePathStyle: boolean;
  publicBaseUrl: string;  // dominio/CDN desde el que se sirven los objetos
  basePrefix: string;
};

export class S3StorageDriver implements StorageDriver {
  private s3: S3Client;
  constructor(private opts: S3Opts) {
    this.s3 = new S3Client({
      region: this.opts.region,
      endpoint: this.opts.endpoint,
      forcePathStyle: this.opts.forcePathStyle,
      credentials: {
        accessKeyId: this.opts.accessKeyId,
        secretAccessKey: this.opts.secretAccessKey
      }
    });
  }

  private publicUrlFor(key: string) {
    // ejemplo: https://cdn.tu-dominio.com/<key>
    return `${this.opts.publicBaseUrl.replace(/\/+$/, "")}/${key}`;
  }

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
    const key = `${sub}/${fileName}`;

    // subir original
    await this.s3.send(new PutObjectCommand({
      Bucket: this.opts.bucket,
      Key: key,
      Body: params.buffer,
      ContentType: params.contentType || "application/octet-stream",
      ACL: "public-read" as any // MinIO/S3: asegurar lectura pública (o usar políticas de bucket)
    }));

    let thumbUrl: string | undefined;
    if (params.makeThumb) {
      try {
        const width = params.thumbWidth && params.thumbWidth > 10 ? params.thumbWidth : 800;
        const thumbBuf = await sharp(params.buffer).resize({ width, withoutEnlargement: true }).toBuffer();
        const thumbKey = `${sub}/${fileName.replace(/\.(\w+)$/, (_m, ext) => `-thumb.${ext}`)}`;

        await this.s3.send(new PutObjectCommand({
          Bucket: this.opts.bucket,
          Key: thumbKey,
          Body: thumbBuf,
          ContentType: params.contentType || "image/jpeg",
          ACL: "public-read" as any
        }));

        thumbUrl = this.publicUrlFor(thumbKey);
      } catch {
        // si no es imagen o falla, ignoramos
      }
    }

    return {
      url: this.publicUrlFor(key),
      thumbUrl,
      key,
      contentType: params.contentType
    };
  }
}
