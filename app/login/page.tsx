import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import { Screen, TopNav } from "@/components/ui";
import { getCurrentMember } from "@/lib/session";
import { safeNext } from "@/lib/signin";

// Sign-in for everyone: any email gets a one-time link, and new emails get an account. No payment.
export default async function Login({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next, "/home");
  if (await getCurrentMember()) redirect(next);
  return (
    <Screen>
      <TopNav title="Sign in" back="/" />
      <div style={{ marginTop: 6 }}>
        <div className="eyebrow">TYGA Summer Series</div>
        <div className="h1" style={{ marginTop: 6 }}>
          No passwords.<br /><span className="script" style={{ fontSize: 34 }}>just a link</span>
        </div>
      </div>
      <p className="sm mute">Enter your email and we&apos;ll send you a link that signs you straight in. New here? Same link, it sets you up.</p>
      <LoginForm next={next} />
      <p className="xs mute" style={{ textAlign: "center" }}>
        See how we use your info: <a href="/privacy" className="link">Privacy</a>
      </p>
    </Screen>
  );
}
