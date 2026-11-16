import { Icon } from "@/components/Icons";
import { Screen, TopNav } from "@/components/ui";
import { POINT_ROWS } from "@/lib/content";
import { getCurrentMember, supabaseReady } from "@/lib/session";

export const metadata = { title: "The Points · TYGA Summer Series" };

// The Points: public page (members see the tab bar)
export default async function Points() {
  const signed = supabaseReady() && Boolean(await getCurrentMember());
  return (
    <Screen tabs={signed} className="sand">
      <TopNav title="Points" back={signed ? "/more" : "/"} />
      <div><h2 className="disp">How to earn points</h2>
      <p className="sm mute" style={{ margin: "2px 0 0" }}>Turn your commitment into points, rewards and a spot on the leaderboard.</p></div>
      <div className="sheet">
        {POINT_ROWS.map((r) => (
          <div key={r.title} className="srow">
            <span className="ico"><Icon name={r.icon} /></span>
            <span className="grow"><b>{r.title}</b>{r.note && <small>{r.note}</small>}</span>
            <span className="ptag">+{r.pts} pts</span>
          </div>
        ))}
      </div>
      <p className="xs mute" style={{ margin: 0 }}>Points climb you up the leaderboard. Weekly rewards and perks don&apos;t cost any points.</p>
    </Screen>
  );
}
