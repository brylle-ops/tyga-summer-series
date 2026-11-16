import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icons";
import { Screen, TopNav } from "@/components/ui";
import { unlockLabel, weekRange } from "@/lib/activity";
import { loadMemberView, requireSeriesMember } from "@/lib/series-data";
import { completeMission } from "../../series/actions";

// One mission: what to do, how many points, and the Done button when it's open.
export default async function Mission({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const v = await loadMemberView(await requireSeriesMember());
  const m = v.missions.find((x) => x.id === id);
  if (!m) notFound(); // future weeks aren't in the list yet, so they stay hidden until Monday
  const pts = m.points * (m.double ? 2 : 1);
  const open = v.real && m.week === v.week && !m.done && !m.secret;
  const status = m.done ? "Done" : m.secret ? "Secret" : m.week < v.week ? "Closed" : "Open";
  return (
    <Screen tabs className="sand">
      <TopNav title="Mission" back="/missions" />
      <div className="sheet pad">
        <div className="li" style={{ gap: 12, alignItems: "flex-start" }}>
          <span className="ico big"><Icon name={m.secret ? "lock" : m.done ? "check" : "target"} /></span>
          <div className="grow">
            <div className="xs mute">WEEK {m.week} · {weekRange(m.week)}</div>
            <h2 className="disp">{m.title}</h2>
          </div>
          <span className="ptag">+{pts} pts</span>
        </div>
        <p style={{ margin: "14px 0 6px" }}>{m.detail}</p>
        <dl className="reward-facts">
          <dt>Status</dt><dd>{status}{m.double ? " · double points" : ""}</dd>
          <dt>Opens</dt><dd>{unlockLabel(m.week)}, 12:01 am</dd>
          <dt>Closes</dt><dd>Sunday 11:59 pm</dd>
        </dl>
        {open && (
          <form action={completeMission} style={{ marginTop: 14 }}>
            <input type="hidden" name="mission" value={m.id} />
            <button className="btn" type="submit">I&apos;ve done it · +{pts} pts</button>
          </form>
        )}
        {m.done && <p className="notice" role="status" style={{ marginTop: 14 }}>Nice one. This mission is complete.</p>}
      </div>
      <Link href="/missions" className="info-link"><span className="grow"><b className="disp sm-d">All missions</b></span><span aria-hidden="true">›</span></Link>
    </Screen>
  );
}
