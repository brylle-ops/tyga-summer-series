import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requireEnv } from "@/lib/env";

/** Supabase client acting as the signed-in member (publishable key + their session cookie). RLS applies. */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"), {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, { ...options, httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production" }));
        } catch {
          // Called from a Server Component: cookies can't be written there. proxy.ts refreshes the session instead.
        }
      },
    },
  });
}
