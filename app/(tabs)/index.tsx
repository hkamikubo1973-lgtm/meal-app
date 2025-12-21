// app/(tabs)/index.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

// ★ meals（今日の食事一覧ロード/クリア）
import { clearMealsToday, loadMealsToday, type Meal } from "../../lib/meals";

// ★ 単位設定（いまは固定値返しでもOK）
import {
  defaultUnitPrefs,
  loadUnitPrefs,
  unitLabel,
  type UnitPrefs,
} from "../../lib/unitPrefs";

// ★ コア（体重・日付・スコア計算など）
import {
  calcDailyScore,
  getWeightKg,
  setWeightKg,
  sumMeals,
  todayStr,
} from "../../lib/core";

export default function HomeScreen() {
  // -----------------------------
  // 設定系
  // -----------------------------
  const [prefs, setPrefs] = useState<UnitPrefs>(defaultUnitPrefs);
  const [weightKg, setWeightKgState] = useState<string>("");

  // -----------------------------
  // 入力（健康系） ※今はDB保存せずUIだけ
  // -----------------------------
  const [water, setWater] = useState<string>(""); // L
  const [salt, setSalt] = useState<string>(""); // g
  const [steps, setSteps] = useState<string>(""); // steps
  const [sleep, setSleep] = useState<string>(""); // hours

  // -----------------------------
  // 食事
  // -----------------------------
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loadingMeals, setLoadingMeals] = useState<boolean>(false);

  const date = useMemo(() => todayStr(new Date()), []);

  const totals = useMemo(() => {
    return sumMeals(meals);
  }, [meals]);

  const dailyScore = useMemo(() => {
    return calcDailyScore(totals);
  }, [totals]);

  // -----------------------------
  // 初期ロード
  // -----------------------------
  useEffect(() => {
    (async () => {
      try {
        // 単位設定
        const p = await loadUnitPrefs();
        setPrefs(p);

        // 体重（DB）
        const w = await getWeightKg();
        setWeightKgState(String(w));

        // 今日の食事
        await reloadMeals();
      } catch (e: any) {
        console.log(e);
        Alert.alert("初期化エラー", String(e?.message ?? e));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function reloadMeals() {
    setLoadingMeals(true);
    try {
      const list = await loadMealsToday();
      setMeals(list);
    } finally {
      setLoadingMeals(false);
    }
  }

  async function onSaveWeight() {
    const n = Number(weightKg);
    if (!Number.isFinite(n) || n <= 0) {
      Alert.alert("入力エラー", "体重(kg)を正しく入力してください");
      return;
    }
    await setWeightKg(n);
    Alert.alert("保存しました", `体重：${Math.round(n)} kg`);
  }

  async function onClearMeals() {
    Alert.alert("確認", "今日の食事データを削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除する",
        style: "destructive",
        onPress: async () => {
          await clearMealsToday();
          await reloadMeals();
        },
      },
    ]);
  }

  // -----------------------------
  // 表示補助
  // -----------------------------
  const fmt = (v: number) => (Number.isFinite(v) ? String(Math.round(v)) : "0");

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.h1}>MEAL-APP</Text>
        <Text style={styles.sub}>今日：{date}</Text>

        {/* ----------------- 体重 ----------------- */}
        <View style={styles.card}>
          <Text style={styles.h2}>体重</Text>
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              value={weightKg}
              onChangeText={setWeightKgState}
              placeholder={`例: 67`}
              keyboardType="numeric"
            />
            <Text style={styles.unit}>{unitLabel("weightKg", prefs)}</Text>
          </View>
          <Button title="体重を保存" onPress={onSaveWeight} />
        </View>

        {/* ----------------- 健康入力（UIのみ） ----------------- */}
        <View style={styles.card}>
          <Text style={styles.h2}>今日の入力（とりあえずUI）</Text>

          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>水分</Text>
              <View style={styles.row}>
                <TextInput
                  style={styles.input}
                  value={water}
                  onChangeText={setWater}
                  placeholder="例: 2.0"
                  keyboardType="numeric"
                />
                <Text style={styles.unit}>{unitLabel("waterL", prefs)}</Text>
              </View>
            </View>

            <View style={styles.gridItem}>
              <Text style={styles.label}>塩分</Text>
              <View style={styles.row}>
                <TextInput
                  style={styles.input}
                  value={salt}
                  onChangeText={setSalt}
                  placeholder="例: 6"
                  keyboardType="numeric"
                />
                <Text style={styles.unit}>{unitLabel("saltG", prefs)}</Text>
              </View>
            </View>

            <View style={styles.gridItem}>
              <Text style={styles.label}>歩数</Text>
              <View style={styles.row}>
                <TextInput
                  style={styles.input}
                  value={steps}
                  onChangeText={setSteps}
                  placeholder="例: 8000"
                  keyboardType="numeric"
                />
                <Text style={styles.unit}>{unitLabel("steps", prefs)}</Text>
              </View>
            </View>

            <View style={styles.gridItem}>
              <Text style={styles.label}>睡眠</Text>
              <View style={styles.row}>
                <TextInput
                  style={styles.input}
                  value={sleep}
                  onChangeText={setSleep}
                  placeholder="例: 6.5"
                  keyboardType="numeric"
                />
                <Text style={styles.unit}>{unitLabel("sleepH", prefs)}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.note}>
            ※ ここは後で settings テーブルに保存するようにしてOK
          </Text>
        </View>

        {/* ----------------- 食事集計 ----------------- */}
        <View style={styles.card}>
          <Text style={styles.h2}>今日の食事（DB）</Text>

          <View style={styles.rowBetween}>
            <Text style={styles.sub}>
              件数：{meals.length} {loadingMeals ? "（読込中）" : ""}
            </Text>
            <View style={styles.rowGap}>
              <Button title="再読込" onPress={reloadMeals} />
              <Button title="今日をクリア" onPress={onClearMeals} />
            </View>
          </View>

          <View style={styles.totalsBox}>
            <Text style={styles.totals}>
              kcal: {fmt(totals.kcal)} / P: {fmt(totals.p)} / F: {fmt(totals.f)}{" "}
              / C: {fmt(totals.c)}
            </Text>
            <Text style={styles.totals}>
              食物繊維: {fmt(totals.fiber)} / 塩分: {fmt(totals.sodium)}
            </Text>
            <Text style={styles.score}>スコア：{dailyScore} 点</Text>
          </View>

          {meals.length === 0 ? (
            <Text style={styles.note}>まだ食事データがありません</Text>
          ) : (
            <View style={styles.list}>
              {meals.map((m) => (
                <View key={String(m.id ?? `${m.date}-${m.time}-${m.name}`)} style={styles.listItem}>
                  <Text style={styles.listTitle}>
                    {m.time} / {m.band} / {m.name ?? "（名称なし）"}
                  </Text>
                  <Text style={styles.listSub}>
                    kcal:{fmt(m.kcal ?? 0)} P:{fmt(m.p ?? 0)} F:{fmt(m.f ?? 0)} C:{fmt(m.c ?? 0)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <Text style={styles.footer}>
          次：ここに「食事追加」ボタン（insertMeal）と、バーコード登録UIを接続していきます
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  h1: {
    fontSize: 24,
    fontWeight: "700",
  },
  h2: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  sub: {
    fontSize: 12,
    opacity: 0.7,
  },
  card: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  rowGap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
  },
  unit: {
    width: 42,
    textAlign: "right",
    opacity: 0.8,
  },
  label: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  gridItem: {
    width: "48%",
    gap: 6,
  },
  note: {
    fontSize: 12,
    opacity: 0.7,
  },
  totalsBox: {
    gap: 6,
    paddingTop: 4,
  },
  totals: {
    fontSize: 13,
  },
  score: {
    fontSize: 16,
    fontWeight: "700",
    paddingTop: 6,
  },
  list: {
    gap: 8,
    paddingTop: 6,
  },
  listItem: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  listSub: {
    fontSize: 12,
    opacity: 0.8,
  },
  footer: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 8,
  },
});
