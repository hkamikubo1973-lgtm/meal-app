// lib/unitPrefs.ts
export type UnitPrefs = {
  // 将来の拡張用（今は固定で使う）
  water: "L" | "ml";
  salt: "g" | "mg";
  steps: "steps";
  sleep: "hours" | "minutes";
  weight?: "kg" | "lb";
};

export const defaultUnitPrefs: UnitPrefs = {
  water: "L",
  salt: "g",
  steps: "steps",
  sleep: "hours",
  weight: "kg",
};

// いまはローカル保存なしで既定値を返す。
// （必要になったら AsyncStorage 連携に差し替えます）
export async function loadUnitPrefs(): Promise<UnitPrefs> {
  return defaultUnitPrefs;
}

/**
 * 表示用の単位ラベルを返す。
 * index.tsx からは unitLabel("waterL", prefs) の形で呼ばれるため、
 * 第2引数 prefs はオプションにして互換性を持たせる。
 */
export function unitLabel(
  key: string,
  prefs?: UnitPrefs // 将来ここで単位切替に使う
): string {
  switch (key) {
    case "waterL":
      // prefs?.water === "ml" の場合は "ml" にする等、将来拡張可
      return prefs?.water === "ml" ? "ml" : "L";
    case "saltG":
      return prefs?.salt === "mg" ? "mg" : "g";
    case "steps":
      return "歩";
    case "sleepH":
      return prefs?.sleep === "minutes" ? "分" : "時間";
    case "weight":
    case "weightKg":
      return prefs?.weight === "lb" ? "lb" : "kg";
    default:
      return "";
  }
}

/**
 * 各値を「基準単位」に正規化する。
 * いまは入力がすでに基準（L / g / 歩 / 時間）なのでそのまま返す。
 * 将来、ml→L などの変換をここで行う。
 */
export function toBaseUnits<
  T extends {
    waterL?: number;
    saltG?: number;
    steps?: number;
    sleepH?: number;
    weightKg?: number;
  }
>(inputs: T, _prefs: UnitPrefs): T {
  return inputs;
}
