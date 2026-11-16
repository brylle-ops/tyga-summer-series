import { Icon } from "@/components/Icons";
import { Screen, TopNav } from "@/components/ui";
import { RULE_CHECKS } from "@/lib/content";
import { getCurrentMember, supabaseReady } from "@/lib/session";

export const metadata = { title: "The Rules · TYGA Summer Series" };

// The Rules: public page (members see the tab bar)
export default async function Rules() {
  const signed = supabaseReady() && Boolean(await getCurrentMember());
  return (
    <Screen tabs={signed}>
      <TopNav title="The Rules" back={signed ? "/more" : "/"} />
      <p className="sm mute" style={{ margin: 0 }}>A 7-week commitment to stay consistent, active and maintain the standard through summer.</p>
      <div className="sheet pad">
        <div className="li" style={{ gap: 12, alignItems: "flex-start" }}>
          <span className="ico big"><Icon name="calendar" /></span>
          <div><h2 className="disp">Your weekly commitment</h2><p className="sm" style={{ margin: "2px 0 0" }}>Complete 3 qualifying sessions every week.</p></div>
        </div>
        <div className="mix">
          <div><Icon name="db" /><b>2 Yard</b><span>sessions</span></div>
          <span className="plus" aria-hidden="true">+</span>
          <div><Icon name="run" /><b>1 Movement</b><span>Yard session, run or app workout</span></div>
        </div>
        <ul className="ticks">
          {RULE_CHECKS.map((t) => <li key={t}><Icon name="check" />{t}</li>)}
        </ul>
        <div className="win"><h2 className="disp">Consistency is the win.</h2><small>MAINTAIN THE STANDARD.</small></div>
      </div>
    </Screen>
  );
}
