import type { IconName } from "@/components/Icons";

// "7 Days of Yard Fuel": the gym's own meal plan (10 recipes and a seven-day rotation).
// Nutrition numbers weren't supplied yet, so none are shown.

export type Meal = "breakfast" | "lunch" | "dinner" | "snack";

export type Recipe = {
  code: string; meal: Meal; title: string; short: string; icon: IconName;
  yields: string; prep: string; cook: string; // cook can be "No cook" or "Chill overnight"
  ingredients: string[]; method: string;
};

export const MEAL_LABEL: Record<Meal, string> = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack: "Snack" };

export const RECIPES: Recipe[] = [
  {
    code: "B1", meal: "breakfast", title: "High protein eggs on sourdough", short: "Eggs on sourdough", icon: "sun",
    yields: "Serves 2", prep: "5 min", cook: "Cook 10 min",
    ingredients: ["4 free-range eggs", "2 slices sourdough", "1 ripe avocado", "Handful baby spinach", "100g cherry tomatoes", "Salt, pepper, chilli flakes", "Optional: 2 tbsp cottage cheese"],
    method: "Toast sourdough. Mash avocado onto toast; season with salt, pepper and chilli. Cook eggs in a non-stick pan. Add eggs, spinach and tomatoes; serve optional cottage cheese alongside.",
  },
  {
    code: "B2", meal: "breakfast", title: "Protein overnight oats", short: "Overnight oats", icon: "cup",
    yields: "Serves 1", prep: "5 min", cook: "Chill overnight",
    ingredients: ["80g rolled oats", "200ml milk of choice", "1 scoop vanilla protein powder", "1 tbsp chia seeds", "1 tbsp almond butter", "1 banana, sliced", "Handful of berries", "Optional: 1 tsp honey"],
    method: "Stir oats, chia and protein powder in a jar. Mix in milk, almond butter and optional honey. Cover and chill overnight. Top with banana and berries in the morning.",
  },
  {
    code: "B3", meal: "breakfast", title: "Savoury egg and veggie muffins", short: "Egg + veggie muffins", icon: "leaf",
    yields: "Makes 6", prep: "10 min", cook: "Cook 20 min",
    ingredients: ["8 eggs", "100g diced capsicum", "100g baby spinach, chopped", "100g feta, crumbled", "4 slices lean or turkey bacon, diced", "Salt, pepper, mixed herbs", "Olive oil spray"],
    method: "Heat oven to 180 C; spray a 6-hole muffin tin. Whisk and season eggs. Stir in capsicum, spinach, bacon and most feta. Divide into tin; top with remaining feta. Bake 18-20 min until set.",
  },
  {
    code: "L1", meal: "lunch", title: "Chicken rice bowl with tahini dressing", short: "Chicken rice bowl", icon: "bowl",
    yields: "Serves 2", prep: "10 min", cook: "Cook 20 min",
    ingredients: ["400g chicken thigh fillets", "200g brown rice, dry", "200g pumpkin, cubed", "100g baby spinach", "1 cucumber, diced", "2 tbsp tahini", "1 lemon, juiced", "1 garlic clove", "Paprika, cumin, salt, pepper", "Olive oil, for roasting", "Water, for dressing"],
    method: "Cook rice. Roast pumpkin with oil at 200 C, 20 min. Season chicken; cook 5-6 min per side or until cooked through. Rest; slice. Whisk tahini, lemon, garlic and water. Assemble bowls; dress.",
  },
  {
    code: "L2", meal: "lunch", title: "Tuna and quinoa power bowl", short: "Tuna + quinoa bowl", icon: "drop",
    yields: "Serves 2", prep: "10 min", cook: "Cook 15 min",
    ingredients: ["2 cans tuna in springwater (185g)", "180g quinoa, dry", "1 avocado, diced", "1 cup cucumber, diced", "1 cup cherry tomatoes, halved", "1/4 red onion, finely diced", "2 tbsp olive oil", "2 tbsp lemon juice", "Fresh parsley, salt, pepper"],
    method: "Rinse quinoa; simmer in 360ml water for 12-14 min. Fluff and cool. Whisk oil, lemon, salt and pepper. Toss quinoa, tuna, cucumber, tomatoes and onion with dressing. Top with avocado and parsley.",
  },
  {
    code: "L3", meal: "lunch", title: "Turkey and hummus wrap", short: "Turkey + hummus wrap", icon: "plane",
    yields: "Serves 2", prep: "10 min", cook: "No cook",
    ingredients: ["300g sliced turkey breast", "2 large wholegrain wraps", "4 tbsp hummus", "1 cup rocket or mixed greens", "1 avocado, sliced", "1 tomato, sliced", "1/2 cucumber, sliced", "Squeeze of lemon, salt, pepper"],
    method: "Spread 2 tbsp hummus on each wrap. Layer turkey, greens, avocado, tomato and cucumber. Add lemon, salt and pepper. Roll tightly, tuck in sides and slice diagonally.",
  },
  {
    code: "D1", meal: "dinner", title: "Lean beef bolognese", short: "Beef bolognese", icon: "flame",
    yields: "Serves 4", prep: "10 min", cook: "Cook 35 min",
    ingredients: ["600g lean beef mince", "1 brown onion, diced", "4 garlic cloves", "2 cans crushed tomatoes", "2 tbsp tomato paste", "1 carrot, diced", "2 celery stalks, diced", "Oregano, basil, smoked paprika", "400g pasta or zucchini noodles"],
    method: "Brown mince in batches; set aside. Saute onion, carrot and celery for 5-6 min; add garlic for 1 min. Cook tomato paste for 2 min. Return mince; add tomatoes and herbs. Simmer uncovered for 20-25 min until thick. Cook pasta separately; serve sauce on top, or use zucchini noodles.",
  },
  {
    code: "D2", meal: "dinner", title: "Salmon and sweet potato tray bake", short: "Salmon tray bake", icon: "snow",
    yields: "Serves 2", prep: "10 min", cook: "Cook 25 min",
    ingredients: ["2 salmon fillets (180-200g each)", "2 medium sweet potatoes, cubed", "200g broccolini", "1 lemon, sliced", "3 tbsp olive oil", "2 tbsp soy sauce", "1 tbsp honey", "2 garlic cloves", "1 tsp grated ginger"],
    method: "Heat oven to 200 C. Toss sweet potato with 1 tbsp oil and seasoning on a lined tray; roast 10 min. Mix remaining oil, soy, honey, garlic and ginger. Add salmon, broccolini and lemon; glaze salmon. Roast 12-15 min more, until cooked through.",
  },
  {
    code: "D3", meal: "dinner", title: "Turkey meatballs with tomato sauce and quinoa", short: "Turkey meatballs", icon: "hand",
    yields: "Serves 4", prep: "15 min", cook: "Cook 25 min",
    ingredients: ["600g turkey mince", "1 egg", "3 tbsp breadcrumbs", "2 garlic cloves, minced", "Oregano, basil, salt, pepper", "2 cans crushed tomatoes", "1 onion, diced", "1 tbsp tomato paste", "200g quinoa, dry"],
    method: "Mix turkey, egg, crumbs, garlic and herbs; roll about 20 balls. Brown in batches for 2-3 min each side; remove. Saute onion; cook tomato paste 1 min. Add tomatoes and return meatballs. Simmer covered 15 min or until cooked through. Cook quinoa separately and serve together.",
  },
  {
    code: "S1", meal: "snack", title: "Protein bliss balls", short: "Protein bliss balls", icon: "gift",
    yields: "Makes 12", prep: "15 min", cook: "Chill 30 min",
    ingredients: ["1 cup rolled oats", "2 scoops chocolate protein powder", "3 tbsp almond butter", "3 tbsp honey or maple syrup", "2 tbsp cocoa powder", "2 tbsp chia seeds", "2-3 tbsp milk, to bind", "Optional: coconut or dark chocolate chips"],
    method: "Mix oats, protein powder, cocoa and chia. Stir in almond butter and honey or maple syrup. Add milk 1 tbsp at a time until mixture holds. Roll into 12 balls; optionally coat in coconut. Chill 30 min.",
  },
];

