"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ViewSwitch from "@/components/ViewSwitch";

const LINKS = [
  { href: "/admin", label: "Owner home" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/checkin", label: "Check-in" },
  { href: "/admin/leaderboard", label: "Leaderboard" },
  { href: "/admin/rewards", label: "Rewards" },
  { href: "/admin/missions", label: "Missions" },
  { href: "/admin/members", label: "Members" },
];

// The backend's top menu, shown on every staff page (the layout only renders it for staff).
export default function AdminNav() {
  const path = usePathname();
  return (
    <div className="admin-bar">
      <nav className="admin-nav" aria-label="Staff">
        {LINKS.map((l) => {
          const on = l.href === "/admin" ? path === "/admin" : path.startsWith(l.href);
          return <Link key={l.href} href={l.href} className={on ? "on" : ""} aria-current={on ? "page" : undefined}>{l.label}</Link>;
        })}
      </nav>
      <ViewSwitch current="owner" />
    </div>
  );
}
