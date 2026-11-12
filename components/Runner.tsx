"use client";

import { useEffect, useRef } from "react";

// The 3D runner wearing the singlet (Three.js bundle in /public/runner,
// Microsoft Rocketbox avatars, MIT licence). The bundle defines a global
// `mountRunner(el, opts)`; we load it once and mount into this div. `spin: false` holds the
// chosen angle (no slow auto-turn); members can still drag to turn it.

export type Fit = "womens" | "mens";
export type Colour = "cream" | "charcoal";
type RunnerHandle = { setFit(f: Fit): void; setColour(c: Colour): void; destroy(): void };

declare global {
  interface Window {
    mountRunner?: (el: HTMLElement, opts: { base: string; fit: Fit; colour: Colour; yaw: number; spin?: boolean }) => RunnerHandle;
  }
}

let loading: Promise<void> | null = null;
function loadBundle(): Promise<void> {
  if (window.mountRunner) return Promise.resolve();
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "/runner/runner.bundle.js";
      s.onload = () => resolve();
      s.onerror = () => { loading = null; reject(new Error("runner bundle failed to load")); };
      document.head.appendChild(s);
    });
  }
  return loading;
}

export default function Runner({ fit, colour, yaw }: { fit: Fit; colour: Colour; yaw: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const handle = useRef<RunnerHandle | null>(null);
  const latest = useRef({ fit, colour });
  latest.current = { fit, colour };

  useEffect(() => {
    let cancelled = false;
    const el = ref.current;
    if (!el) return;
    loadBundle()
      .then(() => {
        if (cancelled || !window.mountRunner) return;
        // Use the latest choice in case the member switched while the bundle loaded.
        handle.current = window.mountRunner(el, { base: "/runner/", ...latest.current, yaw, spin: false });
      })
      .catch(() => {
        if (!cancelled) el.innerHTML = '<div class="still">3D preview unavailable</div>';
      });
    return () => {
      cancelled = true;
      handle.current?.destroy();
      handle.current = null;
    };
    // mount once; fit/colour changes are applied below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { handle.current?.setFit(fit); }, [fit]);
  useEffect(() => { handle.current?.setColour(colour); }, [colour]);

  return <div ref={ref} className="runner-mount" />;
}
