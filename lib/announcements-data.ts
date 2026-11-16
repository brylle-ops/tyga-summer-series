import type { Announcement } from "@/lib/announcements";
import { createAdminClient } from "@/lib/supabase/admin";

/** Latest announcements, newest first. Returns [] (and logs) if the table is missing or Supabase is not configured. */
export async function loadAnnouncements(limit = 5): Promise<Announcement[]> {
  try {
    const { data, error } = await createAdminClient()
      .from("announcements").select("id, title, body, created_at").order("created_at", { ascending: false }).limit(limit);
    if (error) { console.error("[announcements]", error.message); return []; }
    return (data ?? []) as Announcement[];
  } catch (e) {
    console.error("[announcements]", e instanceof Error ? e.message : e);
    return [];
  }
}
