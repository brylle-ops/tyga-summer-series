"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./Icons";

const TABS: { href: string; label: string; icon?: IconName; also?: string[] }[] = [
  { href: "/home", label: "Home", icon: "home" },
  { href: "/missions", label: "Missions", icon: "target" },
  { href: "/ranks", label: "Leaderboard", icon: "trophy" },
  { href: "/perks", label: "Perks", icon: "gift" },
  { href: "/more", label: "More", also: ["/log", "/activity", "/nutrition", "/holiday", "/resources", "/rules", "/points", "/overview", "/shop", "/levels"] },
];

export default function TabBar() {
  const path = usePathname();
  return (
    <nav className="tabs" aria-label="Main">
      {TABS.map((t) => {
        const on = path === t.href || Boolean(t.also?.some((p) => path === p || path.startsWith(`${p}/`)));
        return (
          <Link key={t.href} href={t.href} className={on ? "on" : ""} aria-current={on ? "page" : undefined}>
            {t.icon ? <Icon name={t.icon} /> : <span className="dots" aria-hidden="true">•••</span>}{t.label}
          </Link>
        );
      })}
    </nav>
  );
}
