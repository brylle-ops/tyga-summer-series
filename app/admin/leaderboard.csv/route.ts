import { buildDashboard, leaderboardCsv } from "@/lib/dashboard";
import { loadEveryone, seriesWeekNow } from "@/lib/series-data";
import { isStaff } from "@/lib/session";

// Leaderboard download (staff only): rank, points, level, consistency, last session.
export async function GET() {
  if (!(await isStaff())) return new Response("Staff only", { status: 403 });
  const { everyone, missions } = await loadEveryone();
  const { rows } = buildDashboard(everyone, missions, seriesWeekNow(), new Set());
  return new Response(leaderboardCsv(rows), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=\"tyga-leaderboard.csv\"" },
  });
}
