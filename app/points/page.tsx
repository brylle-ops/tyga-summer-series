import { Icon } from "@/components/Icons";
import { Screen, TopNav } from "@/components/ui";
import { POINT_ROWS } from "@/lib/content";
import { getCurrentMember, supabaseReady } from "@/lib/session";

export const metadata = { title: "The Points · TYGA Summer Series" };

// The Points: public page (members see the tab bar)
export default async function Points() {
  const signed = supabaseReady() && Boolean(await getCurrentMember());
  return (
    <Screen tabs={signed}>
      <TopNav title="The Points" back={signed ? "/more" : "/"} />
      <p className="sm mute" style={{ margin: 0 }}>Earn points for showing up, getting it done and being part of the series.</p>
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
