"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Re-checks every few seconds while Square confirms the payment.
export default function AutoRefresh({ seconds = 3, max = 20 }: { seconds?: number; max?: number }) {
  const router = useRouter();
  const [tries, setTries] = useState(0);
  useEffect(() => {
    if (tries >= max) return;
    const t = setTimeout(() => { router.refresh(); setTries((n) => n + 1); }, seconds * 1000);
    return () => clearTimeout(t);
  }, [tries, max, seconds, router]);
  if (tries < max) return null;
  return <p className="notice">Still confirming with Square. If you&apos;ve paid, you can close this page — your ticket will be here next time you open the app.</p>;
}
