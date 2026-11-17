"use client";
import { useState } from "react";
import { useFormStatus } from "react-dom";

const SIZE = 512; // profile photos never need more than this

/** Shrinks the picked photo on the phone (max 512px JPEG) so the upload is small and fast. */
async function shrink(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, SIZE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.85));
  if (!blob) return file;
  return new File([blob], "photo.jpg", { type: "image/jpeg" });
}

function Submit({ ready, hasPhoto }: { ready: boolean; hasPhoto: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="mini" disabled={!ready || pending} aria-busy={pending}>
      {pending ? "Uploading…" : hasPhoto ? "Change photo" : "Upload photo"}
    </button>
  );
}

// Photo picker + upload button for the More page.
export default function AvatarInput({ hasPhoto }: { hasPhoto: boolean }) {
  const [ready, setReady] = useState(false);
  const [msg, setMsg] = useState("");
  return (
    <>
      <input type="file" name="photo" accept="image/png,image/jpeg,image/webp" style={{ display: "block" }}
        onChange={async (e) => {
          const input = e.target;
          const f = input.files?.[0];
          setReady(false); setMsg("");
          if (!f) return;
          try {
            const small = await shrink(f);
            const dt = new DataTransfer();
            dt.items.add(small);
            input.files = dt.files;
            setReady(true);
          } catch {
            if (f.size > 3.5 * 1024 * 1024) { input.value = ""; setMsg("That photo is too big (max 3.5 MB). Pick a smaller one."); }
            else setReady(true);
          }
        }} />
      {msg && <span className="notice" role="alert" style={{ display: "block" }}>{msg}</span>}
      <Submit ready={ready} hasPhoto={hasPhoto} />
    </>
  );
}
