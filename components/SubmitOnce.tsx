"use client";

import { useFormStatus } from "react-dom";

/** Submit button that greys out after one tap, so a slow page can't be submitted twice. */
export default function SubmitOnce({ children, pendingText = "One moment…" }: { children: React.ReactNode; pendingText?: string }) {
  const { pending } = useFormStatus();
  return <button type="submit" className="btn" disabled={pending}>{pending ? pendingText : children}</button>;
}
