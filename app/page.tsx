import React, { useMemo, useState } from "react";

type Goal = "low_cal" | "lean" | "anabolic" | "bulk";
type MacroSet = { calories: number; protein: number; carbs: number; fat: number };
type FoodOption = { name: string; unit: string; options: Record<Goal, number>; macrosPer100: MacroSet };
type FlavorProfile = { name: string; seasonings: string[]; sauce: string; method: string };
type CookingStyle = "pan" | "air_fryer" | "oven" | "cold";
type MealCategory = "bowl" | "sandwich" | "breakfast" | "meal_prep";
type TabKey = "ingredients" | "instructions" | "flavor" | "timeline";
type ChefMode = "quick" | "chef";
type PortionMode = "auto" | "custom";

type Preset = {
  name: string;
  protein: string;
  carb: string;
  fat: string;
  veg: string;
  flavor: string;
  goal: Goal;
  cookingStyle?: CookingStyle;
  mealCategory?: MealCategory;
};

type TimelineEntry = {
  name: string;
  displayName: string;
  startAt: number;
  duration: number;
  prepTime: number;
  cookTime: number;
};

type PortionTargets = {
  protein: number;
  carb: number;
  fat: number;
  veg: number;
};

type RecipeOutput = {
  title: string;
  smartTitle: string;
  ingredients: string[];
  instructions: string[];
  total: MacroSet;
  warnings: string[];
  estimatedTime: number;
  timeline: TimelineEntry[];
};

type TimelineTask = {
  name: string;
  prepTime: number;
  cookTime: number;
  totalTime: number;
  detail: string;
};

const theme = {
  bg: "#090909",
  bgSoft: "#0f0f10",
  card: "#141414",
  cardAlt: "#1a1a1b",
  border: "#27272a",
  accent: "#c9a35c",
  accentSoft: "rgba(201,163,92,0.14)",
  text: "#f8f8f8",
  subtext: "#a1a1aa",
  headingFont: "'Playfair Display', Georgia, serif",
  bodyFont: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const proteins: FoodOption[] = [
  { name: "Chicken Breast", unit: "g", options: { low_cal: 130, lean: 150, anabolic: 200, bulk: 180 }, macrosPer100: { calories: 165, protein: 31, carbs: 0, fat: 3.6 } },
  { name: "Lean Ground Beef 90/10", unit: "g", options: { low_cal: 120, lean: 150, anabolic: 140, bulk: 180 }, macrosPer100: { calories: 176, protein: 26, carbs: 0, fat: 10 } },
  { name: "Turkey Breast Deli", unit: "g", options: { low_cal: 100, lean: 120, anabolic: 150, bulk: 140 }, macrosPer100: { calories: 104, protein: 17, carbs: 3, fat: 2 } },
  { name: "Salmon", unit: "g", options: { low_cal: 120, lean: 150, anabolic: 150, bulk: 180 }, macrosPer100: { calories: 208, protein: 20, carbs: 0, fat: 13 } },
  { name: "Tuna In Water", unit: "g", options: { low_cal: 120, lean: 140, anabolic: 180, bulk: 160 }, macrosPer100: { calories: 116, protein: 26, carbs: 0, fat: 1 } },
  { name: "Egg Whites", unit: "g", options: { low_cal: 200, lean: 220, anabolic: 280, bulk: 220 }, macrosPer100: { calories: 52, protein: 11, carbs: 1, fat: 0.2 } },
  { name: "Whole Egg", unit: "g", options: { low_cal: 100, lean: 100, anabolic: 100, bulk: 150 }, macrosPer100: { calories: 143, protein: 13, carbs: 1, fat: 10 } },
  { name: "Greek Yogurt Nonfat", unit: "g", options: { low_cal: 170, lean: 200, anabolic: 250, bulk: 220 }, macrosPer100: { calories: 59, protein: 10, carbs: 3.6, fat: 0.4 } },
  { name: "Cottage Cheese Low-Fat", unit: "g", options: { low_cal: 150, lean: 180, anabolic: 220, bulk: 200 }, macrosPer100: { calories: 81, protein: 10.5, carbs: 4, fat: 2.3 } },
  { name: "Whey Isolate", unit: "g", options: { low_cal: 25, lean: 30, anabolic: 40, bulk: 35 }, macrosPer100: { calories: 372, protein: 86, carbs: 4, fat: 2 } },
];

const carbs: FoodOption[] = [
  { name: "None", unit: "g", options: { low_cal: 0, lean: 0, anabolic: 0, bulk: 0 }, macrosPer100: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
  { name: "Rice Cooked", unit: "g", options: { low_cal: 100, lean: 150, anabolic: 120, bulk: 220 }, macrosPer100: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 } },
  { name: "Potato", unit: "g", options: { low_cal: 120, lean: 200, anabolic: 150, bulk: 280 }, macrosPer100: { calories: 87, protein: 1.9, carbs: 20, fat: 0.1 } },
  { name: "Sweet Potato", unit: "g", options: { low_cal: 120, lean: 180, anabolic: 150, bulk: 250 }, macrosPer100: { calories: 86, protein: 1.6, carbs: 20, fat: 0.1 } },
  { name: "Oats Dry", unit: "g", options: { low_cal: 25, lean: 40, anabolic: 40, bulk: 70 }, macrosPer100: { calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9 } },
  { name: "Cream of Rice Dry", unit: "g", options: { low_cal: 25, lean: 40, anabolic: 45, bulk: 70 }, macrosPer100: { calories: 370, protein: 6.7, carbs: 83, fat: 0.6 } },
  { name: "Bread", unit: "g", options: { low_cal: 50, lean: 60, anabolic: 60, bulk: 100 }, macrosPer100: { calories: 265, protein: 9, carbs: 49, fat: 3.2 } },
  { name: "Bagel", unit: "g", options: { low_cal: 55, lean: 75, anabolic: 75, bulk: 110 }, macrosPer100: { calories: 250, protein: 10, carbs: 49, fat: 1.5 } },
  { name: "White Rice Cake", unit: "g", options: { low_cal: 18, lean: 27, anabolic: 27, bulk: 45 }, macrosPer100: { calories: 387, protein: 8, carbs: 81, fat: 3 } },
  { name: "Banana", unit: "g", options: { low_cal: 60, lean: 100, anabolic: 100, bulk: 140 }, macrosPer100: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 } },
  { name: "Blueberries", unit: "g", options: { low_cal: 60, lean: 80, anabolic: 80, bulk: 120 }, macrosPer100: { calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3 } },
  { name: "Apple", unit: "g", options: { low_cal: 80, lean: 120, anabolic: 120, bulk: 180 }, macrosPer100: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 } },
];

