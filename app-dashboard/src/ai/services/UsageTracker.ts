import type { ProviderId, ProviderUsageStats } from "@/types/ai";

// In-memory only -- resets on server restart. A real deployment would persist this to a
// database; this app currently has none (see app-dashboard/docs for context), so usage
// stats are best-effort telemetry for the current process, not a durable audit log.
const stats = new Map<ProviderId, ProviderUsageStats>();

function ensure(id: ProviderId): ProviderUsageStats {
  let s = stats.get(id);
  if (!s) {
    s = { requests: 0, errors: 0, totalTokens: 0 };
    stats.set(id, s);
  }
  return s;
}

export function recordRequest(id: ProviderId, tokens: number) {
  const s = ensure(id);
  s.requests += 1;
  s.totalTokens += tokens;
  s.lastRequestAt = new Date().toISOString();
}

export function recordError(id: ProviderId) {
  const s = ensure(id);
  s.errors += 1;
  s.lastRequestAt = new Date().toISOString();
}

export function getUsage(id: ProviderId): ProviderUsageStats {
  return { ...ensure(id) };
}

export function getAllUsage(): Partial<Record<ProviderId, ProviderUsageStats>> {
  const out: Partial<Record<ProviderId, ProviderUsageStats>> = {};
  for (const [id, s] of stats) out[id] = { ...s };
  return out;
}
