// components/OfflineCoach.ts
export type Metrics = {
  waterL?: number;     // 摂水量(ℓ)
  saltG?: number;      // 塩分(g)
  steps?: number;      // 歩数
  sleepH?: number;     // 睡眠(h)
};

export function getAdvice(m: Metrics): string {
  const tips: string[] = [];

  if (m.waterL != null) {
    if (m.waterL < 1.2) tips.push("水分はこまめに合計1.5〜2Lを目安に。");
    else if (m.waterL > 3) tips.push("水分が多め。運動時以外は2L前後に。");
    else tips.push("水分は良い感じ👍");
  }

  if (m.saltG != null) {
    if (m.saltG > 7) tips.push("塩分は6g未満を意識。加工肉やスープの飲み干しに注意。");
    else tips.push("塩分OK。旨味は酢・香辛料で補強すると続きやすい。");
  }

  if (m.steps != null) {
    if (m.steps < 5000) tips.push("歩数が少なめ。合計30分の早歩きをどこかで確保。");
    else tips.push("歩数は合格。就寝前のストレッチで仕上げを。");
  }

  if (m.sleepH != null) {
    if (m.sleepH < 6) tips.push("睡眠が短め。就寝90分前の入浴・就前の画面オフを。");
    else tips.push("睡眠時間は良好。就前カフェインは控えめに。");
  }

  if (tips.length === 0) tips.push("水分1.5〜2L・塩分6g未満・合計30分の有酸素を目安に。");

  // 1〜2行で見やすく連結
  return tips.slice(0, 2).join(" ");
}

export function score(m: Metrics): number {
  let s = 50;
  if (m.waterL != null) s += (m.waterL >= 1.2 && m.waterL <= 2.5) ? 10 : -5;
  if (m.saltG  != null) s += (m.saltG  <= 6.0) ? 10 : -5;
  if (m.steps  != null) s += (m.steps  >= 7000) ? 10 : (m.steps >= 5000 ? 5 : -5);
  if (m.sleepH != null) s += (m.sleepH >= 6.5 && m.sleepH <= 8) ? 10 : -5;
  return Math.max(0, Math.min(100, s));
}
