// components/OfflineCoach.ts
export type Metrics = {
  waterL?: number;   // 摂水量(L)
  saltG?: number;    // 塩分(g)
  steps?: number;    // 歩数
  sleepH?: number;   // 睡眠(h)
  mealText?: string; // 食事の自由記述
  bmi?: number;      // ← 追加：プロフィールから受け取る
};

function normalize(text: string) {
  return (text || "").toLowerCase();
}

export function mealAdvice(mealText?: string): { tags: string[]; comment: string } {
  const t = normalize(mealText ?? "");
  if (!t) return { tags: [], comment: "" };

  const tags: string[] = [];
  let risk = 0, good = 0;

  const highFat = ["唐揚げ", "揚げ", "フライ", "ラーメン", "カレー", "マヨ", "バター", "生クリーム"];
  const highSalt = ["ラーメン", "スープ", "漬物", "味噌汁", "カップ", "インスタント", "ハム", "ベーコン"];
  const goodProtein = ["鶏むね", "ささみ", "豆腐", "納豆", "卵", "サバ", "鮭", "ヨーグルト"];
  const veg = ["サラダ", "ブロッコリー", "ほうれん草", "キャベツ", "トマト", "きのこ", "野菜"];
  const whole = ["雑穀", "玄米", "オートミール", "全粒粉"];

  highFat.forEach(k => { if (t.includes(k.toLowerCase())) { risk++; tags.push("脂質↑"); }});
  highSalt.forEach(k => { if (t.includes(k.toLowerCase())) { risk++; tags.push("塩分↑"); }});
  goodProtein.forEach(k => { if (t.includes(k.toLowerCase())) { good++; tags.push("たんぱく質◎"); }});
  veg.forEach(k => { if (t.includes(k.toLowerCase())) { good++; tags.push("野菜◎"); }});
  whole.forEach(k => { if (t.includes(k.toLowerCase())) { good++; tags.push("主食◎"); }});

  let comment = "";
  if (good >= 2 && risk === 0) comment = "高たんぱく＋野菜バランス良好。主食は今の量を維持。";
  else if (risk >= 2 && good === 0) comment = "脂質・塩分が高め。揚げ物頻度を下げ、汁は残す・野菜を追加。";
  else if (risk >= 1 && good >= 1) comment = "良い要素もあるが脂質/塩分がやや高め。サラダや汁物減で調整。";
  else comment = "主食・主菜・副菜の3点セットを意識。たんぱく質と野菜を確保。";

  const uniq = Array.from(new Set(tags)).slice(0, 3);
  return { tags: uniq, comment };
}

// ▼ 追加：BMIに応じた助言（必要なら強めに一文差し込む）
export function bmiAdvice(bmi?: number): string | undefined {
  if (bmi == null || Number.isNaN(bmi)) return;
  if (bmi >= 25) return "【体脂肪対策】主食は握りこぶし1個/食を目安に、たんぱく質と野菜を先に。夜は糖質控えめ。";
  if (bmi < 18.5) return "【筋量アップ】体重×1.2g/日のたんぱく質を確保。間食にヨーグルトやナッツを。";
  return "【体重維持】PFCバランスを崩さず、週2〜3回の有酸素＋筋トレを継続。";
}

export function getAdvice(m: Metrics): string {
  const tips: string[] = [];

  // 先頭：食事コメント
  const meal = mealAdvice(m.mealText);
  if (meal.comment) tips.push(`【食事】${meal.comment}`);

  // BMIコメント（あれば先頭近くに差し込み）
  const bmiMsg = bmiAdvice(m.bmi);
  if (bmiMsg) tips.push(bmiMsg);

  if (m.waterL != null) {
    if (m.waterL < 1.2) tips.push("水分は合計1.5〜2Lを目安に。");
    else if (m.waterL > 3) tips.push("水分が多め。運動時以外は2L前後に。");
    else tips.push("水分は良い感じ👍");
  }

  if (m.saltG != null) {
    if (m.saltG > 7) tips.push("塩分は6g未満を意識。スープは基本残す。");
    else tips.push("塩分OK。酢や香辛料で旨味を補うと続く。");
  }

  if (m.steps != null) {
    if (m.steps < 5000) tips.push("歩数が少なめ。合計30分の早歩きをどこかで確保。");
    else tips.push("歩数は合格。就寝前ストレッチで仕上げを。");
  }

  if (m.sleepH != null) {
    if (m.sleepH < 6) tips.push("睡眠が短め。就寝90分前入浴・就前の画面オフを。");
    else tips.push("睡眠良好。就前カフェインは控えめに。");
  }

  if (tips.length === 0) tips.push("水分1.5〜2L・塩分6g未満・有酸素30分を目安に。");
  return tips.slice(0, 4).join(" ");
}

export function score(m: Metrics): number {
  let s = 50;
  if (m.waterL != null) s += (m.waterL >= 1.2 && m.waterL <= 2.5) ? 10 : -5;
  if (m.saltG  != null) s += (m.saltG  <= 6.0) ? 10 : -5;
  if (m.steps  != null) s += (m.steps  >= 7000) ? 10 : (m.steps >= 5000 ? 5 : -5);
  if (m.sleepH != null) s += (m.sleepH >= 6.5 && m.sleepH <= 8) ? 10 : -5;

  if (m.mealText) {
    const { tags } = mealAdvice(m.mealText);
    if (tags.includes("たんぱく質◎")) s += 5;
    if (tags.includes("野菜◎")) s += 5;
    if (tags.includes("脂質↑") || tags.includes("塩分↑")) s -= 5;
  }

  // BMIで軽微に補正（過剰に上下しないよう±5点）
  if (m.bmi != null) {
    if (m.bmi >= 25) s -= 5;
    else if (m.bmi >= 18.5 && m.bmi < 25) s += 3;
    else s -= 2;
  }

  return Math.max(0, Math.min(100, s));
}
