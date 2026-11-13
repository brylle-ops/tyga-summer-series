import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

import type { Profile, Registration } from "@/lib/types";
export type { Profile, Registration };

/** True once the Supabase keys are in .env.local / Vercel. Until then screens show example data. */
export function supabaseReady(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}

/** The signed-in member with their registration, or null if signed out. */
export const getCurrentMember = cache(async function getCurrentMember(): Promise<{ profile: Profile; registration: Registration | null } | null> {
  if (!supabaseReady()) return null;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const [{ data: profile }, { data: registration }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle<Profile>(),
    supabase.from("registrations").select("*").eq("profile_id", user.id).maybeSingle<Registration>(),
  ]);
  if (!profile) return null;
  return { profile, registration: registration ?? null };
});

/** Staff check for admin actions and pages. */
export async function isStaff(): Promise<boolean> {
  const me = await getCurrentMember();
  return me?.profile.role === "staff";
}

/** After a magic-link sign-in: create the profile (members can't insert it themselves). Open to any email;
 *  if the email is on the old gym member list we pre-fill their name and mobile. */
export async function ensureProfile(userId: string, email: string): Promise<boolean> {
  const admin = createAdminClient();
  const e = email.trim().toLowerCase();
  const { data: existing } = await admin.from("profiles").select("id").eq("id", userId).maybeSingle();
  if (existing) {
    await admin.from("profiles").update({ last_seen_at: new Date().toISOString() }).eq("id", userId);
    return true;
  }
  const { data: member } = await admin.from("active_members").select("*").eq("email", e).maybeSingle();
  const { error: profileError } = await admin.from("profiles").insert({
    id: userId, email: e,
    first_name: member?.first_name ?? null, last_name: member?.last_name ?? null, mobile: member?.mobile ?? null,
    last_seen_at: new Date().toISOString(),
  });
  if (profileError && profileError.code !== "23505") {
    console.error("[profile] could not create profile:", profileError.message);
    return false;
  }
  const { error: regError } = await admin.from("registrations").insert({ profile_id: userId });
  if (regError && regError.code !== "23505") console.error("[profile] could not create registration:", regError.message);
  return true;
}
