// Weekly Rewards & Perks: what state each reward is in for a member, and how weekly winners are picked.
// Pure functions, no database. Rewards are never bought with points; points only decide leaderboard prizes.

export type RewardKind = "leaderboard" | "draw" | "discount" | "partner" | "finale";
export type Reward = {
  id: number; week: number; kind: RewardKind; title: string; partner: string; description: string; eligibility: string; how_to: string;
  code: string | null; image_url: string | null; expires_on: string | null; winners_count: number; published: boolean;
};
export type RewardState = "locked" | "available" | "entered" | "unlocked" | "redeemed" | "expired";

export const STATE_LABEL: Record<RewardState, string> = {
  locked: "Coming soon", available: "Available", entered: "Entered", unlocked: "Unlocked", redeemed: "Redeemed", expired: "Expired",
};
export const KIND_LABEL: Record<RewardKind, string> = {
  leaderboard: "Leaderboard prize", draw: "Prize draw", discount: "Member discount", partner: "Local business", finale: "Finale reward",
};

export type MemberRewardCtx = {
  week: number;                 // current series week, 0 before the series starts
  today: string;                // YYYY-MM-DD, Albury
  entered: Set<number>;         // reward ids this member entered
  won: Map<number, { announced: boolean; collected: boolean }>; // reward ids this member won
  redeemed: Set<number>;        // discount / partner rewards this member marked as used
};

/** Released = staff published it AND its Monday has arrived. Anything else shows as COMING SOON. */
export const isReleased = (r: Pick<Reward, "published" | "week">, week: number) => r.published && r.week <= week;

export function rewardState(r: Reward, ctx: MemberRewardCtx): RewardState {
  if (!isReleased(r, ctx.week)) return "locked";
  const win = ctx.won.get(r.id);
  if (win?.announced && win.collected) return "redeemed";
  if (ctx.redeemed.has(r.id)) return "redeemed";
  if (r.expires_on && r.expires_on < ctx.today) return "expired";
  if (win?.announced) return "unlocked";
  if (ctx.entered.has(r.id)) return "entered";
  return "available";
}

/** Can this member enter this draw right now? One entry each, and only until a winner has been picked. */
export function canEnterDraw(r: Reward, ctx: MemberRewardCtx, drawClosed: boolean): boolean {
  return r.kind === "draw" && !drawClosed && rewardState(r, ctx) === "available";
}

/** Can this member mark a discount / partner reward as used? */
export function canRedeem(r: Reward, ctx: MemberRewardCtx): boolean {
  return (r.kind === "discount" || r.kind === "partner") && rewardState(r, ctx) === "available";
}

export type WeekScore = { id: string; name: string; points: number; sessions: number };
export type WeekRanking = { rows: (WeekScore & { rank: number; inTop: boolean })[]; tiedAtCutoff: string[] };

/**
 * The weekly leaderboard for a prize. Order: points, then counted sessions that week, then name.
 * Tie-break is NOT final (Amy to confirm), so anyone level with the last winner is flagged for staff to decide.
 */
export function rankWeek(scores: WeekScore[], winners: number): WeekRanking {
  const sorted = [...scores].filter((s) => s.points > 0).sort((a, b) => b.points - a.points || b.sessions - a.sessions || a.name.localeCompare(b.name));
  const rows = sorted.map((s, i) => ({ ...s, rank: 0, inTop: i < winners }));
  rows.forEach((r, i) => { r.rank = i > 0 && sorted[i - 1].points === r.points && sorted[i - 1].sessions === r.sessions ? rows[i - 1].rank : i + 1; });
  const last = rows[winners - 1];
  const tied = last ? rows.filter((r) => r.points === last.points && r.sessions === last.sessions) : [];
  const spills = tied.some((r) => !r.inTop) && tied.some((r) => r.inTop);
  return { rows, tiedAtCutoff: spills ? tied.map((r) => r.id) : [] };
}
