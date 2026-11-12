"use server";

import { redirect } from "next/navigation";
import { siteUrl } from "@/lib/env";
import { normaliseEmail } from "@/lib/members";
import { safeNext } from "@/lib/signin";
import { supabaseReady } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { message?: string; email?: string };

// Open to any email: one link signs in returning members and creates an account for new ones.
export async function requestLoginLink(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const raw = String(formData.get("email") ?? "");
  if (!supabaseReady()) return { email: raw, message: "Sign-in isn't set up yet." };
  const email = normaliseEmail(raw);
  if (!email) return { email: raw, message: "Please enter a valid email." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${siteUrl()}/auth/confirm?next=${encodeURIComponent(safeNext(String(formData.get("next") ?? ""), "/home"))}`, shouldCreateUser: true },
  });
  if (error) {
    console.error("[login] could not send link:", error.message);
    if (error.status === 429 || /rate limit|security purposes|only request this after/i.test(error.message)) {
      redirect("/join/check-email?already=1");
    }
    return { email: raw, message: "We couldn't send the link just now — please try again in a minute." };
  }
  redirect("/join/check-email");
}
