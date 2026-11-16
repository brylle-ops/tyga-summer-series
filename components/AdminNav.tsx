"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/leaderboard", label: "Leaderboard" },
  { href: "/admin/rewards", label: "Rewards" },
  { href: "/home", label: "Member app ›" },
];

// The backend's top menu, shown on every staff page.
export default function AdminNav() {
  const path = usePathname();
  return (
    <nav className="admin-nav" aria-label="Staff">
      {LINKS.map((l) => {
        const on = l.href === "/admin" ? path === "/admin" : path.startsWith(l.href);
        return <Link key={l.href} href={l.href} className={on ? "on" : ""} aria-current={on ? "page" : undefined}>{l.label}</Link>;
      })}
    </nav>
  );
}
