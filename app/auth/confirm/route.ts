import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { ensureProfile } from "@/lib/session";
import { safeNext } from "@/lib/signin";
import { createClient } from "@/lib/supabase/server";

// The link in the sign-in email lands here: verify it, create the member's profile, carry on joining.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = (searchParams.get("type") ?? "email") as EmailOtpType;
  const next = safeNext(searchParams.get("next"));

  const code = searchParams.get("code");
  if (tokenHash || code) {
    const supabase = await createClient();
    // Custom email template sends token_hash; Supabase's default template sends a one-time code.
    const { data, error } = tokenHash
      ? await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
      : await supabase.auth.exchangeCodeForSession(code!);
    if (!error && data.user?.email) {
      if (await ensureProfile(data.user.id, data.user.email)) return NextResponse.redirect(new URL(next, request.url));
      await supabase.auth.signOut(); // not on the member list
      return NextResponse.redirect(new URL("/join/check-email?not_member=1", request.url));
    }
  }
  return NextResponse.redirect(new URL("/join/check-email?expired=1", request.url));
}
