import Link from "next/link";
import JoinSteps from "@/components/JoinSteps";
import { Screen, TopNav } from "@/components/ui";

// After "Send my sign-in link" — or when a link has expired
export default async function CheckEmail({ searchParams }: { searchParams: Promise<{ expired?: string; not_member?: string }> }) {
  const { expired, not_member } = await searchParams;
  return (
    <Screen>
      <TopNav title="Join the Summer Series" back="/join/sign-in" />
      <JoinSteps current={1} />
      {not_member ? (
        <p className="notice" role="alert" style={{ marginTop: 6 }}>We couldn&apos;t find your membership — check with the front desk</p>
      ) : expired ? (
        <>
          <div className="h1" style={{ marginTop: 6 }}>That link has expired</div>
          <p className="notice" role="alert">That link has expired or was already used — enter your email again.</p>
        </>
      ) : (
        <>
          <div className="eyebrow" style={{ marginTop: 6 }}>Nearly there</div>
          <div className="h1">Check your email</div>
          <p className="sm mute">
            We sent a sign-in link to your inbox. It works once and expires in 1 hour.
            Open it on this phone to keep going. Can&apos;t see it? Check your junk folder.
          </p>
        </>
      )}
      <div style={{ flex: 1 }} />
      <Link href="/join/sign-in" className={`btn ${expired ? "" : "ghost"}`}>{expired ? "Send a new link" : "Use a different email"}</Link>
    </Screen>
  );
}
