"use server";

import { redirect } from "next/navigation";
import { siteUrl } from "@/lib/env";
import { NON_MEMBER_MESSAGE, checkMembership, safeNext } from "@/lib/signin";
import { supabaseReady } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type SignInState = { message?: string; email?: string };

// "Send my sign-in link": check the member list, then email a one-time sign-in link.
export async function requestSignInLink(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const raw = String(formData.get("email") ?? "");
  if (!supabaseReady()) return { email: raw, message: "Sign-in isn't set up yet — add the Supabase keys (see README)." };

  const admin = createAdminClient();
  const result = await checkMembership(
    raw,
    async (email) => (await admin.from("active_members").select("*").eq("email", email).maybeSingle()).data,
    { allowNonMembers: process.env.ALLOW_NON_MEMBERS === "true" },
  );
  if (result.status === "invalid") return { email: raw, message: "Please enter a valid email." };

  const email = result.status === "member" ? result.member.email : result.email;
  await admin.from("signin_attempts").insert({ email, found: result.status === "member" });
  if (result.status === "not_member") return { email: raw, message: NON_MEMBER_MESSAGE };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${siteUrl()}/auth/confirm?next=${encodeURIComponent(safeNext(String(formData.get("next") ?? ""), "/join/commit"))}`, shouldCreateUser: true },
  });
  if (error) {
    console.error("[sign-in] could not send link:", error.message);
    // Too many emails (per person or per hour): a link was sent recently — point them to it.
    if (error.status === 429 || /rate limit|security purposes|only request this after/i.test(error.message)) {
      redirect("/join/check-email?already=1");
    }
    return { email: raw, message: "We couldn't send the link just now — please try again in a minute." };
  }
  redirect("/join/check-email");
}

// "Continue with Google": Supabase sends them to Google and back to /auth/confirm.
export async function signInWithGoogle(formData: FormData) {
  if (!supabaseReady()) redirect("/login?error=setup");
  const next = safeNext(String(formData.get("next") ?? ""), "/home");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${siteUrl()}/auth/confirm?next=${encodeURIComponent(next)}` },
  });
  if (error || !data.url) {
    console.error("[google] could not start sign-in:", error?.message);
    redirect("/login?error=google");
  }
  redirect(data.url);
}
