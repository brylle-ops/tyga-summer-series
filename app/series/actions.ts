"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSeriesMember, seriesWeekNow } from "@/lib/series-data";
import { alburyDay, type CheckinKind } from "@/lib/series";
import { isStaff } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";

const KINDS: CheckinKind[] = ["yard", "run", "workout", "recovery", "rest"];

// All writes go through here (members have read-only database access), so the rules can't be skipped.

export async function logCheckin(formData: FormData) {
  const me = await requireSeriesMember();
  if (!me) redirect("/log?example=1");
  const kind = String(formData.get("kind")) as CheckinKind;
  if (!KINDS.includes(kind)) redirect("/log?error=kind");
  if (seriesWeekNow() < 1) redirect("/log?error=early");
  const { error } = await createAdminClient().from("checkins").upsert(
    { profile_id: me.id, day: alburyDay(new Date()), kind, status: kind === "yard" ? "pending" : "confirmed" },
    { onConflict: "profile_id,day,kind", ignoreDuplicates: true },
  );
  if (error) { console.error("[log]", error.message); redirect("/log?error=save"); }
  revalidatePath("/home");
  redirect(`/log?done=${kind}`);
}

export async function completeMission(formData: FormData) {
  const me = await requireSeriesMember();
  if (!me) redirect("/missions");
  const id = Number(formData.get("mission"));
  const db = createAdminClient();
  const { data: m } = await db.from("missions").select("week, is_secret, reveal_at").eq("id", id).maybeSingle();
  const revealed = !m?.is_secret || (m.reveal_at && Date.parse(m.reveal_at) <= Date.now());
  // Only this week's missions can be ticked off — no catching up on old weeks, no peeking ahead.
  if (!m || m.week !== seriesWeekNow() || !revealed) redirect("/missions?error=closed");
  await db.from("mission_completions").upsert({ profile_id: me.id, mission_id: id }, { ignoreDuplicates: true });
  revalidatePath("/missions"); revalidatePath("/home");
  redirect("/missions");
}

export async function setHoliday(formData: FormData) {
  const me = await requireSeriesMember();
  if (!me) redirect("/holiday");
  const until = String(formData.get("until") ?? "");
  const today = alburyDay(new Date());
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(until) && until >= today && until <= "2027-01-31";
  if (until && !valid) redirect("/holiday?error=date");
  await createAdminClient().from("profiles").update({ holiday_until: until || null }).eq("id", me.id);
  revalidatePath("/holiday");
  redirect("/holiday");
}

// ---- staff ----

export async function reviewCheckin(formData: FormData) {
  if (!(await isStaff())) redirect("/home");
  const status = formData.get("decision") === "approve" ? "confirmed" : "rejected";
  await createAdminClient().from("checkins").update({ status }).eq("id", Number(formData.get("id"))).eq("status", "pending");
  revalidatePath("/admin");
}

export async function addMission(formData: FormData) {
  if (!(await isStaff())) redirect("/home");
  const week = Number(formData.get("week"));
  const points = Number(formData.get("points") || 10);
  const title = String(formData.get("title") ?? "").trim().slice(0, 80);
  const detail = String(formData.get("detail") ?? "").trim().slice(0, 140);
  if (!title || !(week >= 1 && week <= 7) || !(points >= 0 && points <= 100)) redirect("/admin?mission=invalid");
  // A week that has already started can't be changed underneath members.
  if (week <= seriesWeekNow()) redirect("/admin?mission=live");
  await createAdminClient().from("missions").insert({
    week, title, detail, points, double: formData.get("double") === "on",
  });
  revalidatePath("/admin");
  redirect("/admin?mission=added");
}
