// lib/openfoodfacts.ts
// OpenFoodFacts からバーコードで栄養成分を取得（基準：100g / 100ml）
// 可能なら 1食量(serving: g) も返します。

type OFFProduct = {
  product_name?: string;
  nutriments?: Record<string, any>;
  serving_quantity?: any;
  serving_size?: any;
};

type Nutrition = {
  name: string;
  // すべて「100g(または100ml)あたり」の基準値
  kcal: number;
  p: number;
  f: number;
  c: number;
  fiber: number;
  sodium: number; // 食塩相当量(g)
  serving?: number | null; // 1食量(g) が取れたら付与
};

export async function fetchByBarcode(barcode: string): Promise<Nutrition> {
  const url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`OpenFoodFacts HTTP ${res.status}`);
  const json = await res.json();

  const p: OFFProduct | undefined = json?.product;
  if (!p) throw new Error("not found");

  const n = p.nutriments || {};

  // --- 100g/100ml あたりの値を取得（なければ安全に 0 に落とす） ---
  // エネルギーは kcal がなければ kJ → kcal 換算
  const kcal100 =
    toNum(n["energy-kcal_100g"]) ??
    kjToKcal(n["energy_100g"]) ??
    0;

  const protein100 = toNum(n["proteins_100g"]) ?? toNum(n["proteins"]) ?? 0;
  const fat100     = toNum(n["fat_100g"])       ?? toNum(n["fat"])       ?? 0;
  const carb100    = toNum(n["carbohydrates_100g"]) ?? toNum(n["carbohydrates"]) ?? 0;
  const fiber100   = toNum(n["fiber_100g"])     ?? toNum(n["fiber"])     ?? 0;

  // 食塩相当量：salt_100g を優先。なければ sodium_100g(ナトリウム g) → 食塩相当量 = Na(g)*2.54
  const sodiumNa100 = toNum(n["sodium_100g"]); // ナトリウム(g)
  const salt100 =
    toNum(n["salt_100g"]) ??
    (sodiumNa100 != null ? sodiumNa100 * 2.54 : 0);

  // 1食量(g) が取れれば返す（無理なら null）
  const serving = getServingGram(p);

  return {
    name: p.product_name || "バーコード食品",
    kcal: round1(kcal100),
    p:    round1(protein100),
    f:    round1(fat100),
    c:    round1(carb100),
    fiber:   round1(fiber100),
    sodium:  round1(salt100),
    serving,
  };
}

/* ===================== ヘルパー ===================== */

// 数値化（ダメなら null）
function toNum(x: any): number | null {
  if (x == null) return null;
  const v = Number(String(x).replace(",", "."));
  return Number.isFinite(v) ? v : null;
}

// 小数1桁に丸め（非数は 0）
function round1(v: any): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 10) / 10;
}

// kJ → kcal 換算（1 kcal = 4.184 kJ）
function kjToKcal(kj: any): number | null {
  const v = toNum(kj);
  if (v == null) return null;
  return v / 4.184;
}

// 1食量(g) を推定
function getServingGram(p: OFFProduct): number | null {
  const q = toNum(p.serving_quantity);
  if (q != null && q > 0) return q;

  const s = String(p.serving_size ?? "");
  const m = s.match(/([\d.,]+)\s*(g|ml)\b/i);
  if (m) {
    const v = Number(m[1].replace(",", "."));
    if (Number.isFinite(v)) return v;
  }
  return null;
}
