import { Icon } from "@/components/Icons";
import { Pill, Screen, TopNav } from "@/components/ui";
import HolidaySwitch, { HolidayDate } from "@/components/HolidaySwitch";
import Link from "next/link";
import { holidayFilters, holidayWorkouts } from "@/lib/mock-data";
import { loadMemberView, requireSeriesMember } from "@/lib/series-data";
import { setHoliday } from "../series/actions";

const auDate = (d: string) => new Date(`${d}T12:00:00+11:00`).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric", timeZone: "Australia/Sydney" });

// Holiday Mode: beach header, the switch card with the three rules, then workouts that count anywhere
export default async function Holiday({ searchParams }: { searchParams: Promise<{ f?: string; error?: string; on?: string; off?: string }> }) {
  const { f, error, on, off } = await searchParams;
  const v = await loadMemberView(await requireSeriesMember());
  const filter = holidayFilters.includes(f ?? "") ? f! : "All";
  const match = (w: (typeof holidayWorkouts)[number]) => filter === "All" || (filter === "Run" ? w.icon === "run" : filter === "Hotel room" ? /hotel|room/i.test(w.title) : /bodyweight|no equipment/i.test(w.detail));
  const away = v.holidayUntil;
  return (
    <Screen tabs>
      <TopNav title="Holiday Mode" back="/more" />
      <div className="photo-hero beach"><div className="beach-fade" /></div>
      <form action={setHoliday} className="sheet pad" style={{ marginTop: -56, position: "relative" }}>
        <div className="li" style={{ gap: 12 }}>
          <div className="grow">
            <h2 className="disp">Holiday Mode</h2>
            <p className="sm mute" style={{ margin: 0 }}>{away ? `Away until ${auDate(away)}. Coaches can see you're travelling.` : "Training away from The Yard?"}</p>
          </div>
          <HolidaySwitch on={Boolean(away)} />
        </div>
        <p className="sm" style={{ margin: "12px 0 8px", fontWeight: 600 }}>Stay in the Series wherever you are.</p>
        <ul className="ticks">
          <li><Icon name="check" />Swap your Yard sessions for approved app workouts.</li>
          <li><Icon name="check" />Complete 3 qualifying sessions across the week.</li>
          <li><Icon name="check" />Keep your points, keep your streak and stay on the leaderboard.</li>
        </ul>
        <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
          {error === "pick" && <p className="xs" role="alert">Pick the date you&apos;ll be back first.</p>}
          {error === "date" && <p className="xs" role="alert">Pick a date between today and 31 Jan.</p>}
          {on && away && <p className="xs" role="status">Holiday Mode is on. Enjoy the trip!</p>}
          {off && !away && <p className="xs" role="status">Welcome back. Holiday Mode is off.</p>}
          {away ? (
            <button className="btn ghost" name="until" value="" type="submit" style={{ height: 44 }}>I&apos;m back, turn Holiday Mode off</button>
          ) : (
            <>
              <label className="xs mute" htmlFor="until">I&apos;m away until</label>
              <HolidayDate min={new Date().toLocaleDateString("en-CA", { timeZone: "Australia/Sydney" })} />
            </>
          )}
        </div>
      </form>

      <div className="h2" style={{ marginTop: 4 }}>Workouts that count anywhere</div>
      <div className="chips">
        {holidayFilters.map((x) => <Link key={x} href={x === "All" ? "/holiday" : `/holiday?f=${encodeURIComponent(x)}`} className={`chip ${x === filter ? "on" : ""}`}>{x}</Link>)}
      </div>
      {holidayWorkouts.filter(match).map((w) => (
        <Link key={w.title} href={`/log?kind=${w.recovery ? "recovery" : "workout"}`} className="li card" style={{ padding: "10px 12px", textDecoration: "none", color: "inherit" }}>
          <span className="ico"><Icon name={w.icon} /></span>
          <div className="grow"><b className="sm">{w.title}</b><div className="xs mute">{w.detail}</div></div>
          {w.recovery ? <span className="xs mute">{w.tag}</span> : <Pill>{w.tag}</Pill>}
        </Link>
      ))}
    </Screen>
  );
}
