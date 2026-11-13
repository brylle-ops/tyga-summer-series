"use client";

import { useState } from "react";
import { Icon, type IconName } from "./Icons";

type Option = { kind: string; title: string; detail: string; icon: IconName };

// Tick everything you did today (more than one is fine), then log them in one tap.
export default function LogForm({ options, logged, initial, action, children }: {
  options: Option[]; logged: string[]; initial: string[]; action: (formData: FormData) => void; children?: React.ReactNode;
}) {
  const [picked, setPicked] = useState<string[]>(initial.filter((k) => !logged.includes(k)));
  const toggle = (k: string) => setPicked((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));
  const left = options.filter((o) => !logged.includes(o.kind));

  return (
    <form action={action} style={{ display: "contents" }}>
      <p className="xs mute" style={{ margin: 0 }}>Tick everything you did. You can pick more than one.</p>
      {options.map((o) => {
        const done = logged.includes(o.kind);
        const on = picked.includes(o.kind);
        return (
          <label key={o.kind} className={`move ${done ? "on done" : on ? "on" : ""}`} style={{ cursor: done ? "default" : "pointer" }}>
            <input className="sr-radio" type="checkbox" name="kind" value={o.kind} checked={on} disabled={done} onChange={() => toggle(o.kind)} />
            <span className="ico"><Icon name={o.icon} /></span>
            <div className="grow"><b>{o.title}</b><small>{done ? "Logged today ✓" : o.detail}</small></div>
            <span className="radio" />
          </label>
        );
      })}
      {children}
      {left.length === 0
        ? <p className="notice" role="status">All logged for today. See you tomorrow.</p>
        : <button className="btn" type="submit" disabled={picked.length === 0}>
            {picked.length === 0 ? "Pick what you did" : picked.length === 1 ? "Log it" : `Log ${picked.length} activities`}
          </button>}
    </form>
  );
}
