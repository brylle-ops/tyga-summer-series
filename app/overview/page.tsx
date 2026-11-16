import { Icon } from "@/components/Icons";
import { Screen, TopNav } from "@/components/ui";
import { OVERVIEW_ROWS } from "@/lib/content";
import { getCurrentMember, supabaseReady } from "@/lib/session";

export const metadata = { title: "Series Overview · TYGA Summer Series" };

// Series overview: public page (members see the tab bar)
export default async function Overview() {
  const signed = supabaseReady() && Boolean(await getCurrentMember());
  return (
    <Screen tabs={signed} className="sand">
      <TopNav title="Series Overview" back={signed ? "/more" : "/join/singlet"} />
      <div className="sheet">
        {OVERVIEW_ROWS.map((r) => (
          <div key={r.title} className="srow">
            <span className="ico"><Icon name={r.icon} /></span>
            <span className="grow"><h2 className="disp sm-d">{r.title}</h2><small>{r.note}</small></span>
          </div>
        ))}
      </div>
    </Screen>
  );
}
