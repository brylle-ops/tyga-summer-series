// Holiday Mode workouts, worded exactly as on the gym's Summer Series workout cards.
import type { IconName } from "@/components/Icons";

export type WorkoutStep = { amount: string; name: string; note?: string; effort?: string };
export type Workout = {
  id: string; title: string; type: "Bodyweight" | "Dumbbells" | "Cardio"; icon: IconName;
  format: string; steps: WorkoutStep[]; instructions?: string;
};

const AMRAP = "Complete as many quality rounds as you can in 20 minutes. Rest as needed.";

export const WORKOUTS: Workout[] = [
  {
    id: "01", title: "Bodyweight", type: "Bodyweight", icon: "flame", format: "20-minute AMRAP",
    steps: [{ amount: "5", name: "Burpees" }, { amount: "10", name: "Push-ups" }, { amount: "15", name: "Air squats" }],
    instructions: AMRAP,
  },
  {
    id: "02", title: "Dumbbells", type: "Dumbbells", icon: "db", format: "20-minute AMRAP",
    steps: [{ amount: "5", name: "Dumbbell devil’s presses" }, { amount: "10", name: "Dumbbell deadlifts" }, { amount: "15", name: "Dumbbell push presses" }],
    instructions: AMRAP,
  },
  {
    id: "03", title: "Interval weights", type: "Dumbbells", icon: "db", format: "5 rounds",
    steps: [
      { amount: "8", name: "Dumbbell static lunges", note: "Each side" },
      { amount: "8", name: "Single-arm DB bent-over rows", note: "Each side" },
      { amount: "8", name: "Alternating DB snatches", note: "Each side · 16 total" },
      { amount: "200 m", name: "Erg effort or run" },
    ],
    instructions: "Go straight into the 200 m effort, then rest 60 seconds between rounds.",
  },
  {
    id: "04", title: "Core EMOM", type: "Bodyweight", icon: "target", format: "9 minutes · 3 rounds",
    steps: [
      { amount: "M1", name: "60 bodyweight Russian twists", note: "30 each side" },
      { amount: "M2", name: "20 alternating V sit-ups", note: "10 each side" },
      { amount: "M3", name: "45-second forearm plank" },
    ],
    instructions: "Start each move at the top of the minute. Rest for the time left, then repeat.",
  },
  {
    id: "05", title: "ICE / Intense cardio exercise", type: "Cardio", icon: "run", format: "22 minutes · Erg, run or treadmill",
    steps: [
      { amount: "2 min", name: "Warm-up", effort: "50%" },
      { amount: "3 min", name: "", effort: "70%" },
      { amount: "1 min", name: "", effort: "100%" },
      { amount: "4 min", name: "", effort: "70%" },
      { amount: "1 min", name: "", effort: "100%" },
      { amount: "4 min", name: "", effort: "70%" },
      { amount: "1 min", name: "", effort: "100%" },
      { amount: "4 min", name: "", effort: "70%" },
      { amount: "2 min", name: "Finish", effort: "100%" },
    ],
  },
];

/** The workout's poster, public/img/workouts/<id>.webp (1080x1350). */
export const workoutPoster = (id: string) => `/img/workouts/${id}.webp`;

/** Everything written on the poster, for screen readers. */
export const workoutText = (w: Workout) => [
  `Workout ${w.id}: ${w.title}. ${w.format}.`,
  ...w.steps.map((s) => [s.amount, s.name, s.note, s.effort && `${s.effort} effort`].filter(Boolean).join(" ")),
  w.instructions,
].filter(Boolean).join(" ");

export const WORKOUT_FILTERS = ["All", "Bodyweight", "Dumbbells", "Cardio"];

export const findWorkout = (id: string) => WORKOUTS.find((w) => w.id === id);

export const workoutsFor = (filter?: string) =>
  filter && filter !== "All" && WORKOUT_FILTERS.includes(filter) ? WORKOUTS.filter((w) => w.type === filter) : WORKOUTS;
