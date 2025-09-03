// meal-app/lib/foodSearch.ts
import Fuse from "fuse.js";
import foods from "../constants/foods-ja.json";

export type FoodItem = {
  name: string;
  aliases?: string[];
  kcal?: number;
  p?: number;
  f?: number;
  c?: number;
  fiber?: number;
  sodium?: number;
};

const fuse = new Fuse(foods as FoodItem[], {
  keys: ["name", "aliases"],
  threshold: 0.35,
  ignoreLocation: true,
});

// ← ← 重要：名前付きエクスポート
export function searchFoods(query: string): FoodItem[] {
  const q = (query ?? "").trim();
  if (!q) return [];

  if (!fuse) {
    console.warn("fuse is not initialized");
    return [];
  }

  const results = fuse.search(q);
  if (!Array.isArray(results)) {
    console.warn("fuse.search returned invalid:", results);
    return [];
  }

  return results.slice(0, 10).map((h) => h.item as FoodItem);
}
