import { describe, expect, it } from "vitest";
import { proofExtension, validateProof, verifiedProofType, wantsPhoto } from "@/lib/proof";

describe("proof", () => {
  it("maps mime to extension", () => {
    expect(proofExtension("image/png")).toBe("png");
    expect(proofExtension("image/jpeg")).toBe("jpg");
    expect(proofExtension("image/webp")).toBe("webp");
    expect(proofExtension("image/gif")).toBeNull();
  });
  it("validates type and size", () => {
    expect(validateProof({ type: "image/png", size: 100 }, 1000)).toBeNull();
    expect(validateProof({ type: "text/html", size: 100 }, 1000)).toMatch(/PNG/);
    expect(validateProof({ type: "image/png", size: 2000 }, 1000)).toMatch(/too big/);
  });
  it("requires bytes to match the declared type", () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]);
    expect(verifiedProofType("image/png", png)).toBe("png");
    expect(verifiedProofType("image/jpeg", png)).toBeNull();
    expect(verifiedProofType("image/png", new Uint8Array([1, 2, 3]))).toBeNull();
  });
  it("flags photo missions", () => {
    expect(wantsPhoto("Run It")).toBe(true);
    expect(wantsPhoto("Other")).toBe(false);
  });
});
