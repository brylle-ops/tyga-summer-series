import { Icon } from "@/components/Icons";
import { LockedTeaser, Pill, Screen, TopNav } from "@/components/ui";
import Link from "next/link";
import { holidayFilters, holidayWorkouts } from "@/lib/mock-data";
import { loadMemberView, requireSeriesMember } from "@/lib/series-data";
import { setHoliday } from "../series/actions";

// Holiday Mode
export default async function Holiday({ searchParams }: { searchParams: Promise<{ f?: string; error?: string }> }) {
  const { f, error } = await searchParams;
  const v = await loadMemberView(await requireSeriesMember());
  const wk = Math.max(v.week, 1);
  const filter = holidayFilters.includes(f ?? "") ? f! : "All";
  const match = (w: (typeof holidayWorkouts)[number]) => filter === "All" || (filter === "Run" ? w.icon === "run" : filter === "Hotel room" ? /hotel|room/i.test(w.title) : /bodyweight|no equipment/i.test(w.detail));
  const away = v.holidayUntil;
  return (
    <Screen>
      <TopNav title="Holiday Mode" back="/home" />
      <form action={setHoliday} className="cream-card" style={{ display: "grid", gap: 10 }}>
        <div className="li">
          <span className="ico"><Icon name="plane" /></span>
          <div className="grow"><b>{away ? "I'm away" : "Going away?"}</b>
            <div className="sm mute">{away ? `Until ${away} · coaches can see you're travelling` : "Let the coaches know, so they don't chase you"}</div></div>
        </div>
        {error && <p className="xs" role="alert">Pick a date between today and 31 Jan.</p>}
        {away ? (
          <button className="btn ghost" name="until" value="" type="submit" style={{ height: 42, color: "var(--ink)", borderColor: "rgba(0,0,0,.2)" }}>I&apos;m back</button>
        ) : (
          <div className="li" style={{ gap: 8 }}>
            <input type="date" name="until" required min={new Date().toLocaleDateString("en-CA", { timeZone: "Australia/Sydney" })} max="2027-01-31" aria-label="Away until" className="grow"
              style={{ height: 42, borderRadius: 12, border: "1px solid rgba(0,0,0,.2)", padding: "0 10px", font: "inherit" }} />
            <button className="mini" type="submit">Turn on</button>
          </div>
        )}
      </form>
      <div className="h2" style={{ marginTop: 4 }}>Workouts that count anywhere</div>
      <div className="chips">
        {holidayFilters.map((x) => <Link key={x} href={x === "All" ? "/holiday" : `/holiday?f=${encodeURIComponent(x)}`} className={`chip ${x === filter ? "on" : ""}`}>{x}</Link>)}
      </div>
      {holidayWorkouts.filter((w) => w.week <= wk && match(w)).sort((a, b) => b.week - a.week).map((w) => (
        <Link key={w.title} href={`/log?kind=${w.recovery ? "recovery" : "workout"}`} className="li card" style={{ padding: "10px 12px", textDecoration: "none" }}>
          <span className="ico"><Icon name={w.icon} /></span>
          <div className="grow"><b className="sm">{w.title}</b><div className="xs mute">{w.detail}</div></div>
          {w.recovery ? <span className="xs mute">{w.tag}</span> : <Pill>{w.tag}</Pill>}
        </Link>
      ))}
      {holidayWorkouts.some((w) => w.week > wk) && v.nextWeek && <LockedTeaser title={`Week ${v.nextWeek.no} holiday workouts`} when={`Unlocks ${v.nextWeek.unlocks}`} />}
    </Screen>
  );
}
