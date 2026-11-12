import type { Profile, Registration } from "@/lib/types";
import { singletLabel } from "@/lib/singlet";

type Reg = Pick<Registration, "fit" | "colour" | "size" | "payment_status">;

/** What stops this member paying right now (null = good to go). */
export function checkoutBlocker(reg: Reg | null, _now?: Date): "no_singlet" | "no_size" | "paid" | null {
  if (reg?.payment_status === "paid") return "paid";
  if (!reg?.fit || !reg.colour) return "no_singlet";
  if (!reg.size) return "no_size";
  return null;
}

/** Shown on the payment in Square: "#148 Jess Smith · Women's M · Cream". */
export function paymentNote(profile: Pick<Profile, "member_no" | "first_name" | "last_name" | "email">, reg: Reg): string {
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.email;
  return `#${profile.member_no} ${name} · ${singletLabel(reg.fit!, reg.colour!, reg.size)}`;
}
