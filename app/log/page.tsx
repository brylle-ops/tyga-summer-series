import { Icon } from "@/components/Icons";
import { Screen } from "@/components/ui";
import { checkinTypes } from "@/lib/mock-data";

// Daily check-in (selection and logging not wired up yet)
export default function Log() {
  return (
    <Screen tabs bodyStyle={{ gap: 9 }}>
      <div className="eyebrow" style={{ marginTop: 4 }}>Tuesday 22 Dec</div>
      <div className="h1">Did you move today?</div>
      {checkinTypes.map((t, i) => (
        <div key={t.title} className={`move ${i === 0 ? "on" : ""}`}>
          <span className="ico"><Icon name={t.icon} /></span>
          <div className="grow"><b>{t.title}</b><small>{t.detail}</small></div>
          <span className="radio" />
        </div>
      ))}
      <div className="photo"><Icon name="cam" size={18} />Add a photo or screenshot (optional)</div>
      <div className="li card" style={{ padding: "9px 12px" }}>
        <b className="sm grow">Tomorrow?</b>
        <span className="chip on" style={{ padding: "6px 10px" }}>6am Yard</span>
        <span className="chip" style={{ padding: "6px 10px" }}>Run</span>
        <span className="chip" style={{ padding: "6px 10px" }}>Book ↗</span>
      </div>
      <button className="btn" type="button">Log Yard session · +5</button>
    </Screen>
  );
}
