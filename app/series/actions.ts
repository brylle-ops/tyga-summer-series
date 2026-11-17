"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { IMAGE_CONTENT_TYPE } from "@/lib/image-sniff";
import { validateProof, verifiedProofType } from "@/lib/proof";
import { redirect } from "next/navigation";
import { requireSeriesMember, seriesDayNow, seriesWeekNow } from "@/lib/series-data";
import type { CheckinKind } from "@/lib/series";
import { PERKS } from "@/lib/perks";
import { isStaff } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";

const KINDS: CheckinKind[] = ["yard", "run", "workout", "recovery", "rest"];

// All writes go through here (members have read-only database access), so the rules can't be skipped.

export async function logCheckin(formData: FormData) {
  const me = await requireSeriesMember();
  if (!me) redirect("/log?example=1");
  // One or more activities can be logged together; unknown values are dropped, repeats are ignored.
  const kinds = [...new Set(formData.getAll("kind").map(String))].filter((k): k is CheckinKind => (KINDS as string[]).includes(k));
  if (kinds.length === 0) redirect("/log?error=kind");
  if (seriesWeekNow() < 1) redirect("/log?error=early");
  const day = seriesDayNow();
  const { error } = await createAdminClient().from("checkins").upsert(
    kinds.map((kind) => ({ profile_id: me.id, day, kind, status: kind === "yard" ? "pending" : "confirmed" })),
    { onConflict: "profile_id,day,kind", ignoreDuplicates: true },
  );
  if (error) { console.error("[log]", error.message); redirect("/log?error=save"); }
  revalidatePath("/home");
  redirect(`/log?done=${kinds.join(",")}`);
}

/** Uploads to a PRIVATE bucket ("proofs" or "avatars", created on first use). Returns the path, or null on failure. */
async function uploadProof(db: ReturnType<typeof createAdminClient>, path: string, bytes: Buffer, contentType: string, bucket = "proofs"): Promise<string | null> {
  const storage = db.storage;
  let { error } = await storage.from(bucket).upload(path, bytes, { contentType, upsert: false });
  if (error && /not found|bucket/i.test(error.message)) {
    const made = await storage.createBucket(bucket, { public: false });
    if (made.error && !/already exists/i.test(made.error.message)) { console.error("[proof bucket]", made.error.message); return null; }
    ({ error } = await storage.from(bucket).upload(path, bytes, { contentType, upsert: false }));
  }
  if (error) { console.error("[proof upload]", error.message); return null; }
  return path;
}

export async function completeMission(formData: FormData) {
  const me = await requireSeriesMember();
  if (!me) redirect("/missions");
  const id = Number(formData.get("mission"));
  if (!Number.isInteger(id)) redirect("/missions?error=closed");
  const db = createAdminClient();
  const { data: m } = await db.from("missions").select("week, is_secret, reveal_at").eq("id", id).maybeSingle();
  const revealed = !m?.is_secret || (m.reveal_at && Date.parse(m.reveal_at) <= Date.now());
  // Only this week's missions can be ticked off — no catching up on old weeks, no peeking ahead.
  if (!m || m.week !== seriesWeekNow() || !revealed) redirect("/missions?error=closed");
  // Optional proof photo: validated by declared type/size, then by the real file bytes.
  const file = formData.get("proof");
  let proofPath: string | null = null;
  if (file instanceof File && file.size > 0) {
    const bad = validateProof(file);
    if (bad) redirect(`/missions/${id}?error=photo`);
    const bytes = Buffer.from(await file.arrayBuffer());
    const ext = verifiedProofType(file.type, bytes);
    if (!ext) redirect(`/missions/${id}?error=photo`);
    const { data: already } = await db.from("mission_completions").select("mission_id").eq("profile_id", me.id).eq("mission_id", id).maybeSingle();
    if (!already) proofPath = await uploadProof(db, `${me.id}/${id}-${randomUUID()}.${ext}`, bytes, IMAGE_CONTENT_TYPE[ext]);
  }
  // New ticks wait for staff approval before their points count.
  let { error } = await db.from("mission_completions").upsert(
    { profile_id: me.id, mission_id: id, status: "pending", ...(proofPath ? { proof_path: proofPath } : {}) }, { ignoreDuplicates: true });
  if (error && /status/i.test(error.message)) {
    // Migration 0008 not run yet: fall back to the old behaviour (counts straight away).
    console.error("[mission status]", error.message);
    ({ error } = await db.from("mission_completions").upsert(
      { profile_id: me.id, mission_id: id, ...(proofPath ? { proof_path: proofPath } : {}) }, { ignoreDuplicates: true }));
  }
  if (error && proofPath) {
    // The proof_path column may not exist yet (migration 0007 not run): complete without the photo.
    console.error("[mission proof]", error.message);
    await db.storage.from("proofs").remove([proofPath]);
    ({ error } = await db.from("mission_completions").upsert({ profile_id: me.id, mission_id: id }, { ignoreDuplicates: true }));
  }
  if (error) { console.error("[mission]", error.message); redirect("/missions?error=closed"); }
  revalidatePath("/missions"); revalidatePath("/home");
  redirect("/missions");
}

