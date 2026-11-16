export type SniffedImage = "png" | "jpg" | "webp";

const starts = (b: Uint8Array, sig: number[], at = 0) => b.length >= at + sig.length && sig.every((v, i) => b[at + i] === v);

/** Identify an image by its magic bytes (never trust a client-supplied type). */
export function sniffImageType(bytes: Uint8Array): SniffedImage | null {
  if (starts(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "png";
  if (starts(bytes, [0xff, 0xd8, 0xff])) return "jpg";
  if (starts(bytes, [0x52, 0x49, 0x46, 0x46]) && starts(bytes, [0x57, 0x45, 0x42, 0x50], 8)) return "webp";
  return null;
}

export const IMAGE_CONTENT_TYPE: Record<SniffedImage, string> = { png: "image/png", jpg: "image/jpeg", webp: "image/webp" };
