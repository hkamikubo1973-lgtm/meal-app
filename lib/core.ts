// lib/core.ts
import * as SQLite from "expo-sqlite/next";
import type { ActivityId } from "./activities"; // 種目IDだけ使う

// ================================
// DB 接続
// ================================
let _db: SQLite.SQLiteDatabase | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync("meal.db");
  return _db;
}

// ===============================================
// テーブル作成（初期化）
// ===============================================
export async function initDb(): Promise<void> {
  const db = await getDb();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    -- 食事
    CREATE TABLE IF NOT EXISTS meals (
      id    INTEGER PRIMARY KEY AUTOINCREMENT,
      date  TEXT   NOT NULL,
      time  TEXT   NOT NULL,
      band  TEXT   NOT NULL,
      name  TEXT,
      kcal  REAL,
      p     REAL,
      f     REAL,
      c     REAL,
      fiber REAL,
      sodium REAL
    );

    -- 設定
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    -- トレーニング
    CREATE TABLE IF NOT EXISTS workouts (
      id    INTEGER PRIMARY KEY AUTOINCREMENT,
      date  TEXT NOT NULL,
      type  TEXT NOT NULL,
      unit  TEXT NOT NULL,
      qty   REAL NOT NULL,
      kcal  REAL NOT NULL
    );
  `);
}

// （開発用）既存テーブル一覧をログに出す
export async function debugListTables(): Promise<void> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ name: string }>(
    `SELECT name FROM sqlite_master WHERE type='table'`
  );
  console.log("DB tables:", rows.map((r) => r.name));
}

// ======================================================
// ユーティリティ（日付/時刻/バンド）
// ======================================================
export function todayStr(d = new Date()): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function nowHHMM(d = new Date()): string {
  const h = `${d.getHours()}`.padStart(2, "0");
  const m = `${d.getMinutes()}`.padStart(2, "0");
  return `${h}:${m}`;
}

// 入力時刻から「朝/昼/夕/間食」のバンドを割り当て
export function assignBand(timeHHMM: string): string {
  const [h] = timeHHMM.split(":").map((v) => Number(v) || 0);
  if (h < 10) return "朝";
  if (h < 15) return "昼";
  if (h < 20) return "夕";
  return "間食";
}

// ======================================================
// 設定（体重の保存）
// ======================================================
async function getSetting(key: string): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM settings WHERE key=?`,
    [key]
  );
  return row?.value ?? null;
}

async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO settings(key, value) VALUES(?, ?)
     ON CONFLICT(key) DO UPDATE SET value=excluded.value`,
    [key, value]
  );
}

export async function getWeightKg(): Promise<number> {
  const v = await getSetting("weightKg");
  const n = Number(v);
  return Number.isFinite(n) ? n : 70; // 既定 70kg
}

export async function setWeightKg(w: number): Promise<void> {
  await setSetting("weightKg", String(Math.round(w)));
}

// ======================================================
// 型定義
// ======================================================
export type Meal = {
  id?: number;
  date: string;
  time: string;
  band: string;
  name: string;
  kcal: number;
  p: number;
  f: number;
  c: number;
  fiber: number;
  sodium: number;
};

export type DayTotals = {
  kcal: number;
  p: number;
  f: number;
  c: number;
  fiber: number;
  sodium: number;
};

export type Workout = {
  id?: number;
  date: string;
  type: ActivityId; // 例: "pushup" など
  unit: string;     // "rep" | "min" | "km" など
  qty: number;
  kcal: number;
};

// ======================================================
// 食事：登録/取得/集計/スコア
// ======================================================
export async function insertMeal(row: Meal): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO meals(date,time,band,name,kcal,p,f,c,fiber,sodium)
     VALUES(?,?,?,?,?,?,?,?,?,?)`,
    [
      row.date,
      row.time,
      row.band,
      row.name,
      row.kcal ?? 0,
      row.p ?? 0,
      row.f ?? 0,
      row.c ?? 0,
      row.fiber ?? 0,
      row.sodium ?? 0,
    ]
  );
}

export async function fetchMeals(date: string): Promise<Meal[]> {
  const db = await getDb();
  return await db.getAllAsync<Meal>(
    `SELECT * FROM meals WHERE date=? ORDER BY id ASC`,
    [date]
  );
}

export function sumMeals(meals: Meal[]): DayTotals {
  return meals.reduce<DayTotals>(
    (a, v) => ({
      kcal: a.kcal + (v.kcal || 0),
      p: a.p + (v.p || 0),
      f: a.f + (v.f || 0),
      c: a.c + (v.c || 0),
      fiber: a.fiber + (v.fiber || 0),
      sodium: a.sodium + (v.sodium || 0),
    }),
    { kcal: 0, p: 0, f: 0, c: 0, fiber: 0, sodium: 0 }
  );
}

// 1日100点満点の簡易スコア（最低60点）
const TARGETS = { p: 130, f: 60, c: 310, fiber: 21, sodium: 7 };

function scoreAroundTarget(v: number, target: number): number {
  if (!Number.isFinite(v) || target <= 0) return 0;
  const diff = Math.abs(v - target);
  const ratio = Math.max(0, 1 - diff / target);
  return Math.round(ratio * 25); // P/F/C 各25点
}
function scoreFiber(v: number): number {
  if (!Number.isFinite(v)) return 0;
  const ratio = Math.min(1, v / TARGETS.fiber);
  return Math.round(ratio * 25);
}
function scoreSodium(v: number): number {
  if (!Number.isFinite(v)) return 0;
  if (v <= TARGETS.sodium) return 25;
  const ratio = Math.max(0, 1 - (v - TARGETS.sodium) / TARGETS.sodium);
  return Math.round(ratio * 25);
}

export function calcDailyScore(t: DayTotals): number {
  const pS = scoreAroundTarget(t.p, TARGETS.p);
  const fS = scoreAroundTarget(t.f, TARGETS.f);
  const cS = scoreAroundTarget(t.c, TARGETS.c);
  const fiS = scoreFiber(t.fiber);
  const naS = scoreSodium(t.sodium);
  return Math.max(60, Math.round(pS + fS + cS + fiS + naS));
}

// ======================================================
// ワークアウト：登録/取得
// ======================================================
export async function insertWorkout(w: Workout): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO workouts(date,type,unit,qty,kcal)
     VALUES(?,?,?,?,?)`,
    [w.date, w.type, w.unit, w.qty, w.kcal]
  );
}

export async function fetchWorkouts(date: string): Promise<Workout[]> {
  const db = await getDb();
  return await db.getAllAsync<Workout>(
    `SELECT * FROM workouts WHERE date=? ORDER BY id ASC`,
    [date]
  );
}
