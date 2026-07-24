import { NextResponse } from "next/server";
import { AIService } from "@/ai/services/AIService";
import { AIProviderError } from "@/ai/providers/AIProvider";
import { getByokKey } from "@/ai/services/KeyStore";
import { checkRateLimit } from "@/ai/services/RateLimiter";
import type { AIChatRequest, ProviderId } from "@/types/ai";

// The only endpoint the frontend talks to for AI chat. Everything upstream of this route
// (provider selection, context injection, retries, streaming, Kimi credentials) is a
// server-only concern -- the client never sees an API key or talks to the Kimi API directly.
export const runtime = "nodejs";

function statusForErrorCode(code: AIProviderError["code"]): number {
  switch (code) {
    case "unconfigured":
      return 503;
    case "rate_limited":
      return 429;
    case "timeout":
      return 504;
    default:
      return 502;
  }
}

function clientKey(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

export async function POST(request: Request) {
  const rl = checkRateLimit(clientKey(request));
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.retryAfterMs ?? 1000) / 1000)) } }
    );
  }

  let body: AIChatRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: "`messages` must be a non-empty array." }, { status: 400 });
  }

  const providerId: ProviderId = body.providerId ?? "kimi";
  const byokKey = (await getByokKey(providerId)) ?? undefined;

  if (body.stream) {
    const encoder = new TextEncoder();
    const streamBody = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          // Let the generator run to natural completion instead of `break`-ing on chunk.done --
          // an early break triggers an implicit generator.return(), which unwinds AIService.stream()
          // before it reaches its recordRequest() call after the loop, silently dropping usage stats.
          for await (const chunk of AIService.stream(body, byokKey)) {
            if (chunk.delta) controller.enqueue(encoder.encode(chunk.delta));
          }
        } catch (err) {
          const message = err instanceof AIProviderError ? err.message : "AI request failed.";
          controller.enqueue(encoder.encode(`\n\n[error] ${message}`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(streamBody, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  try {
    const result = await AIService.chat(body, byokKey);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof AIProviderError) {
      return NextResponse.json(
        { error: err.message, code: err.code, provider: err.provider },
        { status: statusForErrorCode(err.code) }
      );
    }
    console.error("[api/ai/chat] unexpected error", err);
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
