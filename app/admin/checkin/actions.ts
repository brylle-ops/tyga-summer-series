"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { seriesDayNow } from "@/lib/series-data";
import { isStaff } from "@/lib/session";
import { isUuid, parseKind, sanitiseSearch } from "@/lib/staff-checkin";
import { createAdminClient } from "@/lib/supabase/admin";

// Staff log a session for a member at the desk. Staff witnessed it, so it is confirmed straight away.
export async function staffLogCheckin(formData: FormData) {
  if (!(await isStaff())) redirect("/home");
  const q = sanitiseSearch(formData.get("q"));
  const back = (m: string) => redirect(`/admin/checkin?m=${m}${q ? `&q=${encodeURIComponent(q)}` : ""}`);
  const profile = formData.get("profile_id");
  const kind = parseKind(formData.get("kind"));
  if (!isUuid(profile) || !kind) return back("error");
  // Never overwrite an existing row: a pending or rejected Yard session is settled with Approve/Reject instead.
  const { data, error } = await createAdminClient().from("checkins").upsert(
    { profile_id: profile, day: seriesDayNow(), kind, status: "confirmed" },
    { onConflict: "profile_id,day,kind", ignoreDuplicates: true },
  ).select("id");
  if (error) { console.error("[staff checkin]", error.message); return back("error"); }
  if (!data || data.length === 0) return back("exists");
  revalidatePath("/admin"); revalidatePath("/admin/checkin"); revalidatePath("/home");
  return back("logged");
}
