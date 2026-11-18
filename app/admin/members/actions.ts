"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/session";
import { isStaffEmail } from "@/lib/staff";
import { createAdminClient } from "@/lib/supabase/admin";

// Staff: block (kick) or unblock a member. Blocked members can't sign in or use the app and are hidden from the
// leaderboard; their history stays so unblocking restores everything. Staff accounts can't be blocked.
export async function setBlocked(formData: FormData) {
  const me = await getCurrentMember();
  if (me?.profile.role !== "staff") redirect("/home");
  const id = String(formData.get("profile") ?? "");
  const block = formData.get("block") === "1";
  if (!/^[0-9a-f-]{36}$/i.test(id)) redirect("/admin/members");
  const back = `/admin/members/${id}`;
  const db = createAdminClient();
  const { data: p } = await db.from("profiles").select("*").eq("id", id).maybeSingle();
  if (!p) redirect("/admin/members");
  if (block && (p.role === "staff" || isStaffEmail(p.email) || p.id === me.profile.id)) redirect(`${back}?b=staff`);
  const { error } = await db.from("profiles").update({ blocked_at: block ? new Date().toISOString() : null }).eq("id", id);
  if (error) { console.error("[block]", error.message); redirect(`${back}?b=error`); }
  revalidatePath("/admin", "layout"); revalidatePath("/ranks"); revalidatePath("/home");
  redirect(`${back}?b=${block ? "blocked" : "unblocked"}`);
}
