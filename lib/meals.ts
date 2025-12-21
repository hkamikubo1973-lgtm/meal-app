// lib/meals.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Meal = {
  name: string;      // 例：朝食/昼食/夕食
  kcal: number;
  p: number;
  f: number;
  c: number;
  salt: number;
  createdAt: number; // Date.now()
};

type MealsToday = {
  dateKey: string; // YYYY-MM-DD
  items: Meal[];
};

const KEY = "meals_today_v1";

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function loadMealsToday(): Promise<Meal[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as MealsToday;
    if (parsed.dateKey !== todayKey()) return [];
    return Array.isArray(parsed.items) ? parsed.items : [];
  } catch {
    return [];
  }
}

export async function addMealToday(meal: Meal): Promise<void> {
  const items = await loadMealsToday();
  const next: MealsToday = {
    dateKey: todayKey(),
    items: [meal, ...items],
  };
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}

export async function clearMealsToday(): Promise<void> {
  const next: MealsToday = { dateKey: todayKey(), items: [] };
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}
