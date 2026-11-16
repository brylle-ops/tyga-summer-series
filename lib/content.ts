import type { IconName } from "@/components/Icons";
import { POINTS } from "@/lib/series";

// Amy's wording for the Rules, Points and Series Overview screens.

export const POINT_ROWS: { icon: IconName; title: string; note?: string; pts: number }[] = [
  { icon: "calendar", title: "Complete 3 qualifying sessions", note: "Weekly target", pts: POINTS.threeOfThree },
  { icon: "star", title: "Complete the weekly mission", pts: POINTS.featuredMission },
  { icon: "insta", title: "Tag us in a workout #SummerSeries", pts: POINTS.tag },
  { icon: "flame", title: "Bonus mission", note: "As announced", pts: POINTS.surpriseBonus },
  { icon: "target", title: "Complete all 7 weekly commitments", note: "The full series", pts: POINTS.fullSeries },
];

export const RULE_CHECKS = [
  "Can be a mix of RIG, TURF, Run Club, an independent run or an app workout.",
  "Use Holiday Mode when you're away (app workouts still count).",
  `Complete your 3 sessions to earn ${POINTS.threeOfThree} points for the week.`,
];

export const OVERVIEW_ROWS: { icon: IconName; title: string; note: string }[] = [
  { icon: "calendar", title: "7 weeks", note: "Mon 7 Dec – Tue 26 Jan" },
  { icon: "shirt", title: "Exclusive singlet", note: "Optional, $15. Collect it at The Yard" },
  { icon: "db", title: "Weekly commitment", note: "3 sessions per week (2 Yard + 1 Movement)" },
  { icon: "plane", title: "Holiday Mode", note: "Keep training, wherever you are" },
  { icon: "trophy", title: "Earn points", note: "Complete your target, weekly missions, tag us and bonus missions" },
  { icon: "gift", title: "Rewards & perks", note: "A new reward unlocks every Monday" },
  { icon: "target", title: "Maintain the standard", note: "Consistency is the win" },
];

