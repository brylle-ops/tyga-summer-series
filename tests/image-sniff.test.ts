import { describe, expect, it } from "vitest";
import { sniffImageType } from "@/lib/image-sniff";

const bytes = (...n: number[]) => new Uint8Array([...n, 0, 0, 0, 0]);

describe("sniffImageType", () => {
  it("detects png, jpg and webp", () => {
    expect(sniffImageType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toBe("png");
    expect(sniffImageType(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe("jpg");
    expect(sniffImageType(bytes(0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x45, 0x42, 0x50))).toBe("webp");
  });
  it("rejects wrong headers", () => {
    expect(sniffImageType(new TextEncoder().encode("<svg xmlns=''></svg>"))).toBeNull();
    expect(sniffImageType(bytes(0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x41, 0x56, 0x45))).toBeNull();
    expect(sniffImageType(bytes(0x89, 0x50, 0x4e, 0x47))).toBeNull();
  });
  it("rejects too-short input", () => {
    expect(sniffImageType(new Uint8Array([]))).toBeNull();
    expect(sniffImageType(new Uint8Array([0xff, 0xd8]))).toBeNull();
    expect(sniffImageType(new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x57]))).toBeNull();
  });
});
