import { Screen, TopNav } from "@/components/ui";
import { levels, me } from "@/lib/mock-data";

// Levels · sunrise journey
export default function Levels() {
  return (
    <Screen bodyStyle={{ gap: 10 }}>
      <TopNav title="Your summer" back="/home" />
      <div className="horizon">
        <svg viewBox="0 0 304 250" role="img" aria-label={`Level journey: level ${me.level} of 5`}>
          <path d="M28 190 A124 124 0 0 1 276 190" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="2" strokeDasharray="3 6" />
          <path d="M28 190 A124 124 0 0 1 120 70" fill="none" stroke="#e3cba4" strokeWidth="3" strokeLinecap="round" />
          <circle cx="120" cy="70" r="34" fill="#e3cba4" opacity=".22" /><circle cx="120" cy="70" r="20" fill="#fff1d0" />
          <g fontFamily="Inter, sans-serif" fontSize="10" fontWeight="700" textAnchor="middle">
            <circle cx="28" cy="190" r="11" fill="#f4f1ec" /><text x="28" y="194" fill="#1d1b18">1</text>
            <circle cx="57" cy="110" r="11" fill="#f4f1ec" /><text x="57" y="114" fill="#1d1b18">2</text>
            <text x="120" y="74" fill="#1d1b18">3</text>
            <circle cx="214" cy="83" r="11" fill="#1f1f1f" stroke="rgba(255,255,255,.5)" strokeWidth="1.5" /><text x="214" y="87" fill="#f4f1ec">4</text>
            <circle cx="276" cy="190" r="11" fill="#2a2724" stroke="rgba(255,255,255,.5)" strokeWidth="1.5" /><text x="276" y="194" fill="#f4f1ec">5</text>
          </g>
          <path d="M0 212 C70 204 120 208 160 210 C220 214 260 204 304 208 V250 H0Z" fill="#181818" />
          <text x="152" y="238" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="11" fontWeight="600" fill="#9d9d9d" letterSpacing="2">
            {me.points} POINTS · LEVEL {me.level} OF 5
          </text>
        </svg>
      </div>
      <div className="card" style={{ padding: "4px 14px" }}>
        {levels.map((l) => (
          <div key={l.no} className={`lvl ${l.no < me.level ? "done" : l.no === me.level ? "cur" : ""}`}>
            <span className="badge">{l.no}</span>
            <div className="grow"><b className="sm">{l.name}</b><div className="xs mute">{l.note}</div></div>
            <span className="xs mute">{l.at}</span>
          </div>
        ))}
      </div>
    </Screen>
  );
}
