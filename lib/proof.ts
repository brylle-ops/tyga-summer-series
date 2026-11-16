import { sniffImageType, type SniffedImage } from "@/lib/image-sniff";

export const MAX_PROOF_BYTES = 2.5 * 1024 * 1024;

/** Missions where a photo helps staff verify the completion. */
export const PHOTO_MISSIONS = ["Fuel It", "Wear the Singlet", "Run It", "Hello, 2027!", "Squad Session"];
export const wantsPhoto = (title: string) => PHOTO_MISSIONS.includes(title);

const BY_MIME: Record<string, SniffedImage> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };

/** Extension for a declared MIME type, or null when it is not an allowed image type. */
export function proofExtension(mime: string): SniffedImage | null {
  return BY_MIME[mime] ?? null;
}

/** Error text for a bad declared type or size, or null when fine. */
export function validateProof(file: { type: string; size: number }, maxBytes: number = MAX_PROOF_BYTES): string | null {
  if (!proofExtension(file.type)) return "Please attach a PNG, JPG or WebP image.";
  if (file.size > maxBytes) return `That photo is too big (max ${Math.round((maxBytes / 1048576) * 10) / 10} MB).`;
  return null;
}

/** Sniff the real type from the bytes; it must match the declared type. Returns the extension or null. */
export function verifiedProofType(declaredMime: string, bytes: Uint8Array): SniffedImage | null {
  const sniffed = sniffImageType(bytes);
  return sniffed && sniffed === proofExtension(declaredMime) ? sniffed : null;
}
