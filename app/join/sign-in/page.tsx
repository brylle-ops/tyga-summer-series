import { redirect } from "next/navigation";
import JoinSteps from "@/components/JoinSteps";
import SignInForm from "@/components/SignInForm";
import { Screen, TopNav } from "@/components/ui";
import { getCurrentMember } from "@/lib/session";

// Join · step 1: email magic link, checked against the gym's member list
export default async function SignIn() {
  if (await getCurrentMember()) redirect("/join/commit");
  return (
    <Screen>
      <TopNav title="Join the Summer Series" back="/" />
      <JoinSteps current={1} />
      <div style={{ marginTop: 6 }}>
        <div className="eyebrow">Sign in with email</div>
        <div className="h1" style={{ marginTop: 6 }}>
          No passwords.<br /><span className="script" style={{ fontSize: 34 }}>just a link</span>
        </div>
      </div>
      <p className="sm mute">
        Yard members: use the email that&apos;s on your membership. We&apos;ll send you a link that signs you straight in.
      </p>
      <SignInForm />
      <p className="xs mute" style={{ textAlign: "center" }}>
        Open to Yard members and friends. See how we use your info: <a href="/privacy" className="link">Privacy</a>
      </p>
    </Screen>
  );
}
