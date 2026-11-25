import Link from "next/link";
import { Icon, type IconName } from "@/components/Icons";
import { LockedTeaser, Screen, TopNav } from "@/components/ui";
import { weekRange } from "@/lib/activity";
import { canEnterDraw, canRedeem, isReleased, KIND_LABEL, rewardState, STATE_LABEL, upcomingTeasers, type MemberRewardCtx, type Reward, type RewardKind } from "@/lib/rewards";
import { loadMemberRewards } from "@/lib/rewards-data";
import { requireSeriesMember } from "@/lib/series-data";
import { SERIES_START } from "@/lib/series";
import { enterDraw, markUsed } from "./actions";

const ICON: Record<RewardKind, IconName> = { leaderboard: "trophy", draw: "gift", discount: "shirt", partner: "star", finale: "trophy" };
const MESSAGES: Record<string, string> = {
  entered: "You're in the draw. Good luck!", used: "Marked as used.",
};
const ERRORS: Record<string, string> = { closed: "That reward isn't open any more.", save: "Couldn't save that. Try again." };

const dateLabel = (d: string) => new Date(`${d}T12:00:00+11:00`).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric", timeZone: "Australia/Sydney" });
const unlockLabel = (week: number) =>
  new Date(SERIES_START.getTime() + (week - 1) * 7 * 86_400_000 + 12 * 3_600_000)
    .toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", timeZone: "Australia/Sydney" }) + ", 12:00 am";

// Rewards & Perks: a new offer unlocks every Monday. Nothing here costs points; points only climb the leaderboard.
export default async function Perks({ searchParams }: { searchParams: Promise<{ done?: string; error?: string; show?: string }> }) {
  const q = await searchParams;
  const me = await requireSeriesMember();
  if (!me) {
    return <Screen tabs><TopNav title="Rewards & Perks" /><p className="notice">Example mode. Rewards show up once the app is connected.</p></Screen>;
  }
  const { rewards, ctx, drawClosed } = await loadMemberRewards(me.id);
  const GROUPS = [
    { key: "local", icon: "cup" as IconName, title: "Local business discounts", note: "Exclusive offers from our partners", kinds: ["partner", "discount"] },
    { key: "prizes", icon: "gift" as IconName, title: "Weekly prizes", note: "Win draws and leaderboard rewards", kinds: ["draw", "leaderboard"] },
    { key: "major", icon: "star" as IconName, title: "Major prize", note: "The big finale reward", kinds: ["finale"] },
  ];
  const group = GROUPS.find((g) => g.key === q.show);
  const released = rewards.filter((r) => isReleased(r, ctx.week) && (!group || group.kinds.includes(r.kind)));
  const now = released.filter((r) => r.week === ctx.week);
  const earlier = released.filter((r) => r.week < ctx.week).sort((a, b) => b.week - a.week);
  const upcoming = upcomingTeasers(rewards, ctx.week);

  return (
    <Screen tabs>
      <TopNav title="Rewards & Perks" />
      <div className="hero"><h2 className="disp">Exclusive perks for our Summer Series community.</h2></div>
      <div className="sheet">
        {GROUPS.map((g) => (
          <Link key={g.key} href={group?.key === g.key ? "/perks" : `/perks?show=${g.key}`} className={`srow ${group?.key === g.key ? "sel" : ""}`}>
            <span className="ico"><Icon name={g.icon} /></span>
            <span className="grow"><h2 className="disp sm-d">{g.title}</h2><small>{g.note}</small></span>
            <span className="mute" aria-hidden="true">{group?.key === g.key ? "✕" : "›"}</span>
          </Link>
        ))}
      </div>
      <p className="sm mute" style={{ margin: 0 }}>A new reward unlocks every Monday. You don&apos;t spend points on these. Points just help you climb the leaderboard.</p>
      {q.done && MESSAGES[q.done] && <p className="notice" role="status">{MESSAGES[q.done]}</p>}
      {q.error && ERRORS[q.error] && <p className="notice" role="alert">{ERRORS[q.error]}</p>}

      <div className="eyebrow" style={{ marginTop: 4 }}>{ctx.week >= 1 ? `This week · Week ${ctx.week} · ${weekRange(ctx.week)}` : "This week"}</div>
      {now.length === 0 && <p className="notice">{ctx.week >= 1 ? "This week's reward is being finalised. Check back soon." : "Rewards start when the Series does, Mon 7 Dec."}</p>}
      {now.map((r) => <RewardCard key={r.id} r={r} ctx={ctx} drawClosed={drawClosed.has(r.id)} />)}

      {upcoming.length > 0 && <div className="eyebrow" style={{ marginTop: 8 }}>Coming up</div>}
      {upcoming.map((r) => (
        <LockedTeaser key={r.week} title={`Week ${r.week} · ${r.titles[0]}`} extras={r.titles.slice(1)} when={`Unlocks ${unlockLabel(r.week)}`} note="COMING SOON" />
      ))}

      {earlier.length > 0 && <div className="eyebrow" style={{ marginTop: 8 }}>Earlier weeks</div>}
      {earlier.map((r) => <RewardCard key={r.id} r={r} ctx={ctx} drawClosed={drawClosed.has(r.id)} />)}
    </Screen>
  );
}

