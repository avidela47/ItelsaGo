// src/lib/clientAuth.ts
export function isAdminClient(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some(c => c.trim().startsWith("role=admin"));
}
