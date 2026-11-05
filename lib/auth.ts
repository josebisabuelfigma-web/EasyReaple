import { randomBytes, createHash, scrypt as scryptCb, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const SESSION_COOKIE = "er_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14 días
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_FAILED_ATTEMPTS = 5;
export const LOCK_MINUTES = 15;
export const RESET_TTL_MINUTES = 60;
export const RESET_COOLDOWN_SECONDS = 60;

export type SessionUser = {
  id: string;
  username: string;
  email: string | null;
  tokenHash: string;
};

function scrypt(password: string, salt: Buffer, keylen: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCb(password, salt, keylen, (err, key) => (err ? reject(err) : resolve(key)));
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltB64, keyB64] = stored.split("$");
  if (scheme !== "scrypt" || !saltB64 || !keyB64) return false;
  const expected = Buffer.from(keyB64, "base64");
  const actual = await scrypt(password, Buffer.from(saltB64, "base64"), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

// Se compara contra un hash de relleno cuando el usuario no existe, para
// que "usuario inexistente" tarde lo mismo que "clave incorrecta".
let dummyHash: Promise<string> | null = null;
export function verifyAgainstDummy(password: string) {
  dummyHash ??= hashPassword("relleno-sin-usuario");
  return dummyHash.then((h) => verifyPassword(password, h));
}

export function validateUsername(username: unknown): string | null {
  if (typeof username !== "string" || username.length < 3 || username.length > 60) {
    return "El usuario debe tener entre 3 y 60 caracteres.";
  }
  if (/\s/.test(username)) return "El usuario no puede tener espacios. Ejemplo: AdminEasy.";
  return null;
}

export function stripSpaces(value: string) {
  return value.replace(/\s+/g, "");
}

export function validateEmail(email: unknown): string | null {
  if (typeof email !== "string" || email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Escribe un correo válido.";
  }
  return null;
}

export function validateNewPassword(password: unknown): string | null {
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  if (password.length > 200) return "La contraseña es demasiado larga.";
  return null;
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createPasswordResetToken(userId: string): Promise<string> {
  const supabase = getSupabaseAdmin();
  await supabase.from("password_resets").delete().eq("user_id", userId);

  const token = randomBytes(32).toString("base64url");
  const { error } = await supabase.from("password_resets").insert({
    token_hash: hashToken(token),
    user_id: userId,
    expires_at: new Date(Date.now() + RESET_TTL_MINUTES * 60 * 1000).toISOString(),
  });
  if (error) throw new Error(`No se pudo crear el enlace: ${error.message}`);
  return token;
}

export async function createSession(userId: string): Promise<string> {
  const supabase = getSupabaseAdmin();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString();

  const { error } = await supabase
    .from("app_sessions")
    .insert({ token_hash: hashToken(token), user_id: userId, expires_at: expiresAt });
  if (error) throw new Error(`No se pudo crear la sesión: ${error.message}`);

  await supabase.from("app_sessions").delete().lt("expires_at", new Date().toISOString());
  return token;
}

export async function deleteSessionByToken(token: string) {
  await getSupabaseAdmin().from("app_sessions").delete().eq("token_hash", hashToken(token));
}

export async function deleteUserSessions(userId: string, exceptTokenHash?: string) {
  let q = getSupabaseAdmin().from("app_sessions").delete().eq("user_id", userId);
  if (exceptTokenHash) q = q.neq("token_hash", exceptTokenHash);
  await q;
}

async function userFromToken(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  const tokenHash = hashToken(token);
  const { data, error } = await getSupabaseAdmin()
    .from("app_sessions")
    .select("expires_at, app_users!inner(id, username, email, active)")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error || !data) return null;
  if (new Date(data.expires_at) < new Date()) return null;

  const u = data.app_users as any;
  if (!u || !u.active) return null;
  return { id: u.id, username: u.username, email: u.email, tokenHash };
}

// Para rutas de API.
export function getSessionUser(req: NextRequest) {
  return userFromToken(req.cookies.get(SESSION_COOKIE)?.value);
}

// Para páginas del servidor (usa las cookies de la petición).
export async function getSessionUserFromCookies() {
  const { cookies } = await import("next/headers");
  return userFromToken(cookies().get(SESSION_COOKIE)?.value);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}
