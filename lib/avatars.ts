import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/** Short-lived links to members' optional profile photos (private "avatars" bucket), keyed by profile id. */
export async function avatarUrls(ids: string[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return out;
  const db = createAdminClient();
  // select("*") so this still works before migration 0008 adds avatar_path (then there are simply no photos).
  const { data, error } = await db.from("profiles").select("*").in("id", unique);
  if (error) { console.error("[avatars]", error.message); return out; }
  const rows = (data ?? []).filter((p) => p.avatar_path) as { id: string; avatar_path: string }[];
  if (rows.length === 0) return out;
  const signed = await db.storage.from("avatars").createSignedUrls(rows.map((r) => r.avatar_path), 3600);
  if (signed.error) { console.error("[avatar urls]", signed.error.message); return out; }
  const byPath = new Map((signed.data ?? []).map((s) => [s.path, s.signedUrl]));
  for (const r of rows) { const u = byPath.get(r.avatar_path); if (u) out.set(r.id, u); }
  return out;
}
