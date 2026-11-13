import { dayLabel, type StripDay } from "@/lib/activity";

const MARK: Record<string, string> = { counted: "✓", pending: "…", logged: "•", none: "" };

// Mon–Sun row: a tick for a counted session, "…" waiting for the roster, a dot for recovery/rest.
export default function WeekStrip({ strip }: { strip: StripDay[] }) {
  return (
    <div className="strip" role="list">
      {strip.map((d) => (
        <span key={d.day} role="listitem" className={`d ${d.state} ${d.today ? "today" : ""} ${d.future ? "future" : ""}`}
          aria-label={`${dayLabel(d.day)}: ${d.state === "none" ? "nothing logged" : d.state}`}>
          <i>{MARK[d.state]}</i><small>{d.label}</small>
        </span>
      ))}
    </div>
  );
}
