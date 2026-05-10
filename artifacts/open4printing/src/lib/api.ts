import { setBaseUrl } from "@workspace/api-client-react";

const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
setBaseUrl(base);

export const apiPath = (p: string) => `${base}${p.startsWith("/") ? p : `/${p}`}`;

export interface UploadResult {
  id: number;
  originalName: string;
  fileType: string;
  fileSize: number;
  side: 'front' | 'back' | null;
  uploadedAt: string;
}

export async function uploadFile(file: File, side?: 'front' | 'back'): Promise<UploadResult> {
  const fd = new FormData();
  fd.append("file", file);
  if (side) fd.append("side", side);
  const res = await fetch(apiPath("/api/uploads"), {
    method: "POST",
    body: fd,
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed: ${res.status} ${text}`);
  }
  return res.json();
}

const ALLOWED_FILE_TYPES = ['pdf', 'png', 'jpg', 'jpeg', 'svg', 'eps', 'ai', 'psd'] as const;
export const ACCEPT_FILE_TYPES = ALLOWED_FILE_TYPES.map((e) => `.${e}`).join(',');

export function isAllowedFile(name: string): boolean {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  return (ALLOWED_FILE_TYPES as readonly string[]).includes(ext);
}

export function formatFileSize(bytes: number): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function fileExtension(name: string): string {
  return (name.split('.').pop() ?? '').toLowerCase();
}
