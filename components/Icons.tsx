// One SVG sprite for the whole app (palm, tab icons, check-in icons, hills).
// Render <IconSprite /> once in the root layout, then use <Icon name="home" /> anywhere.

export type IconName =
  | "home" | "plus" | "target" | "trophy" | "gift" | "db" | "run" | "sun" | "leaf"
  | "bed" | "cam" | "check" | "lock" | "cup" | "hand" | "snow" | "bowl" | "plane"
  | "drop" | "bell" | "people" | "back" | "chev" | "star" | "shirt" | "insta" | "flame"
  | "user" | "calendar" | "info" | "trophy-sm";

export function Icon({ name, className, size, style }: {
  name: IconName; className?: string; size?: number; style?: React.CSSProperties;
}) {
  return (
    <svg className={className} width={size} height={size} style={style} aria-hidden="true">
      <use href={`#i-${name}`} />
    </svg>
  );
}

export function IconSprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <symbol id="palm" viewBox="0 0 100 100"><path d="M50 44 C47 62 46 80 44 98 L52 98 C53 80 53 62 52 44 Z" fill="currentColor"/><g fill="currentColor"><path d="M51 44 C40 30 22 30 8 40 C24 34 38 36 51 46Z"/><path d="M51 44 C62 30 80 30 94 40 C78 34 64 36 51 46Z"/><path d="M51 44 C44 26 30 16 16 16 C30 22 42 30 50 46Z"/><path d="M51 44 C58 26 72 16 86 16 C72 22 60 30 52 46Z"/><path d="M51 44 C50 30 46 16 38 8 C48 16 53 30 52 46Z"/><path d="M51 44 C38 40 26 48 20 60 C30 50 40 46 51 46Z"/><path d="M51 44 C64 40 76 48 82 60 C72 50 62 46 51 46Z"/></g></symbol>
      <symbol id="i-home" viewBox="0 0 24 24"><path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></symbol>
      <symbol id="i-plus" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.7"/><path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></symbol>
      <symbol id="i-target" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.7"/><circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.7"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></symbol>
      <symbol id="i-trophy" viewBox="0 0 24 24"><path d="M7 4h10v5a5 5 0 01-10 0zM7 6H4v2a3 3 0 003 3M17 6h3v2a3 3 0 01-3 3M12 14v4M8 20h8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></symbol>
      <symbol id="i-gift" viewBox="0 0 24 24"><path d="M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7c-2-4-6-3-5 0M12 7c2-4 6-3 5 0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></symbol>
      <symbol id="i-db" viewBox="0 0 24 24"><path d="M3 10v4M6 8v8M18 8v8M21 10v4M6 12h12" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></symbol>
      <symbol id="i-run" viewBox="0 0 24 24"><circle cx="14" cy="4.5" r="2" fill="currentColor"/><path d="M8 21l3-6 3 2v5M6 12l3-4 4 1 2 4 3 1M11 15l2-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></symbol>
      <symbol id="i-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.7"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6L19 19M5 19l1.4-1.4M17.6 6.4L19 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></symbol>
      <symbol id="i-leaf" viewBox="0 0 24 24"><path d="M5 19C5 9 11 5 20 4c-1 9-5 15-15 15zM5 19l7-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></symbol>
      <symbol id="i-bed" viewBox="0 0 24 24"><path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 00-3-3h-7v5M6.5 11.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></symbol>
      <symbol id="i-cam" viewBox="0 0 24 24"><path d="M4 8h3l2-2h6l2 2h3v11H4z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><circle cx="12" cy="13" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.7"/></symbol>
      <symbol id="i-check" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></symbol>
      <symbol id="i-lock" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7"/><path d="M8 11V8a4 4 0 018 0v3" fill="none" stroke="currentColor" strokeWidth="1.7"/></symbol>
      <symbol id="i-cup" viewBox="0 0 24 24"><path d="M4 9h13v5a5 5 0 01-5 5H9a5 5 0 01-5-5zM17 10h1.5a2.5 2.5 0 010 5H17M8 3c0 2 2 2 2 4M12 3c0 2 2 2 2 4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></symbol>
      <symbol id="i-hand" viewBox="0 0 24 24"><path d="M7 11V6.5a1.5 1.5 0 013 0V11M10 10V4.5a1.5 1.5 0 013 0V10M13 10V5.5a1.5 1.5 0 013 0V12M16 11v-1.5a1.5 1.5 0 013 0V14a7 7 0 01-7 7h-1a6 6 0 01-5-3l-2.5-4.3a1.5 1.5 0 012.6-1.5L7 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></symbol>
      <symbol id="i-snow" viewBox="0 0 24 24"><path d="M12 2v20M4 7l16 10M20 7L4 17M9 3l3 3 3-3M9 21l3-3 3 3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></symbol>
      <symbol id="i-bowl" viewBox="0 0 24 24"><path d="M3 11h18a9 9 0 01-18 0zM8 7c0-2 2-2 2-4M13 7c0-2 2-2 2-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></symbol>
      <symbol id="i-plane" viewBox="0 0 24 24"><path d="M10 14l-6 5h3l6-4 2 5 2-1-1-6 5-4a1.5 1.5 0 00-2-2l-4 3-6-1-1 2 5 2-3 1" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></symbol>
      <symbol id="i-drop" viewBox="0 0 24 24"><path d="M12 3s7 7.5 7 12a7 7 0 01-14 0c0-4.5 7-12 7-12z" fill="none" stroke="currentColor" strokeWidth="1.7"/></symbol>
      <symbol id="i-bell" viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0112 0v5l2 2H4zM10 20a2 2 0 004 0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></symbol>
      <symbol id="i-people" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.7"/><path d="M3 20a6 6 0 0112 0M16 5a3 3 0 010 6M18 20a5 5 0 00-2-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></symbol>
      <symbol id="i-back" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></symbol>
      <symbol id="i-chev" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></symbol>
      <symbol id="i-star" viewBox="0 0 24 24"><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></symbol>
      <symbol id="i-shirt" viewBox="0 0 24 24"><path d="M8 3l-5 3 2 4 2-1v12h10V9l2 1 2-4-5-3c0 2-1.5 3-4 3S8 5 8 3z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></symbol>
      <symbol id="i-insta" viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" strokeWidth="1.7"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.7"/><circle cx="17" cy="7" r="1.1" fill="currentColor"/></symbol>
      <symbol id="i-flame" viewBox="0 0 24 24"><path d="M12 21c-4 0-6.5-2.6-6.5-6.2 0-3.3 2.3-5.4 3.6-7.6.4 1.7 1.4 2.8 2.4 3.3C11.5 7 13 4.3 15 3c-.3 2.6.7 4.4 2 6 1 1.3 1.5 2.6 1.5 4.6C18.5 18.2 16 21 12 21z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></symbol>
      <symbol id="i-user" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.7"/><circle cx="12" cy="10" r="3" fill="none" stroke="currentColor" strokeWidth="1.7"/><path d="M6.5 18.5c1.3-2.2 3.2-3.3 5.5-3.3s4.2 1.1 5.5 3.3" fill="none" stroke="currentColor" strokeWidth="1.7"/></symbol>
      <symbol id="i-calendar" viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7"/><path d="M4 10h16M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></symbol>
      <symbol id="i-info" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.7"/><path d="M12 11v6M12 7.5v.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></symbol>
      <symbol id="i-trophy-sm" viewBox="0 0 24 24"><path d="M7 4h10v5a5 5 0 01-10 0zM7 6H4v2a3 3 0 003 3M17 6h3v2a3 3 0 01-3 3M12 14v4M8 20h8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></symbol>
      <symbol id="hills" viewBox="0 0 400 120" preserveAspectRatio="none"><path d="M0 70 C60 40 110 55 160 62 C220 70 260 30 320 38 C360 44 385 58 400 54 V120 H0Z" fill="#2a1f1d" opacity=".75"/><path d="M0 92 C70 70 130 84 200 86 C270 88 320 70 400 78 V120 H0Z" fill="#1a1513"/></symbol>
    </svg>
  );
}
