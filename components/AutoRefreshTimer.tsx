"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Re-reads the page's data every `seconds` while the tab is visible. Cleared when the page is left.
export default function AutoRefreshTimer({ seconds = 30 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => { if (!document.hidden) router.refresh(); }, seconds * 1000);
    return () => clearInterval(t);
  }, [router, seconds]);
  return null;
}
