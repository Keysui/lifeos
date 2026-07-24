import { cookies } from "next/headers";
import crypto from "node:crypto";
import type { ProviderId } from "@/types/ai";

// Bring-Your-Own-Key storage. There is no database in this app, so keys live in httpOnly,
// AES-256-GCM-encrypted cookies -- never readable by client JS, and not plaintext even to
// someone inspecting cookies in devtools. This is weaker than a real backend-managed secrets
// store (the encryption key itself lives in an env var on the same machine), but it satisfies
// "never expose keys client-side" and "encrypted at rest" within the constraints of a
// database-less app. Server-only: never import this file from a Client Component.

const COOKIE_PREFIX = "life-os-byok-";
const ALGORITHM = "aes-256-gcm";

function getEncryptionKey(): Buffer {
  const secret = process.env.AI_KEY_ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error("AI_KEY_ENCRYPTION_SECRET is not set -- cannot store or read BYOK credentials.");
  }
  return crypto.scryptSync(secret, "life-os-ai-keystore", 32);
}

function encrypt(plainText: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("base64url");
}

function decrypt(payload: string): string | null {
  try {
    const key = getEncryptionKey();
    const buf = Buffer.from(payload, "base64url");
    const iv = buf.subarray(0, 12);
    const authTag = buf.subarray(12, 28);
    const encrypted = buf.subarray(28);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
  } catch {
    return null; // Wrong key, corrupted cookie, or tampering -- treat as absent, never throw here.
  }
}

export async function setByokKey(providerId: ProviderId, apiKey: string): Promise<void> {
  const store = await cookies();
  store.set(`${COOKIE_PREFIX}${providerId}`, encrypt(apiKey), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function removeByokKey(providerId: ProviderId): Promise<void> {
  const store = await cookies();
  store.delete(`${COOKIE_PREFIX}${providerId}`);
}

export async function getByokKey(providerId: ProviderId): Promise<string | null> {
  const store = await cookies();
  const raw = store.get(`${COOKIE_PREFIX}${providerId}`)?.value;
  return raw ? decrypt(raw) : null;
}

/** Boolean presence map only -- never returns key material. Used to render BYOK status in the UI. */
export async function listByokPresence(providerIds: ProviderId[]): Promise<Partial<Record<ProviderId, boolean>>> {
  const store = await cookies();
  const result: Partial<Record<ProviderId, boolean>> = {};
  for (const id of providerIds) {
    result[id] = Boolean(store.get(`${COOKIE_PREFIX}${id}`)?.value);
  }
  return result;
}