const fats: FoodOption[] = [
  { name: "None", unit: "g", options: { low_cal: 0, lean: 0, anabolic: 0, bulk: 0 }, macrosPer100: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
  { name: "Olive Oil", unit: "g", options: { low_cal: 0, lean: 5, anabolic: 5, bulk: 15 }, macrosPer100: { calories: 884, protein: 0, carbs: 0, fat: 100 } },
  { name: "Peanut Butter", unit: "g", options: { low_cal: 8, lean: 12, anabolic: 10, bulk: 24 }, macrosPer100: { calories: 588, protein: 25, carbs: 20, fat: 50 } },
  { name: "Almonds", unit: "g", options: { low_cal: 10, lean: 15, anabolic: 15, bulk: 28 }, macrosPer100: { calories: 579, protein: 21, carbs: 22, fat: 50 } },
  { name: "Avocado", unit: "g", options: { low_cal: 25, lean: 40, anabolic: 35, bulk: 70 }, macrosPer100: { calories: 160, protein: 2, carbs: 9, fat: 15 } },
  { name: "Whole Egg", unit: "g", options: { low_cal: 50, lean: 50, anabolic: 50, bulk: 100 }, macrosPer100: { calories: 143, protein: 13, carbs: 1, fat: 10 } },
];

const vegetables: FoodOption[] = [
  { name: "None", unit: "g", options: { low_cal: 0, lean: 0, anabolic: 0, bulk: 0 }, macrosPer100: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
  { name: "Broccoli", unit: "g", options: { low_cal: 180, lean: 120, anabolic: 150, bulk: 100 }, macrosPer100: { calories: 35, protein: 2.4, carbs: 7.2, fat: 0.4 } },
  { name: "Green Beans", unit: "g", options: { low_cal: 180, lean: 120, anabolic: 150, bulk: 100 }, macrosPer100: { calories: 31, protein: 1.8, carbs: 7, fat: 0.1 } },
  { name: "Asparagus", unit: "g", options: { low_cal: 180, lean: 120, anabolic: 150, bulk: 100 }, macrosPer100: { calories: 20, protein: 2.2, carbs: 3.9, fat: 0.1 } },
  { name: "Spinach", unit: "g", options: { low_cal: 120, lean: 80, anabolic: 100, bulk: 60 }, macrosPer100: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 } },
  { name: "Mixed Salad Greens", unit: "g", options: { low_cal: 120, lean: 80, anabolic: 100, bulk: 60 }, macrosPer100: { calories: 17, protein: 1.8, carbs: 3.2, fat: 0.2 } },
  { name: "Bell Peppers", unit: "g", options: { low_cal: 150, lean: 100, anabolic: 120, bulk: 80 }, macrosPer100: { calories: 31, protein: 1, carbs: 6, fat: 0.3 } },
  { name: "Zucchini", unit: "g", options: { low_cal: 180, lean: 120, anabolic: 140, bulk: 100 }, macrosPer100: { calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3 } },
  { name: "Cauliflower", unit: "g", options: { low_cal: 180, lean: 120, anabolic: 150, bulk: 100 }, macrosPer100: { calories: 25, protein: 1.9, carbs: 5, fat: 0.3 } },
];

const flavorProfiles: FlavorProfile[] = [
  { name: "Garlic Herb", seasonings: ["garlic powder", "salt", "black pepper", "Italian seasoning"], sauce: "Optional splash of lemon or a spoon of nonfat Greek yogurt for a creamy finish.", method: "Best for bowls, chicken, potatoes, and deli turkey meals." },
  { name: "Spicy", seasonings: ["paprika", "chili powder", "cayenne", "garlic powder", "salt"], sauce: "Optional Greek yogurt mixed with paprika and salt as a cool spicy drizzle.", method: "Best for beef, chicken, tuna, rice bowls, and skillet meals." },
  { name: "Lemon Fresh", seasonings: ["salt", "black pepper", "lemon juice", "parsley"], sauce: "Fresh lemon finish after cooking keeps the flavor bright and clean.", method: "Best for salmon, tuna, asparagus, broccoli, and lighter meals." },
  { name: "Creamy Protein", seasonings: ["garlic powder", "salt", "black pepper", "onion powder"], sauce: "Stir nonfat Greek yogurt with the seasonings into a high-protein creamy sauce.", method: "Best for potatoes, sandwiches, bowls, wraps, and meal prep boxes." },
  { name: "Sweet Savory", seasonings: ["salt", "pepper", "garlic powder", "cinnamon for breakfast options"], sauce: "Works with banana, apple, oats, peanut butter, and breakfast-style savory-sweet meals.", method: "Best for breakfast bowls, egg meals, bagels, oats, and protein blends." },
];

const presets: Preset[] = [
  { name: "Chicken Rice Bowl", protein: "Chicken Breast", carb: "Rice Cooked", fat: "Olive Oil", veg: "Broccoli", flavor: "Garlic Herb", goal: "lean", cookingStyle: "pan", mealCategory: "bowl" },
  { name: "Beef Potato Power Bowl", protein: "Lean Ground Beef 90/10", carb: "Potato", fat: "Olive Oil", veg: "Green Beans", flavor: "Spicy", goal: "lean", cookingStyle: "air_fryer", mealCategory: "bowl" },
  { name: "Salmon Rice Bowl", protein: "Salmon", carb: "Rice Cooked", fat: "None", veg: "Asparagus", flavor: "Lemon Fresh", goal: "lean", cookingStyle: "pan", mealCategory: "bowl" },
  { name: "Anabolic Egg Bowl", protein: "Egg Whites", carb: "Potato", fat: "Whole Egg", veg: "Spinach", flavor: "Garlic Herb", goal: "anabolic", cookingStyle: "air_fryer", mealCategory: "breakfast" },
  { name: "Turkey Sandwich Box", protein: "Turkey Breast Deli", carb: "Bread", fat: "Avocado", veg: "Mixed Salad Greens", flavor: "Creamy Protein", goal: "lean", cookingStyle: "cold", mealCategory: "sandwich" },
  { name: "Protein Breakfast Bowl", protein: "Greek Yogurt Nonfat", carb: "Oats Dry", fat: "Peanut Butter", veg: "None", flavor: "Sweet Savory", goal: "bulk", cookingStyle: "cold", mealCategory: "breakfast" },
];

const goalLabels: Record<Goal, string> = { low_cal: "Low Cal", lean: "Lean", anabolic: "Anabolic", bulk: "Bulk" };
const goalDescriptions: Record<Goal, string> = {
  low_cal: "Lower calories, higher volume, clean and filling.",
  lean: "Balanced performance meal with strong protein and moderate carbs.",
  anabolic: "Higher protein focus with enough carbs to perform and recover.",
  bulk: "More total energy, more carbs and fats, still anchored by protein.",
};

const proteinBaseTimes: Record<string, number> = { "Chicken Breast": 12, "Lean Ground Beef 90/10": 10, "Turkey Breast Deli": 2, Salmon: 10, "Tuna In Water": 3, "Egg Whites": 6, "Whole Egg": 6, "Greek Yogurt Nonfat": 1, "Cottage Cheese Low-Fat": 1, "Whey Isolate": 1 };
const proteinPrepTimes: Record<string, number> = { "Chicken Breast": 5, "Lean Ground Beef 90/10": 3, "Turkey Breast Deli": 1, Salmon: 4, "Tuna In Water": 2, "Egg Whites": 1, "Whole Egg": 2, "Greek Yogurt Nonfat": 1, "Cottage Cheese Low-Fat": 1, "Whey Isolate": 1 };
const carbBaseTimes: Record<string, number> = { "Rice Cooked": 15, Potato: 40, "Sweet Potato": 35, "Oats Dry": 8, "Cream of Rice Dry": 7, Bread: 3, Bagel: 6, "White Rice Cake": 1, Banana: 1, Blueberries: 1, Apple: 2, None: 0 };
const carbPrepTimes: Record<string, number> = { "Rice Cooked": 2, Potato: 6, "Sweet Potato": 6, "Oats Dry": 2, "Cream of Rice Dry": 2, Bread: 1, Bagel: 3, "White Rice Cake": 0, Banana: 1, Blueberries: 0, Apple: 2, None: 0 };
const vegetableBaseTimes: Record<string, number> = { Broccoli: 6, "Green Beans": 6, Asparagus: 5, Spinach: 2, "Mixed Salad Greens": 1, "Bell Peppers": 4, Zucchini: 4, Cauliflower: 8, None: 0 };
const vegetablePrepTimes: Record<string, number> = { Broccoli: 2, "Green Beans": 2, Asparagus: 2, Spinach: 1, "Mixed Salad Greens": 1, "Bell Peppers": 3, Zucchini: 2, Cauliflower: 3, None: 0 };

function round1(num: number): number {
  return Math.round(num * 10) / 10;
}

function calcMacros(item: FoodOption | undefined, grams: number): MacroSet {
  if (!item || grams <= 0) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const factor = grams / 100;
  return {
    calories: round1(item.macrosPer100.calories * factor),
    protein: round1(item.macrosPer100.protein * factor),
    carbs: round1(item.macrosPer100.carbs * factor),
    fat: round1(item.macrosPer100.fat * factor),
  };
}

function addMacros(parts: MacroSet[]): MacroSet {
  return parts.reduce(
    (acc, part) => ({
      calories: round1(acc.calories + part.calories),
      protein: round1(acc.protein + part.protein),
      carbs: round1(acc.carbs + part.carbs),
      fat: round1(acc.fat + part.fat),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

function gramsFor(item: FoodOption | undefined, goal: Goal): number {
  return item?.options[goal] ?? 0;
}

function formatIngredient(item: FoodOption | undefined, grams: number): string | null {
  if (!item || grams <= 0 || item.name === "None") return null;
  return `${grams}${item.unit} ${item.name}`;
}

function findByName(items: FoodOption[], name: string): FoodOption {
  return items.find((item) => item.name === name) ?? items[0];
}

function findFlavor(name: string): FlavorProfile {
  return flavorProfiles.find((item) => item.name === name) ?? flavorProfiles[0];
}

function getAdjustedTime(base: number, style: CookingStyle, itemName: string): number {
  if (base <= 0) return 0;
  if (style === "cold") return itemName === "Rice Cooked" ? 2 : base;
  if (style === "air_fryer") {
    if (itemName === "Potato") return 40;
    if (itemName === "Sweet Potato") return 35;
    if (itemName === "Chicken Breast") return 14;
    if (itemName === "Salmon") return 11;
    if (itemName === "Bagel") return 7;
    return Math.max(base, Math.round(base * 1.1));
  }
  if (style === "oven") {
    if (itemName === "Potato") return 50;
    if (itemName === "Sweet Potato") return 45;
    if (itemName === "Chicken Breast") return 22;
    if (itemName === "Salmon") return 14;
    if (itemName === "Bagel") return 8;
    return Math.max(base, Math.round(base * 1.25));
  }
  if (style === "pan" && itemName === "Bagel") return 5;
  return base;
}

function buildTimelineTask(name: string, prepTime: number, cookTime: number, detail: string): TimelineTask {
  return { name, prepTime, cookTime, totalTime: prepTime + cookTime, detail };
}

function smartProteinName(name: string): string {
  if (name === "Chicken Breast") return "Chicken";
  if (name === "Lean Ground Beef 90/10") return "Beef";
  if (name === "Turkey Breast Deli") return "Turkey";
  if (name === "Tuna In Water") return "Tuna";
  if (name === "Egg Whites") return "Egg White";
  if (name === "Whole Egg") return "Egg";
  if (name === "Greek Yogurt Nonfat") return "Greek Yogurt";
  if (name === "Cottage Cheese Low-Fat") return "Cottage Cheese";
  return name;
}

function smartCategoryName(category: MealCategory): string {
  if (category === "bowl") return "Power Bowl";
  if (category === "sandwich") return "Stack";
  if (category === "breakfast") return "Breakfast Build";
  return "Prep Box";
}

function smartGoalTag(goal: Goal): string {
  if (goal === "low_cal") return "Light";
  if (goal === "lean") return "Lean";
  if (goal === "anabolic") return "Anabolic";
  return "Bulk";
}

function smartCarbName(name: string): string {
  if (name === "Rice Cooked") return "Rice";
  if (name === "Oats Dry") return "Oats";
  if (name === "Cream of Rice Dry") return "Cream of Rice";
  if (name === "White Rice Cake") return "Rice Cakes";
  return name;
}

function smartFlavorName(name: string): string {
  if (name === "Creamy Protein") return "Creamy";
  return name;
}

function smartTimelineName(name: string): string {
  if (name === "Chicken Breast") return "Chicken";
  if (name === "Lean Ground Beef 90/10") return "Beef";
  if (name === "Turkey Breast Deli") return "Turkey";
  if (name === "Tuna In Water") return "Tuna";
  if (name === "Whole Egg") return "Eggs";
  if (name === "Rice Cooked") return "Rice";
  if (name === "Mixed Salad Greens") return "Greens";
  return name;
}

function buildSmartTitle(flavor: FlavorProfile, protein: FoodOption, carb: FoodOption, category: MealCategory, goal: Goal): string {
  const proteinName = smartProteinName(protein.name);
  const categoryName = smartCategoryName(category);
  const goalTag = smartGoalTag(goal);
  const flavorName = smartFlavorName(flavor.name);
  const carbPart = carb.name !== "None" ? ` with ${smartCarbName(carb.name)}` : "";
  return `${goalTag} ${flavorName} ${proteinName} ${categoryName}${carbPart}`;
}

function gramsToOunces(grams: number): number {
  return round1(grams / 28.3495);
}

function resolvePortion(item: FoodOption, goal: Goal, mode: PortionMode, customValue: number): number {
  if (item.name === "None") return 0;
  if (mode === "custom") return Math.max(0, customValue || 0);
  return gramsFor(item, goal);
}

function buildRecipe(
  protein: FoodOption,
  carb: FoodOption,
  fat: FoodOption,
  veg: FoodOption,
  flavor: FlavorProfile,
  goal: Goal,
  cookingStyle: CookingStyle,
  mealCategory: MealCategory,
  chefMode: ChefMode,
  portionMode: PortionMode,
  portions: PortionTargets
): RecipeOutput {
  const proteinGrams = resolvePortion(protein, goal, portionMode, portions.protein);
  const carbGrams = resolvePortion(carb, goal, portionMode, portions.carb);
  const fatGrams = resolvePortion(fat, goal, portionMode, portions.fat);
  const vegGrams = resolvePortion(veg, goal, portionMode, portions.veg);

  const total = addMacros([
    calcMacros(protein, proteinGrams),
    calcMacros(carb, carbGrams),
    calcMacros(fat, fatGrams),
    calcMacros(veg, vegGrams),
  ]);

  const title = carb.name !== "None" ? `${goalLabels[goal]} ${protein.name} + ${carb.name}` : `${goalLabels[goal]} ${protein.name} Meal`;
  const smartTitle = buildSmartTitle(flavor, protein, carb, mealCategory, goal);

  const ingredients = [
    formatIngredient(protein, proteinGrams),
    formatIngredient(carb, carbGrams),
    formatIngredient(fat, fatGrams),
    formatIngredient(veg, vegGrams),
  ].filter(Boolean) as string[];

  const proteinCookTime = getAdjustedTime(proteinBaseTimes[protein.name] ?? 0, cookingStyle, protein.name);
  const carbCookTime = getAdjustedTime(carbBaseTimes[carb.name] ?? 0, cookingStyle, carb.name);
  const vegCookTime = getAdjustedTime(vegetableBaseTimes[veg.name] ?? 0, cookingStyle, veg.name);
  const proteinPrepTime = proteinPrepTimes[protein.name] ?? 0;
  const carbPrepTime = carbPrepTimes[carb.name] ?? 0;
  const vegPrepTime = vegetablePrepTimes[veg.name] ?? 0;

  const tasks: TimelineTask[] = [
    protein.name !== "None" ? buildTimelineTask(protein.name, proteinPrepTime, proteinCookTime, `Prepare ${formatIngredient(protein, proteinGrams) ?? protein.name} as the protein.`) : null,
    carb.name !== "None" ? buildTimelineTask(carb.name, carbPrepTime, carbCookTime, `Prepare ${formatIngredient(carb, carbGrams) ?? carb.name} as the carb source.`) : null,
    veg.name !== "None" ? buildTimelineTask(veg.name, vegPrepTime, vegCookTime, `Prepare ${formatIngredient(veg, vegGrams) ?? veg.name} for volume and texture.`) : null,
  ].filter(Boolean) as TimelineTask[];

  const totalTime = Math.max(...tasks.map((task) => task.totalTime), 1);
  const sortedTasks = [...tasks].sort((a, b) => b.totalTime - a.totalTime || b.cookTime - a.cookTime || b.prepTime - a.prepTime || a.name.localeCompare(b.name));

  const steps: string[] = [];
  const timeline: TimelineEntry[] = [];
  const warnings: string[] = [];

  sortedTasks.forEach((task, index) => {
    const startAt = Math.max(totalTime - task.totalTime, 0);
    timeline.push({
      name: task.name,
      displayName: smartTimelineName(task.name),
      startAt,
      duration: task.totalTime,
      prepTime: task.prepTime,
      cookTime: task.cookTime,
    });

    const prepLabel = task.prepTime > 0 ? `${task.prepTime} min prep` : "no real prep";
    const cookLabel = task.cookTime > 0 ? `${task.cookTime} min cook` : "no cooking needed";

    if (index === 0) {
      steps.push(`Start with ${task.name.toLowerCase()} first because it is the longest part of the meal at about ${task.totalTime} minutes total (${prepLabel}, ${cookLabel}).`);
    } else {
      steps.push(`At the ${startAt}-minute mark, start ${task.name.toLowerCase()} so it finishes at the same time as the rest of the meal.`);
    }

    steps.push(task.detail);

    if (chefMode === "chef") {
      steps.push(`Chef timing note: ${task.name} should begin around minute ${startAt} of the overall cook so nothing sits too long or goes cold before assembly.`);
    }

    if (task.name === "Potato" || task.name === "Sweet Potato") {
      steps.push(`Cut the ${task.name.toLowerCase()} into even pieces, season lightly, and cook until tender inside and finished the way you want outside.`);
    } else if (task.name === "Rice Cooked") {
      steps.push("Get the rice cooking or reheating now so it is hot right when the protein finishes.");
    } else if (task.name === "Bagel") {
      steps.push("Slice the bagel, toast or heat it, and keep it ready for assembly so the inside stays warm and the texture stays right.");
    } else if (task.name === "Bread") {
      steps.push("Toast the bread if you want more structure, then keep it ready for the final build.");
    } else if (task.name === "Chicken Breast") {
      steps.push("Pat the chicken dry, season both sides, cook until fully done, and let it rest briefly before slicing.");
    } else if (task.name === "Lean Ground Beef 90/10") {
      steps.push("Break the beef apart as it cooks so it browns evenly, then drain excess grease if needed.");
    } else if (task.name === "Salmon") {
      steps.push("Season the salmon, cook presentation side down first, then flip carefully and finish just until tender.");
    } else if (task.name === "Egg Whites" || task.name === "Whole Egg") {
      steps.push("Cook the eggs over medium-low heat so they stay soft instead of turning rubbery.");
    } else if (task.name === "Turkey Breast Deli" || task.name === "Tuna In Water") {
      steps.push("This protein needs very little cooking, so keep it for the end or use it cold depending on the build.");
    } else if (task.name === "Oats Dry" || task.name === "Cream of Rice Dry") {
      steps.push(`Measure the ${task.name.toLowerCase()}, add liquid gradually, and stir until smooth so it does not clump.`);
    } else if (task.name === "Spinach" || task.name === "Mixed Salad Greens") {
      steps.push(`Keep the ${task.name.toLowerCase()} for the very end since it needs only a quick wilt or no cooking at all.`);
    }
  });

  steps.push("As the final components finish, clear your serving bowl, plate, sandwich station, or meal prep containers so assembly is immediate.");

  if (chefMode === "chef") {
    steps.push("Chef mode finish: use the final minute to check seasoning, texture, and temperature so every component lands hot, properly cooked, and ready to serve at once.");
  }

  if (fat.name !== "None") {
    steps.push(`Add the ${fat.name.toLowerCase()} at the end so texture stays better and the flavor stays more noticeable.`);
    if (chefMode === "chef") {
      steps.push(`Chef mode finish: adding ${fat.name.toLowerCase()} late keeps the mouthfeel cleaner and prevents it from getting lost during cooking.`);
    }
  }

  steps.push(`Season and finish everything with ${flavor.seasonings.join(", ")} for the ${flavor.name.toLowerCase()} profile.`);
  steps.push(flavor.sauce);

  if (mealCategory === "sandwich") {
    steps.push("Toast the bread or bagel if desired, then layer the protein, vegetables, and finishers evenly so the sandwich holds together cleanly.");
  } else if (mealCategory === "meal_prep") {
    steps.push("Split the meal evenly into containers while everything is fresh, then let it cool slightly before sealing so condensation does not make it soggy.");
  } else if (mealCategory === "breakfast") {
    steps.push("Plate it as a breakfast build, keeping the hot items together and adding any cold toppings right at the end.");
  } else {
    steps.push("Build it as a bowl and mix or layer it right away so each bite has the same flavor balance.");
  }

  if (cookingStyle === "cold" && ["Chicken Breast", "Salmon", "Lean Ground Beef 90/10"].includes(protein.name)) {
    warnings.push("Cold prep is less ideal for this protein unless it was cooked in advance and chilled safely.");
  }
  if (mealCategory === "sandwich" && carb.name === "None") {
    warnings.push("A sandwich category usually works better with bread, bagel, or rice cakes selected as the carb base.");
  }
  if (mealCategory === "breakfast" && flavor.name === "Spicy" && ["Greek Yogurt Nonfat", "Whey Isolate"].includes(protein.name)) {
    warnings.push("This breakfast combination can work, but creamy or sweet-savory is often a more natural match.");
  }
  if (goal === "bulk" && carb.name === "None") {
    warnings.push("Bulk meals usually work better with a carb source included.");
  }

  const finalInstructions = chefMode === "quick" ? steps.filter((_, index) => index < 6 || index % 2 === 0) : steps;

  return {
    title,
    smartTitle,
    ingredients,
    instructions: finalInstructions,
    total,
    warnings,
    estimatedTime: totalTime,
    timeline: timeline.sort((a, b) => a.startAt - b.startAt || b.duration - a.duration),
  };
}

function runSelfTests(): void {
  const chicken = findByName(proteins, "Chicken Breast");
  const rice = findByName(carbs, "Rice Cooked");
  const none = findByName(carbs, "None");
  const broccoli = findByName(vegetables, "Broccoli");
  const oil = findByName(fats, "Olive Oil");
  const flavor = findFlavor("Garlic Herb");

  const chickenLean = calcMacros(chicken, gramsFor(chicken, "lean"));
  if (chickenLean.protein <= 0) throw new Error("Self-test failed: chicken protein should be greater than zero.");

  const riceBulk = calcMacros(rice, gramsFor(rice, "bulk"));
  if (riceBulk.carbs <= chickenLean.carbs) throw new Error("Self-test failed: rice bulk carbs should exceed chicken carbs.");

  const noneMacros = calcMacros(none, gramsFor(none, "lean"));
  if (noneMacros.calories !== 0 || noneMacros.protein !== 0 || noneMacros.carbs !== 0 || noneMacros.fat !== 0) {
    throw new Error("Self-test failed: none option should have zero macros.");
  }

  const added = addMacros([
    { calories: 100, protein: 10, carbs: 20, fat: 3 },
    { calories: 50, protein: 5, carbs: 5, fat: 2 },
  ]);
  if (added.calories !== 150 || added.protein !== 15 || added.carbs !== 25 || added.fat !== 5) {
    throw new Error("Self-test failed: macro addition returned the wrong totals.");
  }

  const timedRecipe = buildRecipe(chicken, findByName(carbs, "Potato"), oil, broccoli, flavor, "lean", "air_fryer", "bowl", "chef", "auto", { protein: 150, carb: 200, fat: 5, veg: 120 });
  if (timedRecipe.estimatedTime < 40) throw new Error("Self-test failed: air fryer potato meal should use the longer cook time.");
  if (!timedRecipe.instructions[0]?.toLowerCase().includes("potato")) throw new Error("Self-test failed: longest-cooking potato task should be scheduled first.");

  const bagelRecipe = buildRecipe(
    findByName(proteins, "Turkey Breast Deli"),
    findByName(carbs, "Bagel"),
    findByName(fats, "Avocado"),
    findByName(vegetables, "Mixed Salad Greens"),
    findFlavor("Creamy Protein"),
    "lean",
    "pan",
    "sandwich",
    "chef",
    "auto",
    { protein: 120, carb: 75, fat: 40, veg: 80 }
  );
  if (!bagelRecipe.instructions[0]?.toLowerCase().includes("bagel")) throw new Error("Self-test failed: bagel task should lead when it takes longer than the other selected items.");

  const coldBreakfast = buildRecipe(
    findByName(proteins, "Greek Yogurt Nonfat"),
    findByName(carbs, "Oats Dry"),
    findByName(fats, "Peanut Butter"),
    findByName(vegetables, "None"),
    findFlavor("Sweet Savory"),
    "bulk",
    "cold",
    "breakfast",
    "chef",
    "auto",
    { protein: 220, carb: 70, fat: 24, veg: 0 }
  );
  if (coldBreakfast.estimatedTime <= 0) throw new Error("Self-test failed: breakfast recipe should still have a positive estimated time.");
  if (!coldBreakfast.smartTitle.toLowerCase().includes("breakfast")) throw new Error("Self-test failed: smart title should reflect the meal category.");
  if (coldBreakfast.timeline.length === 0) throw new Error("Self-test failed: timeline should contain at least one task.");
  if (buildSmartTitle(findFlavor("Garlic Herb"), findByName(proteins, "Chicken Breast"), findByName(carbs, "Rice Cooked"), "bowl", "lean").includes("Cooked")) {
    throw new Error("Self-test failed: smart title should shorten raw carb labels.");
  }

  const customRecipe = buildRecipe(chicken, rice, oil, broccoli, flavor, "lean", "pan", "bowl", "quick", "custom", { protein: 210, carb: 175, fat: 12, veg: 90 });
  if (!customRecipe.ingredients.some((item) => item.includes("210g Chicken Breast"))) throw new Error("Self-test failed: custom portion mode should use the provided gram targets.");
  if (gramsToOunces(56.7) !== 2) throw new Error("Self-test failed: gram to ounce conversion should round correctly.");
}

runSelfTests();

const cardStyle: React.CSSProperties = {
  background: `linear-gradient(180deg, ${theme.card} 0%, ${theme.cardAlt} 100%)`,
  border: `1px solid ${theme.border}`,
  borderRadius: 24,
  boxShadow: "0 14px 40px rgba(0,0,0,0.34)",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.24em",
  color: theme.accent,
  fontWeight: 700,
};

const selectStyle: React.CSSProperties = {
  height: 50,
  borderRadius: 16,
  border: `1px solid ${theme.border}`,
  padding: "0 14px",
  fontSize: 15,
  background: theme.bgSoft,
  color: theme.text,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

export default function SclassSavoryApp() {
  const [chefMode, setChefMode] = useState<ChefMode>("chef");
  const [portionMode, setPortionMode] = useState<PortionMode>("auto");
  const [customPortions, setCustomPortions] = useState<PortionTargets>({ protein: 150, carb: 150, fat: 10, veg: 100 });
  const [cookingStyle, setCookingStyle] = useState<CookingStyle>("pan");
  const [mealCategory, setMealCategory] = useState<MealCategory>("bowl");
  const [goal, setGoal] = useState<Goal>("lean");
  const [proteinName, setProteinName] = useState("Chicken Breast");
  const [carbName, setCarbName] = useState("Rice Cooked");
  const [fatName, setFatName] = useState("Olive Oil");
  const [vegName, setVegName] = useState("Broccoli");
  const [flavorName, setFlavorName] = useState("Garlic Herb");
  const [activeTab, setActiveTab] = useState<TabKey>("ingredients");

  const protein = findByName(proteins, proteinName);
  const carb = findByName(carbs, carbName);
  const fat = findByName(fats, fatName);
  const veg = findByName(vegetables, vegName);
  const flavor = findFlavor(flavorName);

  const recipe = useMemo(
    () => buildRecipe(protein, carb, fat, veg, flavor, goal, cookingStyle, mealCategory, chefMode, portionMode, customPortions),
    [protein, carb, fat, veg, flavor, goal, cookingStyle, mealCategory, chefMode, portionMode, customPortions]
  );

  function applyPreset(preset: Preset): void {
    setProteinName(preset.protein);
    setCarbName(preset.carb);
    setFatName(preset.fat);
    setVegName(preset.veg);
    setFlavorName(preset.flavor);
    setGoal(preset.goal);
    if (preset.cookingStyle) setCookingStyle(preset.cookingStyle);
    if (preset.mealCategory) setMealCategory(preset.mealCategory);
    setPortionMode("auto");
    setCustomPortions({
      protein: gramsFor(findByName(proteins, preset.protein), preset.goal),
      carb: gramsFor(findByName(carbs, preset.carb), preset.goal),
      fat: gramsFor(findByName(fats, preset.fat), preset.goal),
      veg: gramsFor(findByName(vegetables, preset.veg), preset.goal),
    });
    setActiveTab("ingredients");
  }

  function brandedExport(): void {
    const content = [
      "SCLASS FITNESS SAVORY RECIPE",
      "",
      `Recipe: ${recipe.smartTitle}`,
      `Goal: ${goalLabels[goal]}`,
      `Flavor Profile: ${flavor.name}`,
      `Cooking Style: ${cookingStyle.replace("_", " ")}`,
      `Meal Category: ${mealCategory.replace("_", " ")}`,
      `Estimated Time: ${recipe.estimatedTime} min`,
      "",
      "Ingredients",
      ...recipe.ingredients.map((item) => `- ${item}`),
      "",
      "Flavor Notes",
      `- Seasonings: ${flavor.seasonings.join(", ")}`,
      `- Sauce / finish: ${flavor.sauce}`,
      `- Best use: ${flavor.method}`,
      "",
      ...(recipe.warnings.length ? ["Warnings", ...recipe.warnings.map((warning) => `- ${warning}`), ""] : []),
      "Instructions",
      ...recipe.instructions.map((step, index) => `${index + 1}. ${step}`),
      "",
      "Macros",
      `- Calories: ${recipe.total.calories}`,
      `- Protein: ${recipe.total.protein}g`,
      `- Carbs: ${recipe.total.carbs}g`,
      `- Fat: ${recipe.total.fat}g`,
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${recipe.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, color: theme.text, fontFamily: theme.bodyFont }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: 20 }}>
        <div style={{ ...cardStyle, padding: 28, marginBottom: 20, minWidth: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ maxWidth: 780, minWidth: 0 }}>
              <div style={sectionTitleStyle}>Sclass Fitness</div>
              <h1 style={{ margin: "10px 0 12px", fontSize: 46, lineHeight: 1.03, color: theme.text, fontFamily: theme.headingFont, letterSpacing: "0.02em" }}>
                Savory Builder Elite V3
              </h1>
              <p style={{ margin: 0, color: theme.subtext, fontSize: 16, lineHeight: 1.7 }}>
                Build real food meals in the same premium format as your dessert system: choose the goal, select the food structure, lock in the flavor profile, then generate smart names, a real cooking timeline, and quick or chef-level instructions timed so everything finishes together.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <Tag>Luxury UI</Tag>
              <Tag>Full Engine</Tag>
              <Tag>Timed Flow</Tag>
              <Tag>Chef Mode</Tag>
              <Tag>Smart Naming</Tag>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20, alignItems: "start" }}>
          <div style={{ ...cardStyle, padding: 24, minWidth: 0, overflow: "hidden" }}>
            <div style={{ fontSize: 30, fontWeight: 700, marginBottom: 16, fontFamily: theme.headingFont, color: theme.text }}>Builder Controls</div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
              <SelectField label="Goal" value={goal} onChange={(value) => setGoal(value as Goal)} options={Object.entries(goalLabels).map(([value, label]) => ({ value, label }))} />
              <SelectField label="Flavor Profile" value={flavorName} onChange={setFlavorName} options={flavorProfiles.map((item) => ({ value: item.name, label: item.name }))} />
              <SelectField label="Protein" value={proteinName} onChange={setProteinName} options={proteins.map((item) => ({ value: item.name, label: item.name }))} />
              <SelectField label="Carb" value={carbName} onChange={setCarbName} options={carbs.map((item) => ({ value: item.name, label: item.name }))} />
              <SelectField label="Fat" value={fatName} onChange={setFatName} options={fats.map((item) => ({ value: item.name, label: item.name }))} />
              <SelectField label="Vegetable" value={vegName} onChange={setVegName} options={vegetables.map((item) => ({ value: item.name, label: item.name }))} />
              <SelectField label="Cooking Style" value={cookingStyle} onChange={(value) => setCookingStyle(value as CookingStyle)} options={[{ value: "pan", label: "Pan" }, { value: "air_fryer", label: "Air Fryer" }, { value: "oven", label: "Oven" }, { value: "cold", label: "Cold Prep" }]} />
              <SelectField label="Meal Category" value={mealCategory} onChange={(value) => setMealCategory(value as MealCategory)} options={[{ value: "bowl", label: "Bowl" }, { value: "sandwich", label: "Sandwich" }, { value: "breakfast", label: "Breakfast" }, { value: "meal_prep", label: "Meal Prep" }]} />
              <SelectField label="Chef Mode" value={chefMode} onChange={(value) => setChefMode(value as ChefMode)} options={[{ value: "chef", label: "Chef" }, { value: "quick", label: "Quick" }]} />
              <SelectField label="Portion Mode" value={portionMode} onChange={(value) => setPortionMode(value as PortionMode)} options={[{ value: "auto", label: "Auto" }, { value: "custom", label: "Custom" }]} />
            </div>

            <div style={{ marginTop: 14, padding: 14, borderRadius: 16, background: theme.bgSoft, border: `1px solid ${theme.border}` }}>
              <div style={{ color: theme.accent, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 8 }}>Mode Guide</div>
              <div style={{ color: theme.subtext, fontSize: 13, lineHeight: 1.7 }}>
                <strong style={{ color: theme.text }}>Chef:</strong> more detailed timing notes, better sequencing, and fuller finishing guidance. <strong style={{ color: theme.text }}>Quick:</strong> shorter, cleaner instructions for fast reading while keeping the same meal structure.
              </div>
            </div>

            <p style={{ margin: "14px 0 0", color: theme.subtext, fontSize: 13, lineHeight: 1.6 }}>{goalDescriptions[goal]}</p>

            {portionMode === "custom" && (
              <div style={{ marginTop: 14, padding: 14, borderRadius: 16, background: theme.bgSoft, border: `1px solid ${theme.border}` }}>
                <div style={{ color: theme.accent, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 10 }}>Custom Meal Portions</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                  <NumberField label="Protein (g)" value={customPortions.protein} onChange={(value) => setCustomPortions((prev) => ({ ...prev, protein: value }))} helper={`${gramsToOunces(customPortions.protein)} oz`} />
                  <NumberField label="Carb (g)" value={customPortions.carb} onChange={(value) => setCustomPortions((prev) => ({ ...prev, carb: value }))} helper={`${gramsToOunces(customPortions.carb)} oz`} />
                  <NumberField label="Fat/Add-on (g)" value={customPortions.fat} onChange={(value) => setCustomPortions((prev) => ({ ...prev, fat: value }))} helper={`${gramsToOunces(customPortions.fat)} oz`} />
                  <NumberField label="Veg (g)" value={customPortions.veg} onChange={(value) => setCustomPortions((prev) => ({ ...prev, veg: value }))} helper={`${gramsToOunces(customPortions.veg)} oz`} />
                </div>
                <div style={{ marginTop: 10, color: theme.subtext, fontSize: 13, lineHeight: 1.7 }}>
                  Use this mode for meal plans and plug-and-play portion targets. Enter exact grams and the builder recalculates the recipe and macros instantly while keeping the cooking flow.
                </div>
              </div>
            )}

            <div style={{ height: 1, background: theme.border, margin: "22px 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
              <div style={sectionTitleStyle}>Quick Presets</div>
              <button onClick={brandedExport} style={primaryButtonStyle}>Export Recipe</button>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {presets.map((preset) => (
                <button key={preset.name} onClick={() => applyPreset(preset)} style={secondaryButtonStyle}>
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ ...cardStyle, padding: 24, minWidth: 0, overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: 18 }}>
              <div style={{ minWidth: 0 }}>
                <div style={sectionTitleStyle}>Generated Meal</div>
                <h2 style={{ margin: "10px 0 8px", fontSize: 36, lineHeight: 1.08, fontFamily: theme.headingFont, color: theme.text }}>{recipe.smartTitle}</h2>
                <div style={{ color: theme.accent, fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{recipe.title}</div>
                <p style={{ margin: 0, color: theme.subtext, lineHeight: 1.6 }}>{goalDescriptions[goal]}</p>
              </div>
              <div style={{ background: theme.accentSoft, color: theme.text, borderRadius: 22, padding: "16px 18px", minWidth: 190, border: `1px solid rgba(201,163,92,0.28)` }}>
                <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.18em", color: theme.accent, marginBottom: 6 }}>Flavor Profile</div>
                <div style={{ fontSize: 21, fontWeight: 700 }}>{flavor.name}</div>
                <div style={{ marginTop: 8, color: theme.subtext, fontSize: 13 }}>Estimated time: {recipe.estimatedTime} min</div>
                <div style={{ marginTop: 4, color: theme.subtext, fontSize: 13 }}>Mode: {chefMode === "chef" ? "Chef" : "Quick"}</div>
                <div style={{ marginTop: 4, color: theme.subtext, fontSize: 13 }}>Portions: {portionMode === "custom" ? "Custom" : "Auto"}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))", gap: 12, marginBottom: 20 }}>
              <StatCard label="Calories" value={`${recipe.total.calories}`} />
              <StatCard label="Protein" value={`${recipe.total.protein}g`} />
              <StatCard label="Carbs" value={`${recipe.total.carbs}g`} />
              <StatCard label="Fat" value={`${recipe.total.fat}g`} />
            </div>

            {recipe.warnings.length > 0 && (
              <div style={{ marginBottom: 18, padding: 16, borderRadius: 18, background: "rgba(201,163,92,0.10)", border: "1px solid rgba(201,163,92,0.24)" }}>
                <div style={{ ...sectionTitleStyle, marginBottom: 10 }}>Combination Notes</div>
                <div style={{ display: "grid", gap: 8 }}>
                  {recipe.warnings.map((warning) => (
                    <div key={warning} style={{ color: theme.subtext, lineHeight: 1.6 }}>{warning}</div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              <button onClick={() => setActiveTab("ingredients")} style={tabButtonStyle(activeTab === "ingredients")}>Ingredients</button>
              <button onClick={() => setActiveTab("instructions")} style={tabButtonStyle(activeTab === "instructions")}>Instructions</button>
              <button onClick={() => setActiveTab("flavor")} style={tabButtonStyle(activeTab === "flavor")}>Flavor Notes</button>
              <button onClick={() => setActiveTab("timeline")} style={tabButtonStyle(activeTab === "timeline")}>Timeline</button>
            </div>

            {activeTab === "ingredients" && (
              <>
                <div style={{ marginBottom: 14, padding: 14, borderRadius: 16, background: theme.bgSoft, border: `1px solid ${theme.border}` }}>
                  <div style={{ color: theme.accent, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 8 }}>Meal Plan Portion Snapshot</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
                    {protein.name !== "None" && <MiniPortionCard label={smartProteinName(protein.name)} grams={resolvePortion(protein, goal, portionMode, customPortions.protein)} />}
                    {carb.name !== "None" && <MiniPortionCard label={smartCarbName(carb.name)} grams={resolvePortion(carb, goal, portionMode, customPortions.carb)} />}
                    {fat.name !== "None" && <MiniPortionCard label={fat.name} grams={resolvePortion(fat, goal, portionMode, customPortions.fat)} />}
                    {veg.name !== "None" && <MiniPortionCard label={smartTimelineName(veg.name)} grams={resolvePortion(veg, goal, portionMode, customPortions.veg)} />}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                  {recipe.ingredients.map((ingredient) => (
                    <div key={ingredient} style={{ border: `1px solid ${theme.border}`, borderRadius: 18, padding: 16, background: theme.bgSoft, color: theme.text, minWidth: 0 }}>
                      {ingredient}
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === "instructions" && (
              <div style={{ display: "grid", gap: 12 }}>
                {recipe.instructions.map((instruction, index) => (
                  <div key={`${index}-${instruction}`} style={{ display: "flex", gap: 14, border: `1px solid ${theme.border}`, borderRadius: 18, padding: 16, background: theme.bgSoft, minWidth: 0 }}>
                    <div style={{ minWidth: 34, height: 34, borderRadius: 999, background: theme.accent, color: "#111", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14 }}>
                      {index + 1}
                    </div>
                    <div style={{ color: theme.subtext, lineHeight: 1.7 }}>{instruction}</div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "flavor" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
                <div style={{ border: `1px solid ${theme.border}`, borderRadius: 18, padding: 16, background: theme.bgSoft, minWidth: 0 }}>
                  <div style={{ ...sectionTitleStyle, marginBottom: 12 }}>Seasonings</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {flavor.seasonings.map((item) => (
                      <span key={item} style={{ padding: "8px 12px", borderRadius: 999, background: theme.accentSoft, border: "1px solid rgba(201,163,92,0.22)", color: theme.text, fontSize: 13, fontWeight: 600 }}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ border: `1px solid ${theme.border}`, borderRadius: 18, padding: 16, background: theme.bgSoft, minWidth: 0 }}>
                  <div style={{ ...sectionTitleStyle, marginBottom: 12 }}>Best Use</div>
                  <div style={{ color: theme.subtext, lineHeight: 1.7 }}>{flavor.method}</div>
                  <div style={{ color: theme.subtext, lineHeight: 1.7, marginTop: 10 }}>{flavor.sauce}</div>
                </div>
              </div>
            )}

            {activeTab === "timeline" && (
              <div style={{ display: "grid", gap: 14 }}>
                <div style={{ border: `1px solid ${theme.border}`, borderRadius: 18, padding: 16, background: theme.bgSoft, minWidth: 0 }}>
                  <div style={{ ...sectionTitleStyle, marginBottom: 12 }}>Visual Timeline</div>
                  <div style={{ display: "grid", gap: 12 }}>
                    {recipe.timeline.map((entry, index) => {
                      const left = recipe.estimatedTime > 0 ? `${(entry.startAt / recipe.estimatedTime) * 100}%` : "0%";
                      const width = recipe.estimatedTime > 0 ? `${(entry.duration / recipe.estimatedTime) * 100}%` : "0%";
                      return (
                        <div key={`${entry.name}-${index}`}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
                            <div style={{ color: theme.text, fontWeight: 700 }}>{entry.displayName}</div>
                            <div style={{ color: theme.subtext, fontSize: 13 }}>Start {entry.startAt} min • Duration {entry.duration} min</div>
                          </div>
                          <div style={{ position: "relative", height: 12, borderRadius: 999, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                            <div style={{ position: "absolute", left, width, top: 0, bottom: 0, borderRadius: 999, background: `linear-gradient(90deg, ${theme.accent} 0%, #e7c98f 100%)` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: "grid", gap: 12 }}>
                  {recipe.timeline.map((entry, index) => (
                    <div key={`${entry.name}-${index}`} style={{ border: `1px solid ${theme.border}`, borderRadius: 18, padding: 16, background: theme.bgSoft, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
                        <div style={{ color: theme.text, fontWeight: 700 }}>{entry.displayName}</div>
                        <div style={{ color: theme.accent, fontWeight: 700 }}>Start at {entry.startAt} min</div>
                      </div>
                      <div style={{ color: theme.subtext, lineHeight: 1.7 }}>Duration: {entry.duration} min total • Prep: {entry.prepTime} min • Cook: {entry.cookTime} min</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginTop: 20 }}>
          <InfoCard title="Protein Logic" body="Each protein has goal-based gram targets built in, so the app auto-adjusts meal size when users switch between low cal, lean, anabolic, and bulk." />
          <InfoCard title="Carb Scaling" body="Carbs scale automatically by goal type so the meal stays balanced without the user doing manual math." />
          <InfoCard title="Flavor Engine" body="Flavor profiles are separate from the food builder, which makes it easy to expand later with more sauces, presets, and meal styles." />
          <InfoCard title="Instruction Builder" body="The app sequences the truly longest task first using prep time plus cook time, then fits the other components around it so everything lands hot together." />
          <InfoCard title="Chef Mode" body="Chef mode keeps the fuller instructional detail and timing notes, while quick mode trims the recipe down for faster reading." />
          <InfoCard title="Meal Plan Portions" body="Custom portion mode lets you plug in exact grams with ounce equivalents so the builder works like a meal-plan creator instead of only using presets." />
        </div>
      </div>
    </div>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
};

type NumberFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  helper?: string;
};

function NumberField({ label, value, onChange, helper }: NumberFieldProps) {
  return (
    <label style={{ display: "grid", gap: 8, minWidth: 0 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: theme.subtext, textTransform: "uppercase", letterSpacing: "0.12em" }}>{label}</span>
      <input
        type="number"
        min={0}
        step={1}
        value={value}
        onChange={(event) => onChange(Math.max(0, Number(event.target.value) || 0))}
        style={selectStyle}
      />
      {helper ? <span style={{ color: theme.subtext, fontSize: 12 }}>{helper}</span> : null}
    </label>
  );
}

function MiniPortionCard({ label, grams }: { label: string; grams: number }) {
  return (
    <div style={{ border: `1px solid ${theme.border}`, borderRadius: 14, padding: 12, background: "rgba(255,255,255,0.02)" }}>
      <div style={{ color: theme.subtext, fontSize: 12, marginBottom: 6 }}>{label}</div>
      <div style={{ color: theme.text, fontWeight: 700 }}>{grams}g</div>
      <div style={{ color: theme.subtext, fontSize: 12 }}>{gramsToOunces(grams)} oz</div>
    </div>
  );
}

function SelectField({ label, value, onChange, options }: SelectFieldProps) {
  return (
    <label style={{ display: "grid", gap: 8, minWidth: 0 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: theme.subtext, textTransform: "uppercase", letterSpacing: "0.12em" }}>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} style={selectStyle}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ padding: "10px 14px", borderRadius: 999, border: `1px solid rgba(201,163,92,0.24)`, background: theme.accentSoft, color: theme.text, fontSize: 13, fontWeight: 700 }}>
      {children}
    </span>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: theme.bgSoft, border: `1px solid ${theme.border}`, borderRadius: 20, padding: 16, minWidth: 0 }}>
      <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.18em", color: theme.accent, fontWeight: 700 }}>{label}</div>
      <div style={{ marginTop: 10, fontSize: 28, fontWeight: 700, color: theme.text }}>{value}</div>
    </div>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ ...cardStyle, padding: 20, minWidth: 0 }}>
      <div style={{ ...sectionTitleStyle, marginBottom: 10 }}>{title}</div>
      <div style={{ color: theme.subtext, lineHeight: 1.7 }}>{body}</div>
    </div>
  );
}

const primaryButtonStyle: React.CSSProperties = {
  height: 42,
  borderRadius: 16,
  border: "none",
  background: theme.accent,
  color: "#111",
  padding: "0 16px",
  fontWeight: 800,
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  minHeight: 38,
  borderRadius: 999,
  border: `1px solid ${theme.border}`,
  background: theme.bgSoft,
  color: theme.text,
  padding: "8px 14px",
  fontWeight: 600,
  cursor: "pointer",
};

function tabButtonStyle(isActive: boolean): React.CSSProperties {
  return {
    minHeight: 40,
    borderRadius: 16,
    border: `1px solid ${isActive ? "rgba(201,163,92,0.32)" : theme.border}`,
    background: isActive ? theme.accentSoft : theme.bgSoft,
    color: theme.text,
    padding: "8px 14px",
    fontWeight: 700,
    cursor: "pointer",
  };
}
