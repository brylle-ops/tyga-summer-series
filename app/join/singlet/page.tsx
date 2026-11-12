import { redirect } from "next/navigation";
import JoinSteps from "@/components/JoinSteps";
import SingletPicker from "@/components/SingletPicker";
import { Screen, TopNav } from "@/components/ui";
import { getCurrentMember, supabaseReady } from "@/lib/session";
import { isSingletLocked, toUiFit } from "@/lib/singlet";

const ERRORS: Record<string, string> = {
  choice: "Pick a fit, colour and size.",
  save: "We couldn't save that just now — please try again.",
};

// Join · step 3: singlet fit, colour and size — the runner follows the choices
export default async function Singlet({ searchParams }: { searchParams: Promise<{ error?: string; locked?: string }> }) {
  const { error, locked } = await searchParams;
  const me = await getCurrentMember();
  if (supabaseReady() && !me) redirect("/join/sign-in");
  const reg = me?.registration;
  const closed = Boolean(locked) || isSingletLocked(new Date());
  return (
    <Screen>
      <TopNav title="Your singlet" back={reg?.payment_status === "paid" ? "/join/confirmed" : "/join/commit"} />
      <JoinSteps current={3} />
      {closed && <p className="notice" role="alert">Singlet choices closed on 30 Nov.</p>}
      {error && ERRORS[error] && <p className="notice" role="alert">{ERRORS[error]}</p>}
      <SingletPicker
        locked={closed}
        paid={reg?.payment_status === "paid"}
        initial={reg ? { fit: reg.fit ? toUiFit(reg.fit) : undefined, colour: reg.colour ?? undefined, size: reg.size } : undefined}
      />
    </Screen>
  );
}
