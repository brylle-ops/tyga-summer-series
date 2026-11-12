import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

import type { Profile, Registration } from "@/lib/types";
export type { Profile, Registration };

/** True once the Supabase keys are in .env.local / Vercel. Until then screens show example data. */
export function supabaseReady(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}

/** The signed-in member with their registration, or null if signed out. */
export async function getCurrentMember(): Promise<{ profile: Profile; registration: Registration | null } | null> {
  if (!supabaseReady()) return null;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle<Profile>();
  if (!profile) return null;
  const { data: registration } = await supabase.from("registrations").select("*").eq("profile_id", user.id).maybeSingle<Registration>();
  return { profile, registration: registration ?? null };
}

/** Staff check for admin actions and pages. */
export async function isStaff(): Promise<boolean> {
  const me = await getCurrentMember();
  return me?.profile.role === "staff";
}

/** After a magic-link sign-in: create the profile (members can't insert it themselves) from the member list.
 *  Returns false for someone who isn't on the list — the member check runs here too, because anyone can ask
 *  Supabase's public sign-in API for a link directly, skipping our sign-in screen. */
export async function ensureProfile(userId: string, email: string): Promise<boolean> {
  const admin = createAdminClient();
  const e = email.trim().toLowerCase();
  const { data: existing } = await admin.from("profiles").select("id").eq("id", userId).maybeSingle();
  if (existing) {
    await admin.from("profiles").update({ last_seen_at: new Date().toISOString() }).eq("id", userId);
    return true;
  }
  const { data: member } = await admin.from("active_members").select("*").eq("email", e).maybeSingle();
  if (!member && process.env.ALLOW_NON_MEMBERS !== "true") return false;
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
