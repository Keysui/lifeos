import { NextResponse } from "next/server";
import { AIService } from "@/ai/services/AIService";
import { getByokKey } from "@/ai/services/KeyStore";
import type { ProviderId } from "@/types/ai";

export const runtime = "nodejs";

// Makes one real, minimal-token request to the provider and reports whether it succeeded.
// Separate from /api/ai/status so the settings page doesn't burn quota just by loading.
export async function POST(request: Request) {
  let body: { providerId?: ProviderId };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.providerId) {
    return NextResponse.json({ error: "`providerId` is required." }, { status: 400 });
  }

  const byokKey = (await getByokKey(body.providerId)) ?? undefined;
  const result = await AIService.testConnection(body.providerId, byokKey);
  return NextResponse.json(result);
}
