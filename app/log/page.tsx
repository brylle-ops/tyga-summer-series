import Link from "next/link";
import LogForm from "@/components/LogForm";
import { Screen } from "@/components/ui";
import { checkinTypes } from "@/lib/mock-data";
import { loadMemberView, requireSeriesMember } from "@/lib/series-data";
import { logCheckin } from "../series/actions";

const KINDS = ["yard", "run", "workout", "recovery", "rest"] as const;
const NAME: Record<string, string> = { yard: "Yard session", run: "Run", workout: "Workout", recovery: "Recovery", rest: "Rest day" };
const COUNTED = ["yard", "run", "workout"];
const ERRORS: Record<string, string> = {
  early: "Logging opens when the series starts on Mon 7 Dec.", save: "Couldn't save that. Try again.", kind: "Pick what you did.",
};

function doneMessage(done: string): string | null {
  const kinds = done.split(",").filter((k) => (KINDS as readonly string[]).includes(k));
  if (kinds.length === 0) return null;
  const names = kinds.map((k) => NAME[k]).join(", ");
  const parts = [`Logged: ${names}.`];
  if (kinds.includes("yard")) parts.push("The Yard session counts once the class roster confirms it (usually next morning).");
  if (kinds.filter((k) => COUNTED.includes(k)).length > 1) parts.push("Only one counted session a day earns points.");
  return parts.join(" ");
}

// Daily check-in: tick everything you did, log in one go.
export default async function Log({ searchParams }: { searchParams: Promise<{ done?: string; error?: string; kind?: string; example?: string }> }) {
  const q = await searchParams;
  const v = await loadMemberView(await requireSeriesMember());
  const today = new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "short", timeZone: "Australia/Sydney" });
  const initial = (KINDS as readonly string[]).includes(q.kind ?? "") ? [q.kind as string] : [];
  const message = q.done ? doneMessage(q.done) : null;
  return (
    <Screen tabs bodyStyle={{ gap: 9 }}>
      <div className="eyebrow" style={{ marginTop: 4 }}>{today}</div>
      <h1 className="h1">Did you move today?</h1>
      {message && <p className="notice" role="status">{message}</p>}
      {q.error && ERRORS[q.error] && <p className="notice" role="alert">{ERRORS[q.error]}</p>}
      {q.example && <p className="notice">Example mode. Logging works once the app is connected.</p>}
      <LogForm
        action={logCheckin}
        initial={initial}
        logged={v.todays}
        options={checkinTypes.map((t, i) => ({ kind: KINDS[i], title: t.title, detail: t.detail, icon: t.icon }))}
      >
        <div className="li card" style={{ padding: "9px 12px" }}>
          <b className="sm grow">Need workout ideas?</b>
          <Link href="/holiday" className="chip" style={{ padding: "6px 10px" }}>Holiday workouts</Link>
        </div>
        <p className="xs mute" style={{ margin: 0 }}>Run and Workout count straight away. A Yard session counts once the class roster confirms it.</p>
      </LogForm>
    </Screen>
  );
}
