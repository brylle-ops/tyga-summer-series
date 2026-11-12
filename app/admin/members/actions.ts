"use server";

import { revalidatePath } from "next/cache";
import { parseMemberCsv } from "@/lib/members";
import { isStaff } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";

export type UploadState = { ok?: boolean; message?: string };

// Backup for the daily TYG Dashboard sync: staff upload a member list CSV exported from Mindbody.
export async function uploadMemberList(_prev: UploadState, formData: FormData): Promise<UploadState> {
  if (!(await isStaff())) return { ok: false, message: "Only staff can upload the member list." };
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: "Choose a CSV file first." };
  if (file.size > 5_000_000) return { ok: false, message: "That file is too big (over 5 MB)." };

  const { rows, skipped, error } = parseMemberCsv(await file.text());
  if (error) return { ok: false, message: `${error}. Check the file has an Email column.` };
  if (rows.length === 0) return { ok: false, message: "No members with a valid email in that file — nothing changed." };

  const { error: dbError } = await createAdminClient().rpc("replace_active_members", { rows });
  if (dbError) {
    console.error("[members] upload failed:", dbError.message);
    return { ok: false, message: "Couldn't save the list just now — nothing changed. Try again." };
  }
  revalidatePath("/admin");
  return { ok: true, message: `Uploaded ${rows.length} members${skipped ? ` · ${skipped} rows skipped (no valid email)` : ""}` };
}
