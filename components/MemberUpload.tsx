"use client";

import { useActionState } from "react";
import { uploadMemberList, type UploadState } from "@/app/admin/members/actions";

export default function MemberUpload() {
  const [state, action, pending] = useActionState<UploadState, FormData>(uploadMemberList, {});
  return (
    <form action={action} className="li" style={{ gap: 6 }}>
      <input type="file" name="file" accept=".csv,text/csv" className="xs" aria-label="Member list CSV" />
      <button className="mini ghost" type="submit" disabled={pending}>{pending ? "Uploading…" : "Upload member list"}</button>
      {state.message && <span className="xs" role="status">{state.message}</span>}
    </form>
  );
}
