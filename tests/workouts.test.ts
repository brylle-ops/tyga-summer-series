import { describe, expect, it } from "vitest";
import { findWorkout, WORKOUT_FILTERS, workoutsFor, WORKOUTS } from "@/lib/workouts";

describe("holiday workouts", () => {
  it("lists the five routines in order, each reachable by its number", () => {
    expect(WORKOUTS.map((w) => w.id)).toEqual(["01", "02", "03", "04", "05"]);
    expect(findWorkout("03")?.title).toBe("Interval weights");
    expect(findWorkout("99")).toBeUndefined();
  });
  it("filters by type and shows everything for an unknown filter", () => {
    const ids = (f?: string) => workoutsFor(f).map((w) => w.id);
    expect(ids("Bodyweight")).toEqual(["01", "04"]);
    expect(ids("Dumbbells")).toEqual(["02", "03"]);
    expect(ids("Cardio")).toEqual(["05"]);
    expect(ids("nonsense")).toHaveLength(5);
    expect(ids()).toHaveLength(5);
    expect(WORKOUT_FILTERS).toEqual(["All", "Bodyweight", "Dumbbells", "Cardio"]);
  });
  it("has a cardio table that adds up to its 22 minutes", () => {
    const minutes = findWorkout("05")!.steps.reduce((total, s) => total + parseInt(s.amount, 10), 0);
    expect(minutes).toBe(22);
  });
});
