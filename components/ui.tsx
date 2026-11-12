import Link from "next/link";
import { Icon } from "./Icons";
import TabBar from "./TabBar";

/** Full-height app screen. `tabs` adds the bottom tab bar. */
export function Screen({ children, tabs = false, className = "", bodyStyle }: {
  children: React.ReactNode; tabs?: boolean; className?: string; bodyStyle?: React.CSSProperties;
}) {
  return (
    <div className={`app ${tabs ? "has-tabs" : ""} ${className}`}>
      <main className="body" style={bodyStyle}>{children}</main>
      {tabs && <TabBar />}
    </div>
  );
}

/** Centered screen title with an optional back link. */
export function TopNav({ title, back }: { title: string; back?: string }) {
  return (
    <div className="nav">
      {back && <Link href={back} className="back" aria-label="Back">‹</Link>}
      {title}
    </div>
  );
}

/** TYGA / 2026 / Summer / SERIES wordmark from the singlet print. */
export function Wordmark({ size = 54, short = false }: { size?: number; short?: boolean }) {
  if (short) {
    return (
      <div className="wm" style={{ fontSize: size }}>
        <span className="ty">TYGA</span><span className="su" style={{ fontSize: ".8em" }}>Summer</span>
      </div>
    );
  }
  return (
    <div className="wm" style={{ fontSize: size }} aria-label="TYGA 2026 Summer Series">
      <svg className="palm" aria-hidden="true"><use href="#palm" /></svg>
      <span className="ty">TYGA</span>
      <span className="yr"><i />2026<i /></span>
      <span className="su">Summer</span>
      <span className="se">SERIES</span>
    </div>
  );
}

/** Dark backdrop with a soft glow and optional hills. */
export function Sky({ hills, background }: { hills?: number; background?: string }) {
  return (
    <div className="sky" style={background ? { background } : undefined}>
      {hills && (
        <svg viewBox="0 0 400 120" height={hills} preserveAspectRatio="none" aria-hidden="true">
          <use href="#hills" />
        </svg>
      )}
    </div>
  );
}

export function Tick({ on = false }: { on?: boolean }) {
  return <span className={`tick ${on ? "on" : ""}`}>{on && <Icon name="check" />}</span>;
}

export function Pill({ children, done = false }: { children: React.ReactNode; done?: boolean }) {
  return <span className={`pill ${done ? "done" : ""}`}>{children}</span>;
}

/** Segmented control. Static for now — `active` is the highlighted option. */
export function Segmented({ options, active }: { options: string[]; active: string }) {
  return (
    <div className="seg">
      {options.map((o) => <div key={o} className={o === active ? "on" : ""}>{o}</div>)}
    </div>
  );
}

/** "Unlocks next week" teaser — nothing about the content is shown (week-by-week unlocking). */
export function LockedTeaser({ title, when }: { title: string; when: string }) {
  return (
    <div className="locked-teaser">
      <span className="lk"><Icon name="lock" /></span>
      <div className="grow"><b>{title}</b><small>{when}</small></div>
    </div>
  );
}

/** Segmented control made of links (tabs that actually switch). */
export function SegLinks({ options, active }: { options: { label: string; href: string }[]; active: string }) {
  return (
    <div className="seg">
      {options.map((o) => (
        <Link key={o.label} href={o.href} className={o.label === active ? "on" : ""} style={{ textDecoration: "none", color: "inherit", textAlign: "center" }}>{o.label}</Link>
      ))}
    </div>
  );
}
