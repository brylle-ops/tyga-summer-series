// Who has gone quiet? Pure logic (no database) so it can be tested. Days are Albury dates, YYYY-MM-DD.
import { alburyDay } from "@/lib/series";

export const SERIES_START_DAY = "2026-12-07"; // Albury date the Series begins

export const QUIET_AFTER_DAYS = 7; // quiet = last session was MORE than 7 days ago
export const NEW_MEMBER_GRACE_DAYS = 3; // a brand-new member isn't flagged for "never logged" until after this many days

export type RetentionProfile = {
  id: string; first_name: string | null; last_name: string | null; role: string;
  holiday_until: string | null; created_at: string;
};
/** A counted session (confirmed or pending Yard/run/workout). */
export type SessionDay = { profile_id: string; day: string };

export type AttentionRow = { id: string; name: string; lastSession: string | null; daysAgo: number | null; quietDays: number };
export type Retention = { members: number; active: number; needAttention: number; rows: AttentionRow[] };

const toUtc = (day: string) => { const [y, m, d] = day.split("-").map(Number); return Date.UTC(y, m - 1, d); };
export const daysBetween = (from: string, to: string) => Math.round((toUtc(to) - toUtc(from)) / 86_400_000);

export function memberName(p: Pick<RetentionProfile, "first_name" | "last_name">): string {
  return [p.first_name, p.last_name].map((s) => s?.trim()).filter(Boolean).join(" ") || "Unnamed member";
}

/** `today` is the Albury date. Staff are excluded; members on Holiday mode (holiday_until today or later) are not flagged. */
export function buildRetention(profiles: RetentionProfile[], sessions: SessionDay[], today: string): Retention {
  const last = new Map<string, string>();
  for (const s of sessions) { const cur = last.get(s.profile_id); if (!cur || s.day > cur) last.set(s.profile_id, s.day); }
  const rows: AttentionRow[] = [];
  let members = 0, active = 0;
  for (const p of profiles) {
    if (p.role === "staff") continue;
    members++;
    const lastDay = last.get(p.id) ?? null;
    const daysAgo = lastDay ? daysBetween(lastDay, today) : null;
    if (daysAgo !== null && daysAgo <= QUIET_AFTER_DAYS) { active++; continue; }
    if (p.holiday_until && p.holiday_until >= today) continue;
    if (daysAgo !== null) { rows.push({ id: p.id, name: memberName(p), lastSession: lastDay, daysAgo, quietDays: daysAgo }); continue; }
    const named = Boolean(p.first_name?.trim());
    // Quiet time starts from the later of joining and the Series start, so nobody is flagged on day one.
    const from = alburyDay(new Date(p.created_at)) > SERIES_START_DAY ? alburyDay(new Date(p.created_at)) : SERIES_START_DAY;
    const sinceJoined = daysBetween(from, today);
    if (named && sinceJoined > NEW_MEMBER_GRACE_DAYS) rows.push({ id: p.id, name: memberName(p), lastSession: null, daysAgo: null, quietDays: sinceJoined });
  }
  rows.sort((a, b) => b.quietDays - a.quietDays || a.name.localeCompare(b.name));
  return { members, active, needAttention: rows.length, rows };
}

/** "Last session: Mon 8 Dec (9 days ago)" or "Never logged". */
export function lastSessionLabel(r: Pick<AttentionRow, "lastSession" | "daysAgo">): string {
  if (!r.lastSession || r.daysAgo === null) return "Never logged";
  const date = new Date(`${r.lastSession}T12:00:00+11:00`).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", timeZone: "Australia/Sydney" }).replace(",", "");
  return `Last session: ${date} (${r.daysAgo} days ago)`;
}
