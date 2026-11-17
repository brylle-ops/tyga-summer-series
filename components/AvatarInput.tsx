"use client";
import { useRef, useState } from "react";
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

function Busy({ hasPhoto, onPick }: { hasPhoto: boolean; onPick: () => void }) {
  const { pending } = useFormStatus();
  return (
    <button type="button" className="mini" disabled={pending} aria-busy={pending} onClick={onPick}>
      {pending ? "Uploading…" : hasPhoto ? "Change photo" : "Upload photo"}
    </button>
  );
}

// One tap: pick a photo, it is shrunk on the phone and uploaded straight away.
export default function AvatarInput({ hasPhoto }: { hasPhoto: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");
  return (
    <>
      <input ref={ref} type="file" name="photo" accept="image/png,image/jpeg,image/webp" hidden
        onChange={async (e) => {
          const input = e.target;
          const f = input.files?.[0];
          setMsg("");
          if (!f) return;
          try {
            const small = await shrink(f);
            const dt = new DataTransfer();
            dt.items.add(small);
            input.files = dt.files;
          } catch {
            if (f.size > 3.5 * 1024 * 1024) { input.value = ""; setMsg("That photo is too big (max 3.5 MB). Pick a smaller one."); return; }
          }
          input.form?.requestSubmit();
        }} />
      {msg && <span className="notice" role="alert" style={{ display: "block" }}>{msg}</span>}
      <Busy hasPhoto={hasPhoto} onPick={() => { if (ref.current) { ref.current.value = ""; ref.current.click(); } }} />
    </>
  );
}
