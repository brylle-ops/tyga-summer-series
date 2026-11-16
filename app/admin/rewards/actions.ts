"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { rankWeek, type Reward, type RewardKind } from "@/lib/rewards";
import { loadRewards, weekScores } from "@/lib/rewards-data";
import { isStaff } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";

// Staff-only reward controls. Every action re-checks staff, and re-derives winners on the server.
const KINDS: RewardKind[] = ["leaderboard", "draw", "discount", "partner", "finale"];
const UUID = /^[0-9a-f-]{36}$/i;
const back = (msg: string, id?: number) => redirect(`/admin/rewards?m=${msg}${id ? `#r${id}` : ""}`);

async function staffOnly() {
  if (!(await isStaff())) redirect("/home");
}
const text = (f: FormData, k: string, max: number) => String(f.get(k) ?? "").trim().slice(0, max);

function fields(f: FormData) {
  const expires = text(f, "expires_on", 10);
  const image = text(f, "image_url", 500);
  const winners = Number(f.get("winners_count") || 1);
  if (expires && !/^\d{4}-\d{2}-\d{2}$/.test(expires)) return null;
  if (image && !/^https:\/\//i.test(image)) return null;
  if (!Number.isInteger(winners) || winners < 1 || winners > 50) return null;
  return {
    title: text(f, "title", 80), partner: text(f, "partner", 80), description: text(f, "description", 300),
    eligibility: text(f, "eligibility", 300), how_to: text(f, "how_to", 300), code: text(f, "code", 40) || null,
    image_url: image || null, expires_on: expires || null, winners_count: winners, published: f.get("published") === "on",
  };
}

export async function saveReward(formData: FormData) {
  await staffOnly();
  const id = Number(formData.get("id"));
  const data = fields(formData);
  if (!Number.isInteger(id) || !data || !data.title) return back("invalid", Number.isInteger(id) ? id : undefined);
  const { error } = await createAdminClient().from("rewards").update(data).eq("id", id);
  if (error) { console.error("[reward save]", error.message); return back("error", id); }
  revalidatePath("/admin/rewards"); revalidatePath("/perks");
  return back("saved", id);
}

export async function addReward(formData: FormData) {
  await staffOnly();
  const week = Number(formData.get("week"));
  const kind = String(formData.get("kind")) as RewardKind;
  const data = fields(formData);
  if (!(week >= 1 && week <= 7) || !KINDS.includes(kind) || !data || !data.title) return back("invalid");
  const { error } = await createAdminClient().from("rewards").insert({ ...data, week, kind, published: false });
  if (error) { console.error("[reward add]", error.message); return back("error"); }
  revalidatePath("/admin/rewards");
  return back("added");
}

/** Leaderboard prize: staff tick the verified winners; the server checks they really are ranked that week. */
export async function confirmWinners(formData: FormData) {
  await staffOnly();
  const id = Number(formData.get("id"));
  const reward = (await loadRewards()).find((r) => r.id === id);
  if (!reward || reward.kind !== "leaderboard") return back("invalid");
  const ids = [...new Set(formData.getAll("ids").map(String))].filter((x) => UUID.test(x));
  const ranked = new Set(rankWeek(await weekScores(reward.week), 1000).rows.map((r) => r.id));
  if (ids.length === 0 || ids.length > reward.winners_count || ids.some((x) => !ranked.has(x))) return back("winners", id);
  const { error } = await createAdminClient().from("reward_winners")
    .upsert(ids.map((profile_id) => ({ reward_id: id, profile_id, announced: true })), { onConflict: "reward_id,profile_id", ignoreDuplicates: true });
  if (error) { console.error("[winners]", error.message); return back("error", id); }
  revalidatePath("/admin/rewards"); revalidatePath("/perks"); revalidatePath("/home");
  return back("winners-ok", id);
}

/** Prize draw: pick one entrant at random (crypto-random), announce straight away. */
export async function drawWinner(formData: FormData) {
  await staffOnly();
  const id = Number(formData.get("id"));
  const reward: Reward | undefined = (await loadRewards()).find((r) => r.id === id);
  if (!reward || reward.kind !== "draw") return back("invalid");
  const db = createAdminClient();
  const [{ data: entries }, { data: won }] = await Promise.all([
    db.from("reward_entries").select("profile_id").eq("reward_id", id),
    db.from("reward_winners").select("profile_id").eq("reward_id", id),
  ]);
  if ((won ?? []).length >= reward.winners_count) return back("drawn", id);
  const taken = new Set((won ?? []).map((w) => w.profile_id as string));
  const pool = (entries ?? []).map((e) => e.profile_id as string).filter((p) => !taken.has(p));
  if (pool.length === 0) return back("noentries", id);
  const pick = pool[randomInt(pool.length)];
  const { error } = await db.from("reward_winners").insert({ reward_id: id, profile_id: pick, announced: true });
  if (error) { console.error("[draw]", error.message); return back("error", id); }
  revalidatePath("/admin/rewards"); revalidatePath("/perks"); revalidatePath("/home");
  return back("drawn-ok", id);
}

export async function markCollected(formData: FormData) {
  await staffOnly();
  const id = Number(formData.get("id"));
  const profile = String(formData.get("profile") ?? "");
  if (!Number.isInteger(id) || !UUID.test(profile)) return back("invalid");
  await createAdminClient().from("reward_winners").update({ collected_at: new Date().toISOString() }).eq("reward_id", id).eq("profile_id", profile);
  revalidatePath("/admin/rewards"); revalidatePath("/perks");
  return back("collected", id);
}

export async function removeWinner(formData: FormData) {
  await staffOnly();
  const id = Number(formData.get("id"));
  const profile = String(formData.get("profile") ?? "");
  if (!Number.isInteger(id) || !UUID.test(profile)) return back("invalid");
  await createAdminClient().from("reward_winners").delete().eq("reward_id", id).eq("profile_id", profile);
  revalidatePath("/admin/rewards"); revalidatePath("/perks"); revalidatePath("/home");
  return back("removed", id);
}
