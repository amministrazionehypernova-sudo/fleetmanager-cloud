import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);

export type SessionPayload = {
  userId: string;
  companyId: string;
  email: string;
  role: string;
};

export async function createSession(payload: SessionPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("fleet_session")?.value;

  if (!token) {
    return null;
  }

  return verifySession(token);
}

export async function requireSession() {
  const session = await getCurrentSession();

  if (!session) {
    throw new Error("Sessione non valida.");
  }

  return session;
}