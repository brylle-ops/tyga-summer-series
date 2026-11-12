import { Icon } from "@/components/Icons";
import { LockedTeaser, Pill, Screen, SegLinks, Sky, Tick, TopNav } from "@/components/ui";
import { loadMemberView, requireSeriesMember } from "@/lib/series-data";
import { completeMission } from "../series/actions";

// Weekly missions — only this week's can be ticked off; next week stays locked until Monday
export default async function Missions({ searchParams }: { searchParams: Promise<{ tab?: string; error?: string }> }) {
  const { tab, error } = await searchParams;
  const v = await loadMemberView(await requireSeriesMember());
  const thisWeek = v.weekInfo;
  const current = v.missions.filter((m) => m.week === v.week);
  const shown = tab === "done" ? v.missions.filter((m) => m.done) : current;
  const doneNow = current.filter((m) => m.done);
  const pts = doneNow.reduce((a, m) => a + m.points * (m.double ? 2 : 1), 0);
  return (
    <Screen tabs>
      <TopNav title="Missions" />
      <SegLinks options={[{ label: "This week", href: "/missions" }, { label: "Done", href: "/missions?tab=done" }]} active={tab === "done" ? "Done" : "This week"} />
      {v.week < 1 ? <p className="notice">Missions start Mon 7 Dec.</p> : (
        <div className="banner">
          <Sky hills={60} />
          <div className="txt">
            <div className="eyebrow" style={{ color: "var(--cream)" }}>Week {thisWeek.no} · {thisWeek.dates}</div>
            <div className="h1">{thisWeek.theme}</div>
          </div>
        </div>
      )}
      {error && <p className="notice" role="alert">That mission isn&apos;t open right now.</p>}
      {tab !== "done" && current.length > 0 && (
        <div className="li">
          <div className="bar grow" style={{ background: "var(--char-3)" }}><i style={{ width: `${Math.round((doneNow.length / current.length) * 100)}%` }} /></div>
          <span className="xs mute">{doneNow.length} of {current.length} · {pts} pts</span>
        </div>
      )}
      {shown.length === 0 && <p className="sm mute">{tab === "done" ? "Nothing ticked off yet." : "No missions this week yet."}</p>}
      {shown.map((m) =>
        m.secret ? (
          <div key={m.id} className="mission locked">
            <span className="ico" style={{ width: 22, height: 22, background: "none", color: "var(--mute)" }}><Icon name="lock" /></span>
            <div className="grow"><b className="mute">{m.title}</b><span className="mute">{m.detail}</span></div>
            <span className="xs mute">???</span>
          </div>
        ) : m.done || m.week !== v.week || !v.real ? (
          <div key={m.id} className={`mission ${m.done ? "cream-card" : "card"}`}>
            <Tick on={m.done} />
            <div className="grow"><b>{m.title}</b><span className="mute">{m.detail}</span></div>
            <Pill done={m.done}>+{m.points * (m.double ? 2 : 1)}</Pill>
          </div>
        ) : (
          <form key={m.id} action={completeMission} className="mission card">
            <input type="hidden" name="mission" value={m.id} />
            <button type="submit" aria-label={`Mark "${m.title}" done`} style={{ background: "none", border: 0, padding: 0, cursor: "pointer" }}><Tick /></button>
            <div className="grow"><b>{m.title}</b><span className="mute">{m.detail}{m.double ? " · 2× points" : ""}</span></div>
            <button type="submit" className="pill" style={{ border: 0, cursor: "pointer" }}>Done · +{m.points * (m.double ? 2 : 1)}</button>
          </form>
        )
      )}
      {tab !== "done" && v.nextWeek && <LockedTeaser title={`Week ${v.nextWeek.no} missions`} when={`Unlocks ${v.nextWeek.unlocks}`} />}
    </Screen>
  );
}