// Staff: remove a wrong or fake completion (and its photo) so it stops counting.
export async function revokeCompletion(formData: FormData) {
  if (!(await isStaff())) redirect("/home");
  const profile = String(formData.get("profile") ?? "");
  const mission = Number(formData.get("mission"));
  if (!/^[0-9a-f-]{36}$/i.test(profile) || !Number.isInteger(mission)) redirect("/admin/missions?m=error");
  const db = createAdminClient();
  const { data: row, error: readErr } = await db.from("mission_completions").select("proof_path").eq("profile_id", profile).eq("mission_id", mission).maybeSingle();
  if (readErr) console.error("[revoke read]", readErr.message);
  const { error } = await db.from("mission_completions").delete().eq("profile_id", profile).eq("mission_id", mission);
  if (error) { console.error("[revoke]", error.message); redirect("/admin/missions?m=error"); }
  const path = (row as { proof_path?: string | null } | null)?.proof_path;
  if (path) {
    const rm = await db.storage.from("proofs").remove([path]);
    if (rm.error) console.error("[revoke file]", rm.error.message);
  }
  revalidatePath("/admin/missions"); revalidatePath("/admin"); revalidatePath("/missions"); revalidatePath("/home");
  redirect("/admin/missions?m=revoked");
}

// Staff: approve one pending mission tick so its points count.
export async function approveCompletion(formData: FormData) {
  if (!(await isStaff())) redirect("/home");
  const profile = String(formData.get("profile") ?? "");
  const mission = Number(formData.get("mission"));
  if (!/^[0-9a-f-]{36}$/i.test(profile) || !Number.isInteger(mission)) redirect("/admin/missions?m=error");
  const { error } = await createAdminClient().from("mission_completions").update({ status: "confirmed" })
    .eq("profile_id", profile).eq("mission_id", mission).eq("status", "pending");
  if (error) { console.error("[approve]", error.message); redirect("/admin/missions?m=error"); }
  revalidatePath("/admin/missions"); revalidatePath("/admin"); revalidatePath("/missions"); revalidatePath("/home");
  redirect("/admin/missions?m=approved");
}

// Staff: approve every pending mission tick at once (busy days).
export async function approveAllCompletions() {
  if (!(await isStaff())) redirect("/home");
  const { error } = await createAdminClient().from("mission_completions").update({ status: "confirmed" }).eq("status", "pending");
  if (error) { console.error("[approve all]", error.message); redirect("/admin/missions?m=error"); }
  revalidatePath("/admin/missions"); revalidatePath("/admin"); revalidatePath("/missions"); revalidatePath("/home");
  redirect("/admin/missions?m=approved");
}

// Member: add or replace their own optional profile photo (private "avatars" bucket).
export async function setAvatar(formData: FormData) {
  const me = await requireSeriesMember();
  const back = "/more";
  if (!me) redirect("/login");
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0 || validateProof(file)) redirect(`${back}?photo=bad`);
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = verifiedProofType(file.type, bytes);
  if (!ext) redirect(`${back}?photo=bad`);
  const db = createAdminClient();
  const path = await uploadProof(db, `${me.id}/${randomUUID()}.${ext}`, bytes, IMAGE_CONTENT_TYPE[ext], "avatars");
  if (!path) redirect(`${back}?photo=error`);
  const { data: old } = await db.from("profiles").select("avatar_path").eq("id", me.id).maybeSingle();
  const { error } = await db.from("profiles").update({ avatar_path: path }).eq("id", me.id);
  if (error) { console.error("[avatar]", error.message); await db.storage.from("avatars").remove([path]); redirect(`${back}?photo=error`); }
  const prev = (old as { avatar_path?: string | null } | null)?.avatar_path;
  if (prev) await db.storage.from("avatars").remove([prev]);
  revalidatePath("/more"); revalidatePath("/home"); revalidatePath("/ranks"); revalidatePath("/admin", "layout");
  redirect("/more?photo=saved");
}

export async function setHoliday(formData: FormData) {
  const me = await requireSeriesMember();
  if (!me) redirect("/holiday");
  const until = String(formData.get("until") ?? "");
  const today = seriesDayNow();
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(until) && until >= today && until <= "2027-01-31";
  if (until && !valid) redirect("/holiday?error=date");
  const { error } = await createAdminClient().from("profiles").update({ holiday_until: until || null }).eq("id", me.id);
  if (error) { console.error("[holiday]", error.message); redirect("/holiday?error=date"); }
  revalidatePath("/holiday");
  redirect("/holiday");
}

// ---- staff ----

export async function reviewCheckin(formData: FormData) {
  if (!(await isStaff())) redirect("/home");
  const status = formData.get("decision") === "approve" ? "confirmed" : "rejected";
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;
  await createAdminClient().from("checkins").update({ status }).eq("id", id).eq("status", "pending");
  revalidatePath("/admin"); revalidatePath("/admin/checkin"); revalidatePath("/home");
}

export async function addMission(formData: FormData) {
  if (!(await isStaff())) redirect("/home");
  const week = Number(formData.get("week"));
  const points = Number(formData.get("points") || 10);
  const title = String(formData.get("title") ?? "").trim().slice(0, 80);
  const detail = String(formData.get("detail") ?? "").trim().slice(0, 140);
  if (!title || !(week >= 1 && week <= 7) || !(points >= 0 && points <= 100)) redirect("/admin/missions?m=invalid");
  // A week that has already started can't be changed underneath members.
  if (week <= seriesWeekNow()) redirect("/admin/missions?m=live");
  await createAdminClient().from("missions").insert({
    week, title, detail, points, double: formData.get("double") === "on",
  });
  revalidatePath("/admin");
  redirect("/admin/missions?m=added");
}

// Staff: mark a member's perk as handed over (stops it showing as "to hand out").
export async function redeemPerk(formData: FormData) {
  if (!(await isStaff())) redirect("/home");
  const profile = String(formData.get("profile") ?? "");
  const perk = String(formData.get("perk") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(profile) || !PERKS.some((p) => p.key === perk)) return;
  const { error } = await createAdminClient().from("perk_redemptions")
    .upsert({ profile_id: profile, perk_key: perk }, { onConflict: "profile_id,perk_key", ignoreDuplicates: true });
  if (error) console.error("[redeem]", error.message);
  revalidatePath("/admin/leaderboard");
}