export const byCode = (code: string) => RECIPES.find((r) => r.code === code)!;

// The seven-day line-up: breakfast, lunch, dinner codes per day.
export const LINEUP: { day: number; b: string; l: string; d: string }[] = [
  { day: 1, b: "B1", l: "L1", d: "D1" },
  { day: 2, b: "B2", l: "L2", d: "D2" },
  { day: 3, b: "B3", l: "L3", d: "D3" },
  { day: 4, b: "B2", l: "L1", d: "D1" },
  { day: 5, b: "B1", l: "L2", d: "D3" },
  { day: 6, b: "B3", l: "L3", d: "D2" },
  { day: 7, b: "B2", l: "L1", d: "D1" },
];

export const QUICK_FOOD = [
  "Greek yoghurt + berries", "Cottage cheese + cucumber", "Hard-boiled eggs", "Tuna on rice cakes", "Protein bar",
  "Beef jerky or biltong", "Apple + almond butter", "Banana + protein shake", "Veggie sticks + hummus", "Edamame",
  "Rice cakes + nut butter", "Mixed nuts",
];

export const BEFORE_TRAINING = "Before training: chicken + rice, oats + eggs, toast + yoghurt, banana + protein shake, or rice cakes + nut butter.";
export const PLAN_NOTE = "Plan quantities around each recipe's batch size and your household. Repeats are meal choices, not extra cooking sessions.";
