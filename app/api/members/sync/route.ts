import { timingSafeEqual } from "node:crypto";
import { parseSyncPayload } from "@/lib/members";
import { createAdminClient } from "@/lib/supabase/admin";

// Daily member list from the TYG Dashboard's Mindbody import (Apps Script → POST here).
// Auth: "Authorization: Bearer <MEMBER_SYNC_SECRET>". Replaces the whole list in one transaction.
export async function POST(req: Request) {
  const secret = process.env.MEMBER_SYNC_SECRET;
  const sent = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!secret || secret.length < 24 || !safeEqual(sent, secret)) return Response.json({ error: "unauthorised" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = parseSyncPayload(body, process.env.ACTIVE_MEMBER_STATUSES || "active");
  if (!parsed) return Response.json({ error: "expected { members: [...] }" }, { status: 400 });
  // Guard against a broken import wiping everyone: never replace the list with nothing.
  if (parsed.rows.length === 0) return Response.json({ error: "no active members in payload — list unchanged" }, { status: 422 });

  const { error } = await createAdminClient().rpc("replace_active_members", { rows: parsed.rows });
  if (error) {
    console.error("[members/sync] failed:", error.message);
    return Response.json({ error: "database error — list unchanged" }, { status: 500 });
  }
  return Response.json({ ok: true, active: parsed.rows.length, skipped: parsed.skipped });
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
