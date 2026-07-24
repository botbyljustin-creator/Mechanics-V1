import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

export const SESSION_COOKIE = "mechanics_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set. Copy .env.example to .env and set a value.");
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// Payload carries everything permission checks need so API routes and
// middleware don't have to hit the database on every request.
export async function signSession({ userId, email, name, role, departmentKey }) {
  return new SignJWT({ email, name, role, departmentKey })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySession(token) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return {
      userId: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      departmentKey: payload.departmentKey || null,
    };
  } catch {
    return null;
  }
}
