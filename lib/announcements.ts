export type Announcement = { id: number; title: string; body: string; created_at: string };

const FRESH_DAYS = 7;

/** True when the announcement is under 7 days old. */
export function isFresh(createdAt: string | Date, now: Date = new Date()): boolean {
  const t = new Date(createdAt).getTime();
  if (Number.isNaN(t)) return false;
  const age = now.getTime() - t;
  return age >= 0 && age < FRESH_DAYS * 24 * 60 * 60 * 1000;
}
