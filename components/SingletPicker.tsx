"use client";

import { useState } from "react";
import { saveSinglet } from "@/app/join/actions";
import Runner, { type Colour, type Fit } from "./Runner";
import { Sky } from "./ui";

const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"] as const;
type Size = (typeof SIZES)[number];
const COLOURS: { value: Colour; label: string; img: string }[] = [
  { value: "cream", label: "Cream", img: "/img/singlet-cream-back.jpg" },
  { value: "charcoal", label: "Charcoal wash", img: "/img/singlet-charcoal-back.jpg" },
];

// Fit, colour and size. The runner follows the choices live; "Save" stores them on the member's registration.
export default function SingletPicker({ initial, paid = false }: {
  initial?: { fit?: Fit; colour?: Colour; size?: Size | null };
  paid?: boolean;
}) {
  const [fit, setFit] = useState<Fit>(initial?.fit ?? "womens");
  const [colour, setColour] = useState<Colour>(initial?.colour ?? "charcoal");
  const [size, setSize] = useState<Size | null>(initial?.size ?? null);
  const label = size
    ? `${paid ? "Save · " : ""}${fit === "womens" ? "Women's" : "Men's"} ${size} · ${colour === "cream" ? "Cream" : "Charcoal wash"}`
    : "Choose your size";

  return (
    <form action={saveSinglet} style={{ display: "contents" }}>
      <input type="hidden" name="fit" value={fit} />
      <input type="hidden" name="colour" value={colour} />
      <input type="hidden" name="size" value={size ?? ""} />
      <div className="seg" role="group" aria-label="Fit">
        <button type="button" aria-pressed={fit === "womens"} onClick={() => setFit("womens")}>Women&apos;s fit</button>
        <button type="button" aria-pressed={fit === "mens"} onClick={() => setFit("mens")}>Men&apos;s fit</button>
      </div>
      <div className="picker-stage">
        <Sky />
        <Runner fit={fit} colour={colour} yaw={200} />
        <span className="drag">Drag to turn ↻</span>
      </div>
      <div className="colours" role="group" aria-label="Colour">
        {COLOURS.map((c) => (
          <button key={c.value} type="button" className={`colour ${colour === c.value ? "on" : ""}`}
            aria-pressed={colour === c.value} onClick={() => setColour(c.value)}>
            <img src={c.img} alt={`${c.label} singlet, back print`} /><span>{c.label}</span>
          </button>
        ))}
      </div>
      <div className="li">
        <span className="eyebrow grow">Size</span>
        <span className="xs link">Size guide ›</span>
      </div>
      <div className="sizes" role="group" aria-label="Size">
        {SIZES.map((s) => (
          <button key={s} type="button" aria-pressed={size === s} onClick={() => setSize(s)}>{s}</button>
        ))}
      </div>
      <p className="xs mute">Limited edition. $15, collected at The Yard from launch week.</p>
      <div style={{ flex: 1 }} />
      <button type="submit" className="btn" disabled={!size}>{label}</button>
    </form>
  );
}
