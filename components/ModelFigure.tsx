// Full-body, front-view illustration of the model. The singlet colour and body shape follow the shop choices.
type Props = { fit: "womens" | "mens"; colour: "cream" | "charcoal"; className?: string };

const SKIN = "#c98f6a";
const SKIN_SHADE = "#b57a57";

export default function ModelFigure({ fit, colour, className }: Props) {
  const w = fit === "womens";
  const shirt = colour === "cream" ? "#e9dfcf" : "#2b2b2b";
  const shirtShade = colour === "cream" ? "#d6c9b3" : "#1d1d1d";
  const ink = colour === "cream" ? "#1a1a1a" : "#f4f1ec";

  const singlet = w
    ? "M126,106 L136,106 Q150,126 164,106 L174,106 Q182,140 188,170 Q184,200 190,298 Q150,312 110,298 Q116,200 112,170 Q118,140 126,106 Z"
    : "M118,104 L134,104 Q150,124 166,104 L182,104 Q196,138 202,172 Q196,204 200,302 Q150,316 100,302 Q104,204 98,172 Q104,138 118,104 Z";
  const armL = w ? "M112,132 Q92,210 94,300" : "M100,132 Q80,215 82,306";
  const armR = w ? "M188,132 Q208,210 206,300" : "M200,132 Q220,215 218,306";
  const handL = w ? [94, 312] : [82, 318];
  const handR = w ? [206, 312] : [218, 318];
  const armW = w ? 17 : 22;
  const shortsEnd = w ? 392 : 452;
  const hipL = w ? 106 : 104;
  const hipR = w ? 194 : 196;
  const legL = `M${hipL + 4},${shortsEnd - 6} L146,${shortsEnd - 6} L142,598 L118,598 Z`;
  const legR = `M${hipR - 4},${shortsEnd - 6} L154,${shortsEnd - 6} L158,598 L182,598 Z`;
  const logoX = w ? 168 : 172;

  return (
    <svg className={className} viewBox="0 0 300 660" role="img" aria-label={`Model wearing the ${colour} singlet, full body, front view`}
      xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="660" fill="#bdb8b0" />
      <rect y="620" width="300" height="40" fill="#a9a49c" />
      <ellipse cx="150" cy="626" rx="62" ry="8" fill="#000" opacity=".18" />

      {/* hair at the back */}
      {w ? <ellipse cx="150" cy="40" rx="14" ry="22" fill="#5a3a22" /> : null}
      {/* legs */}
      <path d={legL} fill={SKIN} />
      <path d={legR} fill={SKIN} />
      {/* shoes */}
      <ellipse cx="130" cy="606" rx="19" ry="9" fill="#f7f7f5" />
      <ellipse cx="170" cy="606" rx="19" ry="9" fill="#f7f7f5" />
      {/* arms and hands */}
      <path d={armL} stroke={SKIN} strokeWidth={armW} strokeLinecap="round" fill="none" />
      <path d={armR} stroke={SKIN} strokeWidth={armW} strokeLinecap="round" fill="none" />
      <circle cx={handL[0]} cy={handL[1]} r={armW / 2 + 1} fill={SKIN_SHADE} />
      <circle cx={handR[0]} cy={handR[1]} r={armW / 2 + 1} fill={SKIN_SHADE} />
      {/* neck + head */}
      <rect x="140" y="88" width="20" height="26" rx="8" fill={SKIN_SHADE} />
      <ellipse cx="150" cy="62" rx="26" ry="32" fill={SKIN} />
      <path d={w ? "M122,58 Q124,26 150,26 Q176,26 178,58 Q168,40 150,40 Q132,40 122,58 Z" : "M123,56 Q122,28 150,28 Q178,28 177,56 Q172,42 150,42 Q128,42 123,56 Z"} fill={w ? "#5a3a22" : "#2a1b12"} />
      <path d="M140,72 Q150,80 160,72" stroke="#7a3f2a" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <circle cx="140" cy="62" r="2" fill="#2a1b12" />
      <circle cx="160" cy="62" r="2" fill="#2a1b12" />
      {/* singlet */}
      <path d={singlet} fill={shirt} />
      <path d={`M${w ? 150 : 150},126 L${w ? 150 : 150},300`} stroke={shirtShade} strokeWidth="1.5" opacity=".35" />
      <text x={logoX} y="158" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontWeight="900" fontStyle="italic" fontSize="14" fill={ink}>TYGA</text>
      <text x={logoX} y="168" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontWeight="700" fontSize="7" letterSpacing="1" fill={ink}>— 2026 —</text>
      {/* shorts */}
      <path d={`M${hipL},296 L${hipR},296 L${hipR + 2},${shortsEnd} L154,${shortsEnd - 4} L150,326 L146,${shortsEnd - 4} L${hipL - 2},${shortsEnd} Z`} fill="#141414" />
    </svg>
  );
}
