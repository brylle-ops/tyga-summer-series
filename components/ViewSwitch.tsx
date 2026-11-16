import Link from "next/link";

// Staff only: flips between the member app and the owner (POS) view. Callers must only render it for staff.
export default function ViewSwitch({ current, top = false }: { current: "member" | "owner"; top?: boolean }) {
  return (
    <nav className={top ? "viewswitch member-top" : "viewswitch"} aria-label="Switch view">
      <Link href="/home" className={current === "member" ? "on" : ""} aria-current={current === "member" ? "true" : undefined}>Member view</Link>
      <Link href="/admin" className={current === "owner" ? "on" : ""} aria-current={current === "owner" ? "true" : undefined}>Owner view</Link>
    </nav>
  );
}
