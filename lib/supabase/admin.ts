import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { requireEnv } from "@/lib/env";

/** Privileged Supabase client (secret key). Server only — bypasses RLS, so only use it for trusted work. */
export function createAdminClient() {
  return createSupabaseClient(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("SUPABASE_SECRET_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
