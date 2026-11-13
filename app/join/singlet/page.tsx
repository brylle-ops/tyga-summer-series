import SingletProduct from "@/components/SingletProduct";
import { Screen, TopNav } from "@/components/ui";
import { getCurrentMember } from "@/lib/session";
import { toUiFit } from "@/lib/singlet";

const ERRORS: Record<string, string> = {
  choice: "Pick a fit, colour and size.",
  save: "We couldn't save that just now. Please try again.",
};
const FITS = ["womens", "mens"] as const;
const COLOURS = ["cream", "charcoal"] as const;
const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"] as const;
const pick = <T extends string>(list: readonly T[], v?: string) => list.find((x) => x === v);

// Singlet product page. Anyone can browse; signing in happens when they go to checkout.
export default async function Singlet({ searchParams }: { searchParams: Promise<{ error?: string; fit?: string; colour?: string; size?: string }> }) {
  const q = await searchParams;
  const me = await getCurrentMember();
  const reg = me?.registration;
  const initial = reg?.fit || reg?.colour || reg?.size
    ? { fit: reg.fit ? toUiFit(reg.fit) : undefined, colour: reg.colour ?? undefined, size: reg.size }
    : { fit: pick(FITS, q.fit), colour: pick(COLOURS, q.colour), size: pick(SIZES, q.size) };
  return (
    <Screen bodyStyle={{ gap: 12 }}>
      <TopNav title="Summer Series singlet" back="/" />
      {q.error && ERRORS[q.error] && <p className="notice" role="alert">{ERRORS[q.error]}</p>}
      <SingletProduct paid={reg?.payment_status === "paid"} initial={initial} />
    </Screen>
  );
}
