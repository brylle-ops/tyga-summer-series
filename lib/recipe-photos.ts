// Recipes that have a photo at public/img/recipes/<code>.webp.
// This is the single place to add a code when a new photo file is added.
export const RECIPE_PHOTOS: ReadonlySet<string> = new Set(["B1", "B2", "B3", "L1", "L2"]);

export function recipePhoto(code: string): string | null {
  return RECIPE_PHOTOS.has(code) ? `/img/recipes/${code}.webp` : null;
}
