"use server";

import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { ensureProfile } from "@/lib/session";
import { safeNext } from "@/lib/signin";
import { createClient } from "@/lib/supabase/server";

const TYPES: EmailOtpType[] = ["email", "magiclink", "signup", "invite", "recovery", "email_change"];

// Runs only when the member taps "Continue", so link scanners can't use up the one-time token.
export async function confirmLink(formData: FormData) {
  const tokenHash = String(formData.get("token_hash") ?? "");
  const t = String(formData.get("type") ?? "email") as EmailOtpType;
  const type = TYPES.includes(t) ? t : "email";
  const next = safeNext(String(formData.get("next") ?? ""));
  if (!tokenHash) redirect("/join/check-email?expired=1");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
  if (error || !data.user?.email) {
    console.error("[confirm] link not accepted:", error?.message);
    redirect("/join/check-email?expired=1");
  }
  if (!(await ensureProfile(data.user.id, data.user.email))) {
    await supabase.auth.signOut(); // not on the member list
    redirect("/join/check-email?not_member=1");
  }
  redirect(next);
}
