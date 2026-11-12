import type { IconName } from "@/components/Icons";

// Perks unlock by level. Partner names are placeholders until Amy confirms local businesses.
export const PERKS: { key: string; level: number; week: number; icon: IconName; title: string; partner: string; art: string }[] = [
  { key: "coffee", level: 2, week: 1, icon: "cup", title: "Free coffee upgrade", partner: "Local partner café · Albury", art: "linear-gradient(140deg,#6b5440,#2f2b26)" },
  { key: "draw", level: 3, week: 1, icon: "gift", title: "Prize draw entry", partner: "TYGA · drawn at the finale", art: "linear-gradient(140deg,#5c5547,#2f2b26)" },
  { key: "massage", level: 4, week: 1, icon: "hand", title: "$20 off a massage", partner: "Local wellness partner", art: "linear-gradient(140deg,#7b4a43,#2f2b26)" },
  { key: "recovery", level: 5, week: 2, icon: "snow", title: "Recovery Room session", partner: "TYGA", art: "linear-gradient(140deg,#3b4a55,#2f2b26)" },
];
export const perkCode = (key: string, memberNo: number | null) => `SUMMER-${key.slice(0, 3).toUpperCase()}-${String(memberNo ?? 0).padStart(3, "0")}`;
