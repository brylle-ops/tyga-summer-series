"use server";

import { redirect } from "next/navigation";
import { normaliseEmail } from "@/lib/members";
import { ensureProfile, supabaseReady } from "@/lib/session";
import { normaliseCode, safeNext } from "@/lib/signin";
import { loginRequestBlocked, loginVerifyBlocked, recordLoginEvent } from "@/lib/ratelimit";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { message?: string; email?: string; sent?: boolean };

const isRateLimit = (e: { status?: number; message: string }) =>
  e.status === 429 || /rate limit|security purposes|only request this after/i.test(e.message);

// Step 1 — open to any email: send a code (new emails get an account when they enter it).
export async function requestLoginLink(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const raw = String(formData.get("email") ?? "");
  if (!supabaseReady()) return { email: raw, message: "Sign-in isn't set up yet." };
  const email = normaliseEmail(raw);
  if (!email) return { email: raw, message: "Please enter a valid email." };

  if (await loginRequestBlocked(email)) return { email, message: "Too many tries. Please wait a few minutes and try again." };
  await recordLoginEvent(email, true);
  const { error } = await (await createClient()).auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
  if (error) {
    console.error("[login] could not send code:", error.message);
    if (isRateLimit(error)) return { email, sent: true, message: "A code was sent a moment ago. Use the newest one in your inbox." };
    return { email: raw, message: "We couldn't send the code just now. Please try again in a minute." };
  }
  return { email, sent: true };
}

// Step 2 — check the code, create the profile if new, carry on.
export async function verifyLoginCode(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = normaliseEmail(String(formData.get("email") ?? ""));
  if (!email) return { message: "Please start again with your email." };
  const token = normaliseCode(String(formData.get("code") ?? ""));
  if (!token) return { email, sent: true, message: "Enter the code from your email." };

  if (await loginVerifyBlocked(email)) return { email, sent: true, message: "Too many wrong codes. Please wait 10 minutes, then request a new code." };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  if (error || !data.user) {
    console.error("[login] code not accepted:", error?.message);
    await recordLoginEvent(email, false);
    return { email, sent: true, message: "That code didn't work. It may have expired — check for the newest email, or go back and send a new one." };
  }
  if (!(await ensureProfile(data.user.id, email))) {
    return { email, sent: true, message: "We couldn't set up your account just now. Please try again." };
  }
  redirect(safeNext(String(formData.get("next") ?? ""), "/home"));
}

// Log out: end the session on this device and go back to the Welcome screen.
export async function signOut() {
  if (supabaseReady()) await (await createClient()).auth.signOut();
  redirect("/");
}
