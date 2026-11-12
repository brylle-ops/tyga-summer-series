export type Fit = "women" | "men";
export type Colour = "cream" | "charcoal";
export const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"] as const;
export type Size = (typeof SIZES)[number];

/** Singlet choices (and new sign-ups) close at the end of 30 Nov, Albury time. */
export const SINGLET_LOCK_AT = new Date("2026-12-01T00:00:00+11:00");
export function isSingletLocked(now: Date): boolean {
  return now.getTime() >= SINGLET_LOCK_AT.getTime();
}

export const GOALS = ["Maintain my fitness", "Stay consistent over Christmas", "Keep my strength", "Start February strong"] as const;
export function isGoal(v: string): boolean {
  return (GOALS as readonly string[]).includes(v);
}

const FIT_LABEL: Record<Fit, string> = { women: "Women's", men: "Men's" };
export const COLOUR_LABEL: Record<Colour, string> = { cream: "Cream", charcoal: "Charcoal wash" };

/** "Women's M · Cream" — used on screens, in Square's payment note and on the ticket. */
export function singletLabel(fit: Fit, colour: Colour, size?: Size | null): string {
  return `${FIT_LABEL[fit]}${size ? ` ${size}` : ""} · ${COLOUR_LABEL[colour]}`;
}

/** The 3D runner calls the fits "womens"/"mens"; the database says "women"/"men". */
export function fromUiFit(v: string): Fit | null {
  return v === "womens" || v === "women" ? "women" : v === "mens" || v === "men" ? "men" : null;
}
export function toUiFit(f: Fit): "womens" | "mens" {
  return f === "women" ? "womens" : "mens";
}

export function parseSingletInput(form: FormData): { fit: Fit; colour: Colour; size: Size } | null {
  const fit = fromUiFit(String(form.get("fit") ?? ""));
  const colour = String(form.get("colour") ?? "");
  const size = String(form.get("size") ?? "");
  if (!fit || (colour !== "cream" && colour !== "charcoal") || !(SIZES as readonly string[]).includes(size)) return null;
  return { fit, colour, size: size as Size };
}
