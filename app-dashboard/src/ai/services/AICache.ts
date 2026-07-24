import { getSupabaseClient } from "@/lib/supabase/client";

// Generic cache for AI-generated results, backed by the ai_cache table. Keyed by a hash of
// the source content, so a result is only regenerated when what it's based on actually
// changed -- satisfies "do not call Kimi unnecessarily / only regenerate when content changes"
// without needing a bespoke cache per feature.
//
// Gracefully no-ops (always regenerates, never persists) when Supabase isn't configured yet --
// callers don't need to change once NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY are set.

function hashContent(content: string): string {
  let hash = 5381;
  for (let i = 0; i < content.length; i++) {
    hash = ((hash << 5) + hash + content.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(16);
}

interface AICacheParams<T> {
  entityType: string; // e.g. "project", "habit_set", "daily_brief", "nutrition"
  entityId: string; // e.g. a project id, "all", or a date
  kind: string; // e.g. "status_summary", "insights", "brief", "macros"
  /** Content the result is derived from. Hashed to detect when regeneration is needed. */
  sourceContent: string;
  generate: () => Promise<T>;
}

export async function getOrGenerateAIResult<T>({
  entityType,
  entityId,
  kind,
  sourceContent,
  generate,
}: AICacheParams<T>): Promise<T> {
  const hash = hashContent(sourceContent);
  const supabase = getSupabaseClient();

  if (!supabase) {
    return generate();
  }

  const { data: cached } = await supabase
    .from("ai_cache")
    .select("result, content_hash")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .eq("kind", kind)
    .maybeSingle();

  if (cached && cached.content_hash === hash) {
    return cached.result as T;
  }

  const result = await generate();

  await supabase.from("ai_cache").upsert(
    {
      entity_type: entityType,
      entity_id: entityId,
      kind,
      content_hash: hash,
      result: result as object,
      generated_at: new Date().toISOString(),
    },
    { onConflict: "entity_type,entity_id,kind" }
  );

  return result;
}
