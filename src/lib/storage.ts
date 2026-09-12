import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

/**
 * Em produção, aponte STORAGE_ROOT para um disco persistente (ex: um volume
 * do Railway/Render montado em /data). Sem isso, os arquivos enviados somem
 * a cada novo deploy — o container não tem disco persistente por padrão.
 */
const STORAGE_ROOT = process.env.STORAGE_ROOT || path.join(process.cwd(), "storage", "uploads");

export async function saveUploadedFile(file: File, subdir: string): Promise<string> {
  const dir = path.join(/* turbopackIgnore: true */ STORAGE_ROOT, subdir);
  await mkdir(dir, { recursive: true });

  const ext = path.extname(file.name) || "";
  const fileName = `${randomUUID()}${ext}`;
  const filePath = path.join(dir, fileName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  return path.join(subdir, fileName).replace(/\\/g, "/");
}

export function resolveStoredFilePath(relativePath: string): string {
  return path.join(/* turbopackIgnore: true */ STORAGE_ROOT, relativePath);
}

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".txt": "text/plain",
  ".csv": "text/csv",
};

export function guessMimeType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  return MIME_BY_EXT[ext] ?? "application/octet-stream";
}

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB
