import Link from "next/link";
import { notFound } from "next/navigation";
import { Screen, TopNav } from "@/components/ui";
import { requireSeriesMember } from "@/lib/series-data";
import { findWorkout, workoutPoster, workoutText, WORKOUTS } from "@/lib/workouts";

// One holiday workout: its poster and a button to log it.
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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="wk-poster" src={workoutPoster(w.id)} alt={workoutText(w)} width={1080} height={1350} />
      <Link className="btn" href="/log?kind=workout">Log this workout</Link>
      <div className="li" style={{ justifyContent: "space-between" }}>
        {prev ? <Link className="chip" href={`/holiday/${prev.id}`}>‹ Workout {prev.id}</Link> : <span />}
        {next ? <Link className="chip" href={`/holiday/${next.id}`}>Workout {next.id} ›</Link> : <span />}
      </div>
    </Screen>
  );
}
