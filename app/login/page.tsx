import Link from "next/link";
import { redirect } from "next/navigation";
import SignInForm from "@/components/SignInForm";
import { Screen, TopNav } from "@/components/ui";
import { getCurrentMember } from "@/lib/session";
import { signInWithGoogle } from "../join/sign-in/actions";

const ERRORS: Record<string, string> = {
  google: "Google sign-in isn't available right now — use the email link instead.",
  setup: "Sign-in isn't set up yet.",
};

// Returning members: log in (no joining steps, no payment)
export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  if (await getCurrentMember()) redirect("/home");
  return (
    <Screen>
      <TopNav title="Log in" back="/" />
      <div style={{ marginTop: 6 }}>
        <div className="eyebrow">TYGA Summer Series</div>
        <div className="h1" style={{ marginTop: 6 }}>Welcome back.</div>
      </div>
      <p className="sm mute">Log in with the same Google account or email you joined with.</p>
      {error && ERRORS[error] && <p className="notice" role="alert">{ERRORS[error]}</p>}
      <form action={signInWithGoogle}>
        <input type="hidden" name="next" value="/home" />
        <button type="submit" className="btn" style={{ background: "#fff", color: "#1f1f1f" }}>
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
          </svg>
          Continue with Google
        </button>
      </form>
      <div className="li xs mute" style={{ gap: 10 }}><span className="grow" style={{ height: 1, background: "var(--line)" }} />or<span className="grow" style={{ height: 1, background: "var(--line)" }} /></div>
      <SignInForm next="/home" label="Email me a sign-in link" />
      <p className="xs mute" style={{ textAlign: "center" }}>
        Not in yet? <Link href="/join/sign-in" className="link">Join the Summer Series</Link>
      </p>
    </Screen>
  );
}
