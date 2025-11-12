import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export type Role = "admin" | "user";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

export type SessionPayload = {
  uid: string;
  role: Role;
  email: string;
  name?: string;
};

export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

// Compat: nombre histórico signToken
export const signToken = signSession;

export function verifySession(token?: string): SessionPayload | null {
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export function getSessionFromRequest(req: NextRequest): SessionPayload | null {
  const token = req.cookies.get("session")?.value;
  return verifySession(token);
}

export function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set("session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 días
  });
}

// Compat: nombre histórico setTokenCookie
export const setTokenCookie = setSessionCookie;

// Compare password helper (compatibilidad con código antiguo)
export async function comparePassword(plain: string, hash?: string) {
  if (!hash) return false;
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set("session", "", { path: "/", maxAge: 0 });
}

// Obtener agencia/usuario desde una Request o NextRequest
import Agency from "@/models/Agency";
import { dbConnect } from "@/lib/mongo";

export async function getAgencyFromRequest(req: any) {
  // Intentar leer token de cookies (NextRequest tiene req.cookies.get)
  let token: string | undefined = undefined;
  try {
    token = req?.cookies?.get?.("session")?.value;
  } catch {}

  // Si no vino en cookies, intentar leer header 'cookie' (Request)
  if (!token) {
    const cookieHeader = req?.headers?.get?.("cookie") || req?.headers?.cookie || "";
    for (const part of cookieHeader.split(";")) {
      const [k, v] = part.split("=");
      if (k && k.trim() === "session") {
        token = (v || "").trim();
        break;
      }
    }
  }

  const session = verifySession(token);
  if (!session) return null;

  await dbConnect();
  const ag = await Agency.findById(session.uid).lean();
  return ag;
}

