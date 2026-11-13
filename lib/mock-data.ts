// Example data from Design v3.
// Week-by-week unlocking (Amy's second voice note): missions, holiday workouts, perks and resources
// belong to a week and only show once that week has unlocked (Monday 12:00am). Change `currentWeekNo`
// to preview another week. Every screen reads from here for now;
// later these get replaced by Supabase queries without changing the screens.

import type { IconName } from "@/components/Icons";

export const me = {
  firstName: "Jess",
  fullName: "Jess Smith",
  shortName: "Jess S.",
  initials: "JS",
  memberNo: 148,
  singlet: { fit: "Women's", size: "M", colour: "Charcoal wash" },
  goal: "Stay consistent over Christmas",
  points: 115,
  rank: 12,
  participants: 148,
  streakWeeks: 2,
  level: 3,
  pointsToNext: 85,
  levelProgressPct: 15,
};

export const thisWeek = {
  no: 3,
  theme: "The Silly Season",
  dates: "21–27 Dec",
  sessionsDone: 2,
  pips: ["Yard", "Run"],
};

export const goals = [
  "Maintain my fitness",
  "Stay consistent over Christmas",
  "Keep my strength",
  "Start February strong",
];

export const sizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

export const checkinTypes: { icon: IconName; title: string; detail: string }[] = [
  { icon: "db", title: "Yard session", detail: "Confirmed against the class roster" },
  { icon: "run", title: "Run", detail: "Solo or Run Club" },
  { icon: "sun", title: "Summer or holiday workout", detail: "From the workout library" },
  { icon: "leaf", title: "Recovery or other movement", detail: "Doesn't count to 3/3, still matters" },
  { icon: "bed", title: "Rest day", detail: "Rest is part of the standard" },
];

export const missions: { week: number; title: string; detail: string; points: string; done?: boolean; secret?: boolean }[] = [
  { week: 2, title: "Wear your singlet to training", detail: "Done 15 Dec", points: "+10", done: true },
  { week: 2, title: "Three sessions or holiday workouts", detail: "3/3 done", points: "+20", done: true },
  { week: 3, title: "Three sessions or holiday workouts", detail: "3/3 done", points: "+20", done: true },
  { week: 3, title: "Share your favourite holiday movement", detail: "Post it, or just tell us here", points: "+10", done: true },
  { week: 3, title: "Christmas movement mission", detail: "2× points · ends 11:59pm", points: "+20" },
  { week: 3, title: "Try a high-protein summer recipe", detail: "3 recipes in Resources", points: "+10" },
  { week: 3, title: "Secret mission", detail: "Drops sometime this week", points: "???", secret: true },
  // Loaded by staff but hidden until week 4 unlocks:
  { week: 4, title: "Plan your January sessions", detail: "Book 3 for the first week back", points: "+10" },
];

export const podium = [
  { initials: "TB", name: "Tom B.", points: 142 },
  { initials: "MK", name: "Mia K.", points: 150 },
  { initials: "SR", name: "Sam R.", points: 138 },
];

export const leaderboard = [
  { rank: 4, initials: "LP", name: "Leah P.", points: 131 },
  { rank: 5, initials: "JW", name: "Josh W.", points: 126 },
  { rank: 6, initials: "KD", name: "Kate D.", points: 120 },
  { rank: 7, initials: "BT", name: "Ben T.", points: 118 },
];

export const clubThisWeek = 64;

export const levels = [
  { no: 1, name: "Show Up", note: "Registered and ready", at: 0 },
  { no: 2, name: "Build Momentum", note: "Unlocked: coffee upgrade", at: 50 },
  { no: 3, name: "Stay Consistent", note: "Unlocked: prize draw entry", at: 100 },
  { no: 4, name: "Maintain the Standard", note: "Unlocks: massage discount", at: 200 },
  { no: 5, name: "Summer Series Legend", note: "Unlocks: Recovery Room session", at: 300 },
];

export const myPerk = {
  level: 2, title: "Free coffee upgrade", partner: "Local partner café · Albury",
  code: "SUMMER-014", useBy: "26 Jan",
};

export const nextPerks: { week: number; icon: IconName; title: string; detail: string; art: string; progress?: number; right?: string; locked?: boolean }[] = [
  { week: 1, icon: "hand", title: "$20 off a massage", detail: "Local wellness partner", art: "linear-gradient(140deg,#7b4a43,#2f2b26)", progress: 57, right: "85 pts" },
  { week: 2, icon: "snow", title: "Recovery Room session", detail: "TYGA · Level 5", art: "linear-gradient(140deg,#3b4a55,#2f2b26)", locked: true },
  { week: 3, icon: "bowl", title: "10% off summer dining", detail: "Local partner restaurant · 150 pts", art: "linear-gradient(140deg,#8a5a2e,#2f2b26)", locked: true },
];

export const holidayFilters = ["All", "Hotel room", "Run", "Bodyweight"];

export const holidayWorkouts: { week: number; icon: IconName; title: string; detail: string; tag: string; recovery?: boolean }[] = [
  { week: 3, icon: "bed", title: "20-min hotel room strength", detail: "No equipment · counts to 3/3", tag: "+5" },
  { week: 3, icon: "run", title: "5 km easy holiday run", detail: "Any route · counts to 3/3", tag: "+5" },
  { week: 2, icon: "sun", title: "Beach EMOM", detail: "Bodyweight · 24 min", tag: "+5" },
  { week: 2, icon: "leaf", title: "Mobility flow", detail: "Recovery · 15 min", tag: "recovery", recovery: true },
  { week: 4, icon: "flame", title: "New Year's Day circuit", detail: "Bodyweight · 20 min · counts to 3/3", tag: "+5" },
];

