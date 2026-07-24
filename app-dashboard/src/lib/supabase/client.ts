import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

// This app has no authentication layer (no login/signup/session -- deliberately removed
// earlier). It's a single-user local tool, so there's no per-user auth.uid() to scope rows
// to; the tables this client talks to use a permissive RLS policy instead (see the migration
// under supabase/migrations/). One client works for both Client Components and Server
// Components/Route Handlers -- there's no session/cookie state to keep in sync between them.
//
// Returns null (rather than throwing) when Supabase isn't configured yet, so every caller in
// this app can no-op gracefully until NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY are set.

let cached: SupabaseClient | null | undefined;

export function getSupabaseClient(): SupabaseClient | null {
  if (cached !== undefined) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  cached = url && anonKey ? createSupabaseClient(url, anonKey) : null;
  return cached;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
