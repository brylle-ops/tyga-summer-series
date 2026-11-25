import Link from "next/link";
import { notFound } from "next/navigation";
import { Screen, TopNav } from "@/components/ui";
import { requireSeriesMember } from "@/lib/series-data";
import { findWorkout, WORKOUTS } from "@/lib/workouts";

// One holiday workout: the moves, how to run it, and a button to log it.
export default async function WorkoutPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSeriesMember();
  const w = findWorkout((await params).id);
  if (!w) notFound();
  const i = WORKOUTS.indexOf(w);
  const prev = WORKOUTS[i - 1];
  const next = WORKOUTS[i + 1];
  return (
    <Screen tabs>
      <TopNav title="Workout" back="/holiday" />
      <div>
        <div className="xs mute" style={{ letterSpacing: 1.2 }}>HOLIDAY MODE · WORKOUT {w.id}</div>
        <h1 className="disp" style={{ fontSize: 30 }}>{w.title}</h1>
        <p className="sm" style={{ margin: "4px 0 0", fontWeight: 600 }}>{w.format}</p>
      </div>
      <ol className="wk-steps">
        {w.steps.map((s, n) => (
          <li key={n}>
            <b className="wk-amount">{s.amount}</b>
            <span className="grow">{s.name}{s.note && <small>{s.note}</small>}</span>
            {s.effort && <b className="wk-effort" aria-label={`${s.effort} effort`}>{s.effort}</b>}
          </li>
        ))}
      </ol>
      {w.instructions && <p className="sm mute" style={{ margin: 0 }}>{w.instructions}</p>}
      <Link className="btn" href="/log?kind=workout">Log this workout</Link>
      <div className="li" style={{ justifyContent: "space-between" }}>
        {prev ? <Link className="chip" href={`/holiday/${prev.id}`}>‹ Workout {prev.id}</Link> : <span />}
        {next ? <Link className="chip" href={`/holiday/${next.id}`}>Workout {next.id} ›</Link> : <span />}
      </div>
    </Screen>
  );
}
