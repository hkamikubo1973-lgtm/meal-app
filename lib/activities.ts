// meal-app/lib/activities.ts
// 運動の簡易辞書 ＋ 消費kcal計算

export type ActivityUnit = "rep" | "min" | "km";
export type ActivityId =
  | "pushup" | "squat" | "pullup" | "lunge" | "plank"
  | "walk" | "jog" | "run";

export type Activity = {
  id: ActivityId;
  name: string;        // 表示名
  unit: ActivityUnit;  // 回/分/km
  // 体重比例の係数:
  //  rep: 1回あたり (weightKg * coef)
  //  min: 1分あたり (weightKg * coef)
  //  km : 1kmあたり (weightKg * coef)
  coef: number;
};

export const ACTIVITIES: Activity[] = [
  { id: "pushup", name: "腕立て",     unit: "rep", coef: 0.13 },
  { id: "squat",  name: "スクワット", unit: "rep", coef: 0.10 },
  { id: "pullup", name: "懸垂",       unit: "rep", coef: 0.30 },
  { id: "lunge",  name: "ランジ",     unit: "rep", coef: 0.12 },

  { id: "plank",  name: "プランク",   unit: "min", coef: 0.18 },
  { id: "walk",   name: "ウォーク",   unit: "min", coef: 0.07 },
  { id: "jog",    name: "ジョグ",     unit: "min", coef: 0.12 },

  // 体重(kg) × 距離(km) ≒ kcal のラフ目安
  { id: "run",    name: "ラン",       unit: "km",  coef: 1.0 },
];

// id から辞書アイテム取得
export function getActivity(id: ActivityId): Activity {
  const a = ACTIVITIES.find(v => v.id === id);
  if (!a) throw new Error("Unknown activity: " + id);
  return a;
}

// 消費kcalを計算（整数丸め）
export function calcWorkoutKcal(weightKg: number, id: ActivityId, qty: number): number {
  const a = getActivity(id);
  const kcal = (weightKg || 70) * a.coef * Math.max(0, qty || 0);
  return Math.round(kcal);
}
