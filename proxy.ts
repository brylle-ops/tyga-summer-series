import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Keeps the member's sign-in fresh: Supabase sessions expire hourly and are renewed here,
// before pages render (Server Components can't write cookies themselves).
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return response; // not set up yet — screens still work on example data

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, { ...options, httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production" }));
      },
    },
  });
  await supabase.auth.getClaims(); // refreshes the session without a network call when possible
  return response;
}

export const config = {
  // Skip static files, images, the runner bundle and Square's webhook.
  matcher: ["/((?!_next/static|_next/image|img/|runner/|icon.svg|icons/|manifest.webmanifest|api/square|api/members).*)"],
};
