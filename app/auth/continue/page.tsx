import { Screen, Wordmark } from "@/components/ui";
import SubmitOnce from "@/components/SubmitOnce";
import { confirmLink } from "./actions";

export const metadata = { robots: { index: false } };

// Landing page for the email link: one tap to sign in
export default async function Continue({ searchParams }: { searchParams: Promise<{ token_hash?: string; type?: string; next?: string }> }) {
  const q = await searchParams;
  return (
    <Screen>
      <div style={{ marginTop: 40, display: "grid", placeItems: "center" }}><Wordmark short size={40} /></div>
      <div style={{ textAlign: "center", marginTop: 20 }}>
        <div className="h1">You&apos;re nearly in</div>
        <p className="sm mute" style={{ marginTop: 8 }}>Tap below to finish signing in on this device.</p>
      </div>
      <div style={{ flex: 1 }} />
      <form action={confirmLink}>
        <input type="hidden" name="token_hash" value={q.token_hash ?? ""} />
        <input type="hidden" name="type" value={q.type ?? "email"} />
        <input type="hidden" name="next" value={q.next ?? ""} />
        <SubmitOnce pendingText="Signing you in…">Continue</SubmitOnce>
      </form>
    </Screen>
  );
}
