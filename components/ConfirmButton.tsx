"use client";

// Submit button that asks "are you sure?" first; cancelling stops the form submit.
export default function ConfirmButton({ message, children, className }: { message: string; children: React.ReactNode; className?: string }) {
  return <button className={className} type="submit" onClick={(e) => { if (!window.confirm(message)) e.preventDefault(); }}>{children}</button>;
}
