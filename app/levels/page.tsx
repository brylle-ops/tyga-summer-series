import { Screen, TopNav } from "@/components/ui";
import { levels } from "@/lib/mock-data";
import { loadMemberView, requireSeriesMember } from "@/lib/series-data";

// Points along the sunrise arc for levels 1–5
const P = [[28, 190], [57, 110], [120, 70], [214, 83], [276, 190]] as const;

// Levels · sunrise journey
export default async function Levels() {
  const { me } = await loadMemberView(await requireSeriesMember());
  return (
    <Screen bodyStyle={{ gap: 10 }}>
      <TopNav title="Your summer" back="/home" />
      <div className="horizon">
        <svg viewBox="0 0 304 250" role="img" aria-label={`Level journey: level ${me.level} of 5`}>
          <path d="M28 190 A124 124 0 0 1 276 190" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="2" strokeDasharray="3 6" />
          <path d={`M28 190 A124 124 0 0 1 ${P[me.level - 1][0]} ${P[me.level - 1][1]}`} fill="none" stroke="#e3cba4" strokeWidth="3" strokeLinecap="round" />
          <circle cx={P[me.level - 1][0]} cy={P[me.level - 1][1]} r="34" fill="#e3cba4" opacity=".22" />
          <circle cx={P[me.level - 1][0]} cy={P[me.level - 1][1]} r="20" fill="#fff1d0" />
          <g fontFamily="Inter, sans-serif" fontSize="10" fontWeight="700" textAnchor="middle">
            {P.map(([x, y], i) => {
              const n = i + 1;
              return (
                <g key={n}>
                  {n !== me.level && <circle cx={x} cy={y} r="11" fill={n < me.level ? "#f4f1ec" : "#1f1f1f"} stroke={n < me.level ? "none" : "rgba(255,255,255,.5)"} strokeWidth="1.5" />}
                  <text x={x} y={y + 4} fill={n <= me.level ? "#1d1b18" : "#f4f1ec"}>{n}</text>
                </g>
              );
            })}
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
