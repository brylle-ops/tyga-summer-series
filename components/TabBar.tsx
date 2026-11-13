"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./Icons";

const TABS: { href: string; label: string; icon: IconName }[] = [
  { href: "/home", label: "Home", icon: "home" },
  { href: "/missions", label: "Missions", icon: "target" },
  { href: "/log", label: "Log", icon: "plus" },
  { href: "/ranks", label: "Ranks", icon: "trophy" },
  { href: "/shop", label: "Shop", icon: "shirt" },
];

export default function TabBar() {
  const path = usePathname();
  return (
    <nav className="tabs" aria-label="Main">
      {TABS.map((t) => (
        <Link key={t.href} href={t.href} className={path === t.href ? "on" : ""}
          aria-current={path === t.href ? "page" : undefined}>
          <Icon name={t.icon} />{t.label}
        </Link>
      ))}
    </nav>
  );
}
