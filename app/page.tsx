import Link from "next/link";
import WelcomeRunner from "@/components/WelcomeRunner";
import { Screen, Sky, Wordmark } from "@/components/ui";

// Welcome — the running 3D character, with a Women's / Men's choice
export default function Welcome() {
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
        <Link href="/join/sign-in" className="btn">Join the Summer Series · $15</Link>
        <Link href="/home" className="btn ghost" style={{ height: 46, fontSize: 14 }}>I&apos;ve already joined</Link>
      </div>
    </Screen>
  );
}