export const resources: { week: number; icon: IconName; title: string; detail: string; bg: string }[] = [
  { week: 1, icon: "bowl", title: "High-protein recipes", detail: "Yard Fuel: 10 recipes", bg: "linear-gradient(160deg,#6b5440,#1f1b17)" },
  { week: 1, icon: "plane", title: "Holiday workouts", detail: "Train anywhere", bg: "linear-gradient(160deg,#4a5359,#1b1d1e)" },
  { week: 2, icon: "leaf", title: "Recovery & mobility", detail: "Feel good, keep going", bg: "linear-gradient(160deg,#5c5547,#1e1c18)" },
  { week: 2, icon: "drop", title: "Hydration", detail: "Hot-weather basics", bg: "linear-gradient(160deg,#41545a,#1a1e1f)" },
  { week: 3, icon: "sun", title: "Christmas survival", detail: "Eat, enjoy, keep moving", bg: "linear-gradient(160deg,#6e4f3a,#1f1915)" },
  { week: 3, icon: "run", title: "Run sessions", detail: "From Run Club coaches", bg: "linear-gradient(160deg,#4f4a58,#1c1b1f)" },
  { week: 4, icon: "calendar", title: "January reset", detail: "Plan your first week back", bg: "#333" },
];

// draft = still being written · ready = done but hidden from members · live = unlocked
export type WeekStatus = "live" | "ready" | "draft";
export const seriesWeeks: { no: number; label: string; unlocks: string; theme: string; note: string; status: WeekStatus }[] = [
  { no: 1, label: "WK 1 · 7 DEC", unlocks: "Mon 7 Dec", theme: "Show Up & Get Started", note: "Collect your singlet", status: "live" },
  { no: 2, label: "WK 2 · 14 DEC", unlocks: "Mon 14 Dec", theme: "Bring the Energy", note: "Singlet to training", status: "live" },
  { no: 3, label: "WK 3 · 21 DEC", unlocks: "Mon 21 Dec", theme: "The Silly Season", note: "Christmas movement", status: "live" },
  { no: 4, label: "WK 4 · 28 DEC", unlocks: "Mon 28 Dec", theme: "Keep the Momentum", note: "Plan January", status: "ready" },
  { no: 5, label: "WK 5 · 4 JAN", unlocks: "Mon 4 Jan", theme: "Bring Your People", note: "Saturday plus one", status: "draft" },
  { no: 6, label: "WK 6 · 11 JAN", unlocks: "Mon 11 Jan", theme: "Consistency Wins", note: "Try a new time", status: "draft" },
  { no: 7, label: "WK 7 · 18 JAN", unlocks: "Mon 18 Jan", theme: "Finish Together", note: "Team missions", status: "draft" },
];

/** The week members are in right now (example: week 3). */
export const currentWeekNo = 3;
export const nextWeek = seriesWeeks[currentWeekNo]; // undefined in the final week

/** Only content whose week has unlocked. Future weeks are never shown to members. */
export function unlocked<T extends { week: number }>(items: T[]): T[] {
  return items.filter((i) => i.week <= currentWeekNo);
}
export function hasMoreToCome(items: { week: number }[]): boolean {
  return items.some((i) => i.week > currentWeekNo);
}

// ---------- admin ----------
export const adminKpis = {
  registeredPaid: 148, pctOfActive: 62,
  hit3Last: 97, pctOfParticipants: 66,
  toApprove: 23, followUps: 11,
  collected: "$2,220.00", startedUnpaid: 9,
  lastRosterSync: "Today 6:42am",
};

export const followUps = [
  { name: "Chris M.", last: "12 Dec", week: "0/3", flags: ["No session in 7 days", "Not opening app"] },
  { name: "Priya N.", last: "18 Dec", week: "0/3", flags: ["Behind this week"] },
  { name: "Dan H.", last: "20 Dec", week: "1/3", flags: ["Away until 3 Jan"], away: true },
  { name: "Ellie F.", last: "16 Dec", week: "0/3", flags: ["No session in 7 days"] },
];

export const singletSizes = ["XS", "S", "M", "L", "XL", "2XL+"];
export const singletOrder = [
  { label: "Women's · Cream", counts: [4, 13, 17, 9, 3, 1] },
  { label: "Women's · Charcoal", counts: [2, 9, 14, 8, 4, 1] },
  { label: "Men's · Cream", counts: [0, 2, 7, 9, 5, 3] },
  { label: "Men's · Charcoal", counts: [0, 3, 11, 12, 7, 4] },
];

export const payments = [
  { name: "Jess Smith", status: "Paid", when: "12 Nov", amount: "$15.00" },
  { name: "Tom Baker", status: "Paid", when: "12 Nov", amount: "$15.00" },
  { name: "Ava Lee", status: "Started, not paid", when: "13 Nov", amount: "—" },
  { name: "Ryan Cole", status: "Paid", when: "13 Nov", amount: "$15.00" },
];
