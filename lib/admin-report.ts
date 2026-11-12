import { SIZES, singletLabel, type Colour, type Fit } from "@/lib/singlet";
import type { Registration } from "@/lib/types";

type Reg = Pick<Registration, "fit" | "colour" | "size" | "payment_status" | "amount_cents">;
const ROWS: [Fit, Colour][] = [["women", "cream"], ["women", "charcoal"], ["men", "cream"], ["men", "charcoal"]];

/** Singlet order by fit · colour × size — paid registrations only. */
export function buildSingletGrid(regs: Reg[]) {
  return ROWS.map(([fit, colour]) => {
    const counts = SIZES.map((s) => regs.filter((r) => r.payment_status === "paid" && r.fit === fit && r.colour === colour && r.size === s).length);
    return { label: singletLabel(fit, colour), counts, total: counts.reduce((a, b) => a + b, 0) };
  });
}

export function toSupplierCsv(grid: ReturnType<typeof buildSingletGrid>): string {
  const lines = [["Fit", "Colour", ...SIZES, "Total"].join(",")];
  for (const r of grid) {
    const [fit, colour] = r.label.split(" · ");
    lines.push([fit, colour, ...r.counts, r.total].join(","));
  }
  const totals = SIZES.map((_, i) => grid.reduce((a, r) => a + r.counts[i], 0));
  lines.push(["Total", "", ...totals, totals.reduce((a, b) => a + b, 0)].join(","));
  return lines.join("\r\n") + "\r\n";
}

export function paymentSummary(regs: Reg[]) {
  const paid = regs.filter((r) => r.payment_status === "paid");
  return {
    paid: paid.length,
    pendingOrUnpaid: regs.filter((r) => r.payment_status === "pending" || (r.payment_status === "unpaid" && r.size)).length,
    collectedCents: paid.reduce((a, r) => a + (r.amount_cents ?? 0), 0),
  };
}
