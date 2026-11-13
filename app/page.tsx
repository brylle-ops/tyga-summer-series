import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/session";
import WelcomeRunner from "@/components/WelcomeRunner";
import { Screen, Sky, Wordmark } from "@/components/ui";

// Welcome — the running 3D character, with a Women's / Men's choice
export default async function Welcome() {
  if (await getCurrentMember()) redirect("/home"); // already signed in: never ask for a code again
  return (
    <Screen className="welcome">
      <Sky hills={230} />
      <div className="top"><Wordmark size={54} /></div>
      <WelcomeRunner />
      <div className="foot">
        <div className="tag">MAINTAIN THE STANDARD</div>
        <p className="sm" style={{ textAlign: "center", color: "rgba(250,250,250,.82)", marginBottom: 6 }}>
          Stay moving, stay connected, and get rewarded for showing up this summer.
        </p>
        <Link href="/shop" className="btn">Shop the Summer Series</Link>
        <Link href="/login" className="btn ghost" style={{ height: 46, fontSize: 14 }}>Sign-in</Link>
      </div>
    </Screen>
  );
}
