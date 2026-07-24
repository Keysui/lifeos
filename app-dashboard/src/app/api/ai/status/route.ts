import { NextResponse } from "next/server";
import { AIRouter } from "@/ai/router/AIRouter";
import { getAllUsage } from "@/ai/services/UsageTracker";
import { listByokPresence } from "@/ai/services/KeyStore";

export const runtime = "nodejs";

// Cheap status snapshot for the AI Settings page: which providers are registered, whether each
// has credentials (managed env var or BYOK cookie), and in-memory usage counters. Does NOT make
// a live network call to any provider -- that's what POST /api/ai/test is for.
export async function GET() {
  const providerIds = AIRouter.listRegisteredIds();
  const byokPresence = await listByokPresence(providerIds);
  const usage = getAllUsage();

  const providers = providerIds.map((id) => {
    const provider = AIRouter.getProvider(id)!;
    return {
      id,
      name: provider.name,
      implemented: provider.implemented,
      capabilities: provider.capabilities,
      managedConfigured: provider.isConfigured(),
      byokConfigured: byokPresence[id] ?? false,
      model: provider.getConfiguredModel(),
      usage: usage[id] ?? { requests: 0, errors: 0, totalTokens: 0 },
    };
  });

  return NextResponse.json({ providers, defaultProvider: "kimi" });
}
