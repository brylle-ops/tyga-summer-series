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
