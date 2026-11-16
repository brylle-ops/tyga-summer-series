import type { CheckinKind } from "@/lib/series";

export const STAFF_KINDS: CheckinKind[] = ["yard", "run", "workout", "recovery", "rest"];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Makes staff search text safe to drop into a Supabase filter: strips filter syntax and wildcards, caps at 40. */
export function sanitiseSearch(raw: unknown): string {
  return String(raw ?? "")
    .replace(/[,()%*\\"'`]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40)
    .trim();
}

/** The `.or()` filter for a name/email search, or null when there is nothing safe to search for. */
export function memberSearchFilter(raw: unknown): string | null {
  const q = sanitiseSearch(raw);
  if (!q) return null;
  return `first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`;
}

export const isUuid = (v: unknown): v is string => typeof v === "string" && UUID.test(v);
export const parseKind = (v: unknown): CheckinKind | null => (STAFF_KINDS as string[]).includes(String(v)) ? (String(v) as CheckinKind) : null;

