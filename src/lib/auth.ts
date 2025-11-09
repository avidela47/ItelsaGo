// @ts-nocheck

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { IncomingMessage } from "http";
import { parse as parseCookie, serialize as serializeCookie } from "cookie";
import Agency from "@/models/Agency";

const JWT_SECRET = process.env.JWT_SECRET || "replace-me-in-env";
const TOKEN_NAME = "itelsa_token";

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: any, expiresIn = "7d") {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (err) {
    return null;
  }
}

export function setTokenCookie(res: NextResponse, token: string) {
  const cookie = serializeCookie(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  res.headers.set("Set-Cookie", cookie);
}

export function clearTokenCookie(res: NextResponse) {
  const cookie = serializeCookie(TOKEN_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
  res.headers.set("Set-Cookie", cookie);
}

export async function getAgencyFromRequest(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const cookies = parseCookie(cookieHeader || "");
    const token = cookies[TOKEN_NAME];
    if (!token) return null;
    const data = verifyToken(token);
    if (!data || !data.id) return null;
    const agency = await Agency.findById(data.id).lean();
    return agency;
  } catch (err) {
    return null;
  }
}

export { TOKEN_NAME };
