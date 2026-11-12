import { Icon } from "@/components/Icons";
import { LockedTeaser, Screen, Segmented, TopNav } from "@/components/ui";
import { hasMoreToCome, myPerk, nextPerks, nextWeek, unlocked } from "@/lib/mock-data";

// Local perks
export default function Perks() {
  return (
    <Screen tabs>
      <TopNav title="Perks" />
      <Segmented options={["My perks", "All perks"]} active="My perks" />
      <div className="voucher">
        <div className="v-top">
          <span className="ico" style={{ background: "rgba(29,27,24,.08)", color: "var(--ink)", width: 48, height: 48, borderRadius: 15 }}><Icon name="cup" /></span>
          <div className="grow">
            <div className="xs" style={{ color: "var(--ink-mute)", fontWeight: 600, letterSpacing: 1.5 }}>UNLOCKED · LEVEL {myPerk.level}</div>
            <b style={{ fontSize: 16 }}>{myPerk.title}</b>
            <div className="sm" style={{ color: "var(--ink-mute)" }}>{myPerk.partner}</div>
          </div>
        </div>
        <div className="v-code"><b>{myPerk.code}</b><span className="xs" style={{ color: "var(--ink-mute)" }}>Use by {myPerk.useBy}</span></div>
      </div>
      <button className="btn ghost" type="button" style={{ height: 44, fontSize: 13.5 }}>Show at the counter</button>
      <div className="eyebrow" style={{ marginTop: 4 }}>Next to unlock</div>
      {unlocked(nextPerks).map((p) => (
        <div key={p.title} className={`perk ${p.locked ? "locked" : ""}`}>
          <div className="art" style={{ background: p.art }}><Icon name={p.icon} style={{ color: "var(--cream)" }} /></div>
          <div className="grow">
            <b>{p.title}</b><div className="xs mute">{p.detail}</div>
            {p.progress !== undefined && <div className="bar" style={{ marginTop: 7 }}><i style={{ width: `${p.progress}%` }} /></div>}
          </div>
          {p.locked ? <Icon name="lock" size={16} style={{ color: "var(--mute)" }} /> : <span className="xs mute">{p.right}</span>}
        </div>
      ))}
      {hasMoreToCome(nextPerks) && nextWeek && <LockedTeaser title="More perks on the way" when={`Next drop ${nextWeek.unlocks}`} />}
    </Screen>
  );
}