function RewardCard({ r, ctx, drawClosed }: { r: Reward; ctx: MemberRewardCtx; drawClosed: boolean }) {
  const state = rewardState(r, ctx);
  const showCode = r.code && (state === "available" || state === "unlocked") && (r.kind === "discount" || r.kind === "partner" || state === "unlocked");
  return (
    <div className={`reward ${state}`} id={`r${r.id}`}>
      {r.image_url && /* eslint-disable-next-line @next/next/no-img-element */ <img className="reward-img" src={r.image_url} alt={r.partner || r.title} loading="lazy" />}
      <div className="li" style={{ alignItems: "flex-start", gap: 12 }}>
        <span className="ico reward-ico"><Icon name={ICON[r.kind]} /></span>
        <div className="grow">
          <div className="xs mute" style={{ letterSpacing: 1.2, fontWeight: 600 }}>{KIND_LABEL[r.kind].toUpperCase()}{r.partner ? ` · ${r.partner}` : ""}</div>
          <b style={{ fontSize: 16 }}>{r.title}</b>
        </div>
        <span className={`rstate ${state}`}>{STATE_LABEL[state]}</span>
      </div>
      {r.description && <p className="sm" style={{ margin: "8px 0 0" }}>{r.description}</p>}
      {state === "unlocked" && <p className="notice" role="status" style={{ marginTop: 8 }}>You&apos;re a winner! Collect this at The Yard.</p>}
      <dl className="reward-facts">
        {r.eligibility && <><dt>Who can get it</dt><dd>{r.eligibility}</dd></>}
        {r.how_to && <><dt>How to {r.kind === "draw" ? "enter" : r.kind === "leaderboard" ? "win" : "redeem"}</dt><dd>{r.how_to}</dd></>}
        {r.expires_on && <><dt>Expires</dt><dd>{dateLabel(r.expires_on)}</dd></>}
      </dl>
      {showCode && <div className="v-code"><b>{r.code}</b><span className="xs mute">Show at The Yard</span></div>}
      {canEnterDraw(r, ctx, drawClosed) && (
        <form action={enterDraw}><input type="hidden" name="reward" value={r.id} /><button className="btn" type="submit">Enter draw</button></form>
      )}
      {state === "available" && r.kind === "draw" && drawClosed && <p className="xs mute" style={{ margin: "8px 0 0" }}>Entries are closed. The winner has been drawn.</p>}
      {canRedeem(r, ctx) && (
        <form action={markUsed}><input type="hidden" name="reward" value={r.id} /><button className="mini ghost" type="submit">I&apos;ve used this</button></form>
      )}
    </div>
  );
}
