export type SaveResult = {
  url: string;         // URL pública del archivo
  thumbUrl?: string;   // URL pública del thumbnail (si corresponde)
  key?: string;        // key interna (s3) o ruta relativa (local)
  contentType?: string;
};

export interface StorageDriver {
  save(params: {
    buffer: Buffer;
    originalName: string;
    contentType?: string;
    subpath?: string; // prefijo dinámico p/organizar (ej: listings/2025/11/lote-123)
    makeThumb?: boolean;
    thumbWidth?: number; // px
  }): Promise<SaveResult>;
}
