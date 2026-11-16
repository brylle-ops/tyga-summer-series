"use client";
import { useState } from "react";

// Photo input that rejects files over the cap before submit, so phones never hit the server's body limit.
export default function ProofInput({ maxBytes, maxLabel }: { maxBytes: number; maxLabel: string }) {
  const [msg, setMsg] = useState("");
  return (
    <>
      <input type="file" name="proof" accept="image/png,image/jpeg,image/webp" style={{ display: "block", marginTop: 6 }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f && f.size > maxBytes) { e.target.value = ""; setMsg(`That photo is too big (max ${maxLabel}). Pick a smaller one.`); }
          else setMsg("");
        }} />
      {msg && <span className="notice" role="alert" style={{ display: "block", marginTop: 6 }}>{msg}</span>}
    </>
  );
}
