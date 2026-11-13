import { redirect } from "next/navigation";
import { getCurrentMember, supabaseReady } from "@/lib/session";

// Admin is staff-only once sign-in is set up.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Never show admin without real sign-in on the live site, even if the database settings are missing.
  if (!supabaseReady() && process.env.NODE_ENV === "production") redirect("/");
  if (supabaseReady()) {
    const me = await getCurrentMember();
    if (!me) redirect("/login");
    if (me.profile.role !== "staff") redirect("/home");
  }
  return children;
}
