"use server";

import { redirect } from "next/navigation";
import { getCurrentMember, supabaseReady } from "@/lib/session";
import { isGoal, isSingletLocked, parseSingletInput } from "@/lib/singlet";
import { createClient } from "@/lib/supabase/server";

// Each save runs as the member (RLS-checked), so nobody can change someone else's choices.

async function requireMember(step: string) {
  if (!supabaseReady()) return null; // example mode before Supabase is set up: just move on
  const me = await getCurrentMember();
  if (!me) redirect("/join/sign-in");
  if (isSingletLocked(new Date())) redirect(`${step}?locked=1`);
  return me;
}

export async function saveGoal(formData: FormData) {
  const me = await requireMember("/join/commit");
  if (me) {
    const goal = String(formData.get("goal") ?? "");
    if (!isGoal(goal)) redirect("/join/commit?error=goal");
    const clean = (v: FormDataEntryValue | null) => String(v ?? "").trim().slice(0, 60);
    const first_name = clean(formData.get("first_name")) || me.profile.first_name;
    const last_name = clean(formData.get("last_name")) || me.profile.last_name;
    if (!first_name || !last_name) redirect("/join/commit?error=name");
    const supabase = await createClient();
    const { error } = await supabase.from("profiles").update({ goal, first_name, last_name }).eq("id", me.profile.id);
    if (error) { console.error("[join] saveGoal:", error.message); redirect("/join/commit?error=save"); }
  }
  redirect("/join/singlet");
}

export async function saveSinglet(formData: FormData) {
  const me = await requireMember("/join/singlet");
  if (me) {
    const choice = parseSingletInput(formData);
    if (!choice) redirect("/join/singlet?error=choice");
    const supabase = await createClient();
    const { error } = await supabase.from("registrations")
      .update({ ...choice, updated_at: new Date().toISOString() }).eq("profile_id", me.profile.id);
    if (error) { console.error("[join] saveSinglet:", error.message); redirect("/join/singlet?error=save"); }
    // Paid members can still change their singlet until 30 Nov; the admin order uses the latest choice.
    if (me.registration?.payment_status === "paid") redirect("/join/confirmed");
  }
  redirect("/join/checkout");
}
