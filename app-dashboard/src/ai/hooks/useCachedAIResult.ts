"use client";

import { useEffect, useState } from "react";
import { getOrGenerateAIResult } from "@/ai/services/AICache";

interface UseCachedAIResultParams<T> {
  entityType: string;
  entityId: string;
  kind: string;
  sourceContent: string;
  generate: () => Promise<T>;
  /** Skip fetching entirely, e.g. while dependent data hasn't loaded yet. */
  enabled?: boolean;
}

/** Shared client-side pattern for "fetch-or-generate an AI result, cached by content hash" --
 *  used by the Daily Brief, Project status summaries, Habit insights, and Nutrition estimates
 *  so each of those widgets doesn't re-implement the same effect/loading/error plumbing. */
export function useCachedAIResult<T>({
  entityType,
  entityId,
  kind,
  sourceContent,
  generate,
  enabled = true,
}: UseCachedAIResultParams<T>) {
  const [result, setResult] = useState<T | null>(null);
  const [state, setState] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    // Resets to "loading" whenever the cache key changes (new entity/content) -- a standard
    // data-fetching reset, not an unintended render loop.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState("loading");

    getOrGenerateAIResult({ entityType, entityId, kind, sourceContent, generate })
      .then((r) => {
        if (!cancelled) {
          setResult(r);
          setState("done");
        }
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });

    return () => {
      cancelled = true;
    };
    // sourceContent is the actual change-detection signal; generate is re-created per render
    // by design (it closes over fresh data) so it's deliberately excluded here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, entityId, kind, sourceContent, enabled]);

  return { result, state };
}
