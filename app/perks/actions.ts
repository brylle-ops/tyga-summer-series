"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canEnterDraw, canRedeem } from "@/lib/rewards";
import { loadMemberRewards } from "@/lib/rewards-data";
import { requireSeriesMember } from "@/lib/series-data";
import { createAdminClient } from "@/lib/supabase/admin";

// Member actions on weekly rewards. The rules are re-checked here, so a hand-made request can't skip them.

async function context(formData: FormData) {
  const me = await requireSeriesMember();
  if (!me) redirect("/perks");
  const id = Number(formData.get("reward"));
  if (!Number.isInteger(id)) redirect("/perks");
  const view = await loadMemberRewards(me.id);
  const reward = view.rewards.find((r) => r.id === id);
  if (!reward) redirect("/perks");
  return { me, reward, ...view };
}

/** One entry per member, only while the draw is open. */
export async function enterDraw(formData: FormData) {
  const { me, reward, ctx, drawClosed } = await context(formData);
  if (!canEnterDraw(reward, ctx, drawClosed.has(reward.id))) redirect(`/perks?error=closed#r${reward.id}`);
  const { error } = await createAdminClient().from("reward_entries")
    .upsert({ reward_id: reward.id, profile_id: me.id }, { onConflict: "reward_id,profile_id", ignoreDuplicates: true });
  if (error) { console.error("[enter]", error.message); redirect(`/perks?error=save#r${reward.id}`); }
  revalidatePath("/perks");
  redirect(`/perks?done=entered#r${reward.id}`);
}

/** "I've used this": discount and partner rewards only. */
export async function markUsed(formData: FormData) {
  const { me, reward, ctx } = await context(formData);
  if (!canRedeem(reward, ctx)) redirect(`/perks?error=closed#r${reward.id}`);
  const { error } = await createAdminClient().from("reward_redemptions")
    .upsert({ reward_id: reward.id, profile_id: me.id }, { onConflict: "reward_id,profile_id", ignoreDuplicates: true });
  if (error) { console.error("[used]", error.message); redirect(`/perks?error=save#r${reward.id}`); }
  revalidatePath("/perks");
  redirect(`/perks?done=used#r${reward.id}`);
}
