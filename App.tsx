import { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList } from 'react-native';
import * as SQLite from 'expo-sqlite';

// --------------------
// DB 初期化
// --------------------
const db = SQLite.openDatabaseSync('meal.db');

// --------------------
// 仮メニュー定義（後で差し替え）
// --------------------
type Menu = {
  id: string;
  name: string;
  protein: number;
  fat: number;
  carbs: number;
  kcal: number;
};

const MENUS: Menu[] = [
  { id: 'natto', name: '納豆', protein: 8, fat: 5, carbs: 6, kcal: 100 },
  { id: 'tofu', name: '木綿豆腐', protein: 10, fat: 6, carbs: 4, kcal: 120 },
  { id: 'egg', name: 'ゆで卵', protein: 6, fat: 5, carbs: 1, kcal: 80 },
  { id: 'chicken', name: 'サラダチキン', protein: 23, fat: 2, carbs: 1, kcal: 120 },
  { id: 'rice', name: '白米150g', protein: 4, fat: 1, carbs: 55, kcal: 250 },
];

// --------------------
// アプリ本体
// --------------------
export default function App() {
  const [total, setTotal] = useState({
    protein: 0,
    fat: 0,
    carbs: 0,
    kcal: 0,
  });

  u
