// The one place the server opens the database. It uses the service key, which bypasses row security, so this file
// is server-only: never import it from a page or component. Returns null when the settings are missing, so routes
// can answer "not configured" and mock mode keeps working.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type Db = SupabaseClient;

let cached: Db | null | undefined;

export function getDb(env: Record<string, string | undefined> = process.env): Db | null {
  if (cached !== undefined) return cached;
  const url = env.SUPABASE_URL?.trim();
  const key = env.SUPABASE_SERVICE_KEY?.trim();
  cached = url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
  return cached;
}
