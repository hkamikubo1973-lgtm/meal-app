// ✅ components/DummyCoach.ts
export type Goal = 'diet' | 'muscle' | 'balance';

const TEMPLATES: Record<Goal, string[]> = {
  diet: [
    '今日は摂取カロリーを-200kcalに。主食を20%減らしてたんぱく質を確保しよう。',
    '夜は油少なめ・汁は残す。就寝2時間前はカロリーを入れないのが◎。',
  ],
  muscle: [
    'P=体重×1.6gを目標に。トレ後30分以内にプロテイン補給！',
    '下半身を使った日こそ糖質も忘れず。主食＋フルーツで回復を早めよう。',
  ],
  balance: [
    'PFCバランス目安：P25% F25% C50%。野菜は両手1杯×2回を意識！',
    '水分1.5〜2Lを小まめに。塩分6g未満、加工肉は週2回までが理想。',
  ],
};

// ✅ ← これを忘れると「not a function」エラーになります！
export function getAdvice(goal: Goal): string {
  const list = TEMPLATES[goal] ?? TEMPLATES.balance;
  const random = Math.floor(Math.random() * list.length);
  return list[random];
}
