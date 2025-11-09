import { StorageDriver } from "./types";
import { LocalStorageDriver } from "./local";
import { S3StorageDriver } from "./s3";

let driver: StorageDriver | null = null;

export function storage(): StorageDriver {
  if (driver) return driver;

  const which = (process.env.STORAGE_DRIVER || "local").toLowerCase();
  const basePrefix = process.env.UPLOADS_BASE_PREFIX || "listings";

  if (which === "s3") {
    driver = new S3StorageDriver({
      endpoint: process.env.S3_ENDPOINT!,
      accessKeyId: process.env.S3_ACCESS_KEY!,
      secretAccessKey: process.env.S3_SECRET_KEY!,
      bucket: process.env.S3_BUCKET!,
      region: process.env.S3_REGION || "us-east-1",
      forcePathStyle: String(process.env.S3_FORCE_PATH_STYLE || "true") === "true",
      publicBaseUrl: process.env.STORAGE_PUBLIC_BASE_URL!, // ej: https://cdn.tu-dominio.com
      basePrefix
    });
  } else {
    driver = new LocalStorageDriver({
      baseDir: "public/uploads",
      publicBasePath: "/uploads",
      basePrefix
    });
  }
  return driver!;
}
