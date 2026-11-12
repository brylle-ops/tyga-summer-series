import Papa from "papaparse";

export type MemberRow = { email: string; first_name: string; last_name: string; mobile: string };

/** Trim + lower-case; null if it doesn't look like an email (one @, a dot after it, no spaces). */
export function normaliseEmail(raw: string | null | undefined): string | null {
  const e = String(raw ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return null;
  return e;
}

const key = (h: string) => h.toLowerCase().replace(/[\s\-_]/g, "");
const HEADERS: Record<keyof MemberRow, string[]> = {
  email: ["email", "emailaddress"],
  first_name: ["firstname", "first", "givenname"],
  last_name: ["lastname", "surname", "last", "familyname"],
  mobile: ["mobile", "mobilephone", "phone", "cellphone", "mobilenumber"],
};

/** Reads a member list CSV (e.g. exported from Mindbody). Last row wins for duplicate emails. */
export function parseMemberCsv(text: string): { rows: MemberRow[]; skipped: number; error?: string } {
  const clean = text.replace(/^﻿/, "");
  const parsed = Papa.parse<Record<string, string>>(clean, { header: true, skipEmptyLines: true });
  const fields = parsed.meta.fields ?? [];
  const col = (k: keyof MemberRow) => fields.find((f) => HEADERS[k].includes(key(f)));
  const emailCol = col("email");
  if (!emailCol) return { rows: [], skipped: 0, error: "No email column found" };
  const first = col("first_name"), last = col("last_name"), mobile = col("mobile");

  const byEmail = new Map<string, MemberRow>();
  let skipped = 0;
  for (const r of parsed.data) {
    const email = normaliseEmail(r[emailCol]);
    if (!email) { skipped++; continue; }
    byEmail.delete(email); // so the last occurrence keeps its position at the end
    byEmail.set(email, {
      email,
      first_name: (first ? r[first] : "")?.trim() ?? "",
      last_name: (last ? r[last] : "")?.trim() ?? "",
      mobile: (mobile ? r[mobile] : "")?.trim() ?? "",
    });
  }
  return { rows: [...byEmail.values()], skipped };
}

/** Does a Mindbody "Membership Status" count as active? `allowed` is a comma-separated list. */
export function isActiveStatus(status: string | null | undefined, allowed: string): boolean {
  const s = String(status ?? "").trim().toLowerCase();
  if (!s) return false;
  return allowed.split(",").map((a) => a.trim().toLowerCase()).filter(Boolean).includes(s);
}

/** The daily payload the TYG Dashboard script sends: { members: [{ email, first_name, last_name, mobile, status }] }. */
export function parseSyncPayload(body: unknown, allowed: string): { rows: MemberRow[]; skipped: number } | null {
  const list = (body as { members?: unknown } | null)?.members;
  if (!Array.isArray(list)) return null;
  const byEmail = new Map<string, MemberRow>();
  let skipped = 0;
  for (const m of list as Record<string, unknown>[]) {
    if (!isActiveStatus(m?.status as string, allowed)) continue; // not a current member — not counted as skipped
    const email = normaliseEmail(m?.email as string);
    if (!email) { skipped++; continue; }
    byEmail.delete(email);
    byEmail.set(email, {
      email,
      first_name: String(m.first_name ?? "").trim(),
      last_name: String(m.last_name ?? "").trim(),
      mobile: String(m.mobile ?? "").trim(),
    });
  }
  return { rows: [...byEmail.values()], skipped };
}
