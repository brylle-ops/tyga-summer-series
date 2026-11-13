import Link from "next/link";
import { Icon } from "@/components/Icons";
import { Screen } from "@/components/ui";
import { checkinTypes } from "@/lib/mock-data";
import { loadMemberView, requireSeriesMember } from "@/lib/series-data";
import { logCheckin } from "../series/actions";

const KINDS = ["yard", "run", "workout", "recovery", "rest"] as const;
const DONE: Record<string, string> = {
  yard: "Yard session logged — it counts once the class roster confirms it (usually next morning).",
  run: "Run logged. One counted session a day earns +5.", workout: "Workout logged. One counted session a day earns +5.", recovery: "Recovery logged. Nice.", rest: "Rest day logged. Rest is part of the standard.",
};
const ERRORS: Record<string, string> = {
  early: "Logging opens when the series starts on Mon 7 Dec.", save: "Couldn't save that — try again.", kind: "Pick what you did.",
};

// Daily check-in
export default async function Log({ searchParams }: { searchParams: Promise<{ done?: string; error?: string; kind?: string; example?: string }> }) {
  const q = await searchParams;
  const v = await loadMemberView(await requireSeriesMember());
  const today = new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "short", timeZone: "Australia/Sydney" });
  const pick = (KINDS as readonly string[]).includes(q.kind ?? "") ? q.kind : "yard";
  return (
    <Screen tabs bodyStyle={{ gap: 9 }}>
      <div className="eyebrow" style={{ marginTop: 4 }}>{today}</div>
      <div className="h1">Did you move today?</div>
      {q.done && DONE[q.done] && <p className="notice" role="status">{DONE[q.done]}</p>}
      {q.error && ERRORS[q.error] && <p className="notice" role="alert">{ERRORS[q.error]}</p>}
      {q.example && <p className="notice">Example mode — logging works once the app is connected.</p>}
      <form action={logCheckin} style={{ display: "contents" }}>
        {checkinTypes.map((t, i) => {
          const kind = KINDS[i];
          const logged = v.todays.includes(kind);
          return (
            <label key={t.title} className={`move ${logged ? "on" : ""}`} style={{ cursor: logged ? "default" : "pointer" }}>
              <input className="sr-radio" type="radio" name="kind" value={kind} defaultChecked={!logged && kind === pick} disabled={logged} required />
              <span className="ico"><Icon name={t.icon} /></span>
              <div className="grow"><b>{t.title}</b><small>{logged ? "Logged today ✓" : t.detail}</small></div>
              <span className="radio" />
            </label>
          );
        })}
        <div className="li card" style={{ padding: "9px 12px" }}>
          <b className="sm grow">Need workout ideas?</b>
          <Link href="/holiday" className="chip" style={{ padding: "6px 10px" }}>Holiday workouts</Link>
        </div>
        {KINDS.every((k) => v.todays.includes(k)) ? <p className="notice" role="status">All logged for today. See you tomorrow.</p> : <button className="btn" type="submit">Log it</button>}
      </form>
    </Screen>
  );
}
