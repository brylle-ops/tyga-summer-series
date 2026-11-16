import { Icon } from "@/components/Icons";
import { LockedTeaser, Screen, SegLinks, Tick, TopNav } from "@/components/ui";
import { unlockLabel, weekRange } from "@/lib/activity";
import { POINTS, SERIES_WEEKS } from "@/lib/series";
import { loadMemberView, requireSeriesMember } from "@/lib/series-data";
import { completeMission } from "../series/actions";

// Weekly missions. Each unlocks Monday 12:01 am and closes Sunday 11:59 pm. Your weekly target (3 sessions) counts on its own.
export default async function Missions({ searchParams }: { searchParams: Promise<{ tab?: string; error?: string }> }) {
  const { tab, error } = await searchParams;
  const v = await loadMemberView(await requireSeriesMember());
  const all = tab === "all";
  const current = v.missions.filter((m) => m.week === v.week);
  const targetDone = v.weekInfo.sessionsDone >= 3;
  const weeks = all ? [...new Set(v.missions.map((m) => m.week))].sort((a, b) => b - a) : [v.week];
  const upcoming = Array.from({ length: SERIES_WEEKS }, (_, i) => i + 1).filter((w) => w > Math.max(v.week, 0));

  return (
    <Screen tabs>
      <TopNav title="Missions" />
      <SegLinks options={[{ label: "This week", href: "/missions" }, { label: "All missions", href: "/missions?tab=all" }]} active={all ? "All missions" : "This week"} />
      {error && <p className="notice" role="alert">That mission isn&apos;t open right now.</p>}
      {v.week < 1 && <p className="notice">Missions start Mon 7 Dec at 12:01 am.</p>}

      {weeks.filter((w) => w >= 1).map((w) => {
        const list = v.missions.filter((m) => m.week === w);
        const live = w === v.week;
        return (
          <section key={w} className="mweek">
            <h2 className="disp">Week {w} mission</h2>
            <p className="xs mute" style={{ margin: "0 0 8px" }}>{weekRange(w)}{live ? " · closes Sunday 11:59 pm" : ""}</p>
            <div className="sheet">
              <div className="srow">
                <Tick on={live ? targetDone : v.week > w ? true : false} />
                <span className="grow"><b>Complete your weekly target</b><small>{live ? `${v.weekInfo.sessionsDone} of 3 sessions · counts automatically` : "3 sessions"}</small></span>
                <span className="ptag">+{POINTS.threeOfThree} pts</span>
              </div>
              {list.map((m) =>
                m.secret ? (
                  <div key={m.id} className="srow locked">
                    <span className="ico"><Icon name="lock" /></span>
                    <span className="grow"><b>{m.title}</b><small>{m.detail}</small></span>
                    <span className="ptag">???</span>
                  </div>
                ) : m.done || !live || !v.real ? (
                  <div key={m.id} className="srow">
                    <Tick on={m.done} />
                    <span className="grow"><b>{m.title}</b><small>{m.detail}</small></span>
                    <span className="ptag">+{m.points * (m.double ? 2 : 1)} pts</span>
                  </div>
                ) : (
                  <form key={m.id} action={completeMission} className="srow">
                    <input type="hidden" name="mission" value={m.id} />
                    <button type="submit" aria-label={`Mark "${m.title}" done`} className="plain"><Tick /></button>
                    <span className="grow"><b>{m.title}</b><small>{m.detail}{m.double ? " · 2× points" : ""}</small></span>
                    <button type="submit" className="ptag go">Done +{m.points * (m.double ? 2 : 1)}</button>
                  </form>
                ),
              )}
            </div>
            {live && current.length === 0 && <p className="sm mute">This week&apos;s mission is being finalised.</p>}
          </section>
        );
      })}

      {all && upcoming.map((w) => <LockedTeaser key={w} title={`Week ${w} mission`} when={`Unlocks ${unlockLabel(w)}, 12:01 am`} />)}
      {!all && v.nextWeek && <LockedTeaser title={`Week ${v.nextWeek.no} mission`} when={`Unlocks ${unlockLabel(v.nextWeek.no)}, 12:01 am`} />}
    </Screen>
  );
}
