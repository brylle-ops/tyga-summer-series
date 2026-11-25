// Admin member list: blocked members live in their own view, so staff can still find and unblock them.
type Listed = { first_name: string | null; last_name: string | null; email: string; blocked_at?: string | null };

export function memberList<T extends Listed>(profiles: T[], blocked: boolean, q = ""): T[] {
  const needle = q.trim().toLowerCase();
  return profiles.filter((p) => Boolean(p.blocked_at) === blocked
    && (!needle || `${p.first_name ?? ""} ${p.last_name ?? ""} ${p.email}`.toLowerCase().includes(needle)));
}
