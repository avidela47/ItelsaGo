// src/lib/auth.ts
import type { NextRequest } from "next/server";

/** SERVER: valida admin por cookie en request */
export function isAdminFromRequest(req: NextRequest): boolean {
  const role = req.cookies.get("role")?.value || "guest";
  return role === "admin";
}

/** CLIENT: chequeo simple por cookie (para Navbar, etc.) */
export function isAdminFromBrowser(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((c) => c.startsWith("role=admin"));
}

