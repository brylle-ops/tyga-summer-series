"use client";

import { useState } from "react";
import { saveSinglet } from "@/app/join/actions";
import Runner, { type Colour, type Fit } from "./Runner";
import { Sky } from "./ui";

const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"] as const;
type Size = (typeof SIZES)[number];
const PRICE = "$15";

const COLOURS: { value: Colour; label: string; swatch: string }[] = [
  { value: "cream", label: "Cream", swatch: "#e9dfcf" },
  { value: "charcoal", label: "Charcoal wash", swatch: "#2b2b2b" },
];

// Photos change with the colour; the last slide is the 3D runner wearing the singlet.
const SLIDES = (c: Colour) => [
  { key: "front", label: "Front", src: `/img/shop-${c}-front.webp`, alt: `${c === "cream" ? "Cream" : "Charcoal wash"} singlet, worn` },
  { key: "back", label: "Back print", src: "/img/shop-backs.webp", alt: "Singlet back print: TYGA 2026 Summer Series, Maintain the standard" },
  { key: "detail", label: "Detail", src: `/img/shop-${c}-detail.webp`, alt: "Close-up of the back print" },
] as const;

type Initial = { fit?: Fit; colour?: Colour; size?: Size | null };

// Product page: gallery + model, colour, fit, size, then checkout. Choices are posted to saveSinglet.
export default function SingletProduct({ initial, paid = false }: { initial?: Initial; paid?: boolean }) {
  const [fit, setFit] = useState<Fit>(initial?.fit ?? "womens");
  const [colour, setColour] = useState<Colour>(initial?.colour ?? "cream");
  const [size, setSize] = useState<Size | null>(initial?.size ?? null);
  const [slide, setSlide] = useState<string>("front");

  const slides = SLIDES(colour);
  const current = slides.find((s) => s.key === slide);
  const label = size
    ? `${paid ? "Save change" : "Checkout"} · ${PRICE}`
    : "Choose your size";

  return (
    <form action={saveSinglet} style={{ display: "contents" }}>
      <input type="hidden" name="fit" value={fit} />
      <input type="hidden" name="colour" value={colour} />
      <input type="hidden" name="size" value={size ?? ""} />

      <div className={current ? "pp-view" : "pp-view picker-stage"}>
        {current ? (
          <img src={current.src} alt={current.alt} data-s={current.key} />
        ) : (
          <>
            <Sky />
            <Runner fit={fit} colour={colour} yaw={200} />
            <span className="drag">Drag to turn ↻</span>
          </>
        )}
      </div>
      <div className="pp-thumbs" role="group" aria-label="Photos">
        {slides.map((s) => (
          <button key={s.key} type="button" aria-pressed={slide === s.key} onClick={() => setSlide(s.key)}>
            <img src={s.src} alt="" /><span>{s.label}</span>
          </button>
        ))}
        <button type="button" className="pp-model" aria-pressed={slide === "model"} onClick={() => setSlide("model")}>
          <span className="pp-run" aria-hidden="true">▶</span><span>On the run</span>
        </button>
      </div>

      <div className="pp-title">
        <div>
          <h1 className="h2">TYGA 2026 Summer Series singlet</h1>
          <p className="xs mute">Limited edition · Maintain the standard</p>
        </div>
        <b className="pp-price">{PRICE}</b>
      </div>

      <div>
        <div className="eyebrow">Colour · {COLOURS.find((c) => c.value === colour)?.label}</div>
        <div className="pp-swatches" role="group" aria-label="Colour">
          {COLOURS.map((c) => (
            <button key={c.value} type="button" aria-pressed={colour === c.value} aria-label={c.label}
              onClick={() => setColour(c.value)} style={{ background: c.swatch }} />
          ))}
        </div>
      </div>

      <div className="seg" role="group" aria-label="Fit">
        <button type="button" aria-pressed={fit === "womens"} onClick={() => setFit("womens")}>Women&apos;s fit</button>
        <button type="button" aria-pressed={fit === "mens"} onClick={() => setFit("mens")}>Men&apos;s fit</button>
      </div>

      <div>
        <div className="eyebrow" style={{ marginBottom: 6 }}>Size</div>
        <div className="sizes" role="group" aria-label="Size">
          {SIZES.map((s) => (
            <button key={s} type="button" aria-pressed={size === s} onClick={() => setSize(s)}>{s}</button>
          ))}
        </div>
      </div>

      <p className="xs mute">Secure checkout by Square. Collect your singlet at The Yard from launch week.</p>
      <div style={{ flex: 1 }} />
      <button type="submit" className="btn" disabled={!size}>{label}</button>
    </form>
  );
}
