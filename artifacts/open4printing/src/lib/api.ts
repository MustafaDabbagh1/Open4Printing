import { setBaseUrl } from "@workspace/api-client-react";

const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
setBaseUrl(base);

export const apiPath = (p: string) => `${base}${p.startsWith("/") ? p : `/${p}`}`;

export async function uploadFile(file: File): Promise<{ id: number; originalName: string }> {
  const fd = new FormData();
  fd.append("file", file);
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
