import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { RECIPE_PHOTOS, recipePhoto } from "@/lib/recipe-photos";

describe("recipePhoto", () => {
  it("returns the webp path for a code with a photo", () => {
    expect(recipePhoto("B1")).toBe("/img/recipes/B1.webp");
  });
  it("returns null for a code without a photo", () => {
    expect(recipePhoto("D1")).toBeNull();
    expect(recipePhoto("ZZ")).toBeNull();
  });
  it("only lists codes whose file exists", () => {
    for (const code of RECIPE_PHOTOS) {
      expect(existsSync(join(process.cwd(), "public", "img", "recipes", `${code}.webp`))).toBe(true);
    }
  });
});
