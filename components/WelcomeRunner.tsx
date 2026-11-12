"use client";

import { useState } from "react";
import Runner, { type Fit } from "./Runner";

// Welcome screen runner with a Women's / Men's switch.
export default function WelcomeRunner() {
  const [fit, setFit] = useState<Fit>("womens");
  return (
    <>
      <div className="stage"><Runner fit={fit} colour={fit === "womens" ? "cream" : "charcoal"} yaw={-35} /></div>
      <div className="runner-switch" role="group" aria-label="Choose a runner">
        <button type="button" aria-pressed={fit === "womens"} onClick={() => setFit("womens")}>Women&apos;s</button>
        <button type="button" aria-pressed={fit === "mens"} onClick={() => setFit("mens")}>Men&apos;s</button>
      </div>
    </>
  );
}
