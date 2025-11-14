import type { NextRequest } from "next/server";

export function getRoleFromRequest(req: NextRequest): "admin" | "user" | "guest" {
  const cookie = req.cookies.get("role")?.value || "guest";
  if (cookie === "admin") return "admin";
  if (cookie === "user") return "user";
  return "guest";
}

export function isAdminFromRequest(req: NextRequest): boolean {
  return getRoleFromRequest(req) === "admin";
}
