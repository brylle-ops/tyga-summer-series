"use client";

// The Holiday Mode switch. On: tapping it turns Holiday Mode off (submits an empty date).
// Off: tapping it opens the "I'm away until" date picker.
export default function HolidaySwitch({ on }: { on: boolean }) {
  if (on) {
    return (
      <button type="submit" name="until" value="" className="switch on" role="switch" aria-checked="true" aria-label="Holiday Mode is on. Tap to turn it off"><i /></button>
    );
  }
  return (
    <button type="button" className="switch" role="switch" aria-checked="false" aria-label="Holiday Mode is off. Tap to pick your return date"
      onClick={() => {
        const el = document.getElementById("until") as HTMLInputElement | null;
        if (!el) return;
        el.focus();
        try { el.showPicker?.(); } catch { /* some browsers only allow it on direct taps */ }
      }}><i /></button>
  );
}

// The "I'm away until" date. Picking a date turns Holiday Mode on straight away (no extra tap needed).
export function HolidayDate({ min }: { min: string }) {
  return (
    <div className="li" style={{ gap: 8 }}>
      <input id="until" type="date" name="until" min={min} max="2027-01-31" className="grow"
        onChange={(e) => { if (e.currentTarget.value) e.currentTarget.form?.requestSubmit(); }}
        style={{ height: 44, borderRadius: 12, border: "1px solid rgba(0,0,0,.2)", padding: "0 10px", font: "inherit", background: "#fff", color: "#241c16" }} />
      <button className="mini" type="submit" name="turn" value="on" style={{ height: 44 }}>Turn on</button>
    </div>
  );
}
