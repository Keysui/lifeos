import { NextResponse } from "next/server";
import { AIRouter } from "@/ai/router/AIRouter";
import { listByokPresence, removeByokKey, setByokKey } from "@/ai/services/KeyStore";
import type { ProviderId } from "@/types/ai";

export const runtime = "nodejs";

// Bring-Your-Own-Key management. Keys are written to and read from httpOnly, encrypted cookies
// (see KeyStore.ts) -- this route never returns key material, only presence booleans.

function isKnownProvider(id: unknown): id is ProviderId {
  return typeof id === "string" && AIRouter.isRegistered(id as ProviderId);
}

export async function GET() {
  const presence = await listByokPresence(AIRouter.listRegisteredIds());
  return NextResponse.json({ providers: presence });
}

export async function POST(request: Request) {
  let body: { providerId?: string; apiKey?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!isKnownProvider(body.providerId)) {
    return NextResponse.json({ error: "Unknown providerId." }, { status: 400 });
  }
  if (typeof body.apiKey !== "string" || body.apiKey.trim().length < 8 || body.apiKey.length > 512) {
    return NextResponse.json({ error: "apiKey must be a non-trivial string." }, { status: 400 });
  }

  await setByokKey(body.providerId, body.apiKey.trim());
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  let body: { providerId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!isKnownProvider(body.providerId)) {
    return NextResponse.json({ error: "Unknown providerId." }, { status: 400 });
  }

  await removeByokKey(body.providerId);
  return NextResponse.json({ ok: true });
}
