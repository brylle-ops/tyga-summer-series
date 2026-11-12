import Link from "next/link";
import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import { Screen, TopNav } from "@/components/ui";
import { getCurrentMember } from "@/lib/session";

// Returning members: log in (no joining steps, no payment). Only existing accounts get a link.
export default async function Login() {
  if (await getCurrentMember()) redirect("/home");
  return (
    <Screen>
      <TopNav title="Log in" back="/" />
      <div style={{ marginTop: 6 }}>
        <div className="eyebrow">TYGA Summer Series</div>
        <div className="h1" style={{ marginTop: 6 }}>Welcome back.</div>
      </div>
      <p className="sm mute">Enter the email you joined with and we&apos;ll send you a sign-in link.</p>
      <LoginForm />
      <p className="xs mute" style={{ textAlign: "center" }}>
        Not in yet? <Link href="/join/sign-in" className="link">Join the Summer Series</Link>
      </p>
    </Screen>
  );
}
