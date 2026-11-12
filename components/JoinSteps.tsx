// Progress dots for the join flow: 1 Sign in · 2 Commit · 3 Singlet · 4 Pay
const LABELS = ["Sign in", "Commit", "Singlet", "Pay"];

export default function JoinSteps({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <div className="steps" aria-label={`Step ${current} of 4: ${LABELS[current - 1]}`}>
      {LABELS.map((label, i) => {
        const n = i + 1;
        const state = n < current ? "done" : n === current ? "cur" : "";
        return (
          <div key={label} style={{ display: "contents" }}>
            {i > 0 && <div className="ln" />}
            <div className={`s ${state}`}>
              <span className="n">{n < current ? "✓" : n}</span>
              {n === current && label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
