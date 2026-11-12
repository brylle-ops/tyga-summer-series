import { redirect } from "next/navigation";
import SingletPicker from "@/components/SingletPicker";
import { Screen, TopNav } from "@/components/ui";
import { getCurrentMember, supabaseReady } from "@/lib/session";
import { toUiFit } from "@/lib/singlet";

const ERRORS: Record<string, string> = {
  choice: "Pick a fit, colour and size.",
  save: "We couldn't save that just now — please try again.",
};

// Join · step 3: singlet fit, colour and size — the runner follows the choices
export default async function Singlet({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const me = await getCurrentMember();
  if (supabaseReady() && !me) redirect("/login?next=/join/singlet");
  const reg = me?.registration;
  return (
    <Screen>
      <TopNav title="Your singlet" back="/shop" />
      {error && ERRORS[error] && <p className="notice" role="alert">{ERRORS[error]}</p>}
      <SingletPicker
        paid={reg?.payment_status === "paid"}
        initial={reg ? { fit: reg.fit ? toUiFit(reg.fit) : undefined, colour: reg.colour ?? undefined, size: reg.size } : undefined}
      />
    </Screen>
  );
}
