// app/(tabs)/index.tsx
import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Button,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

// 相対パスで読み込み（※重要）
import {
  Metrics,
  getAdvice,
  mealAdvice,
  score,
} from "../../components/OfflineCoach";
import { loadToday, saveToday } from "../../lib/storage";
import {
  UnitPrefs,
  defaultUnitPrefs,
  loadUnitPrefs,
  toBaseUnits,
  unitLabel,
} from "../../lib/unitPrefs";

type TodayInputs = {
  waterL?: number;
  saltG?: number;
  steps?: number;
  sleepH?: number;
};

export default function HomeScreen() {
  const [prefs, setPrefs] = useState<UnitPrefs>(defaultUnitPrefs);

  // 入力欄（文字列で管理）
  const [water, setWater] = useState<string>(""); // L
  const [salt, setSalt] = useState<string>(""); // g
  const [steps, setSteps] = useState<string>(""); // steps
  const [sleep, setSleep] = useState<string>(""); // h

  // 評価結果
  const [todayScore, setTodayScore] = useState<number>(50);
  const [adviceText, setAdviceText] = useState<string>(
    "水分1.5〜2L・塩分6g未満・合計30分の有酸素を目安に。"
  );

  useEffect(() => {
    // 単位設定・当日データ読み込み
    (async () => {
      const p = await loadUnitPrefs();
      setPrefs(p);

      const t = await loadToday();
      if (t) {
        if (typeof t.waterL === "number") setWater(String(t.waterL));
        if (typeof t.saltG === "number") setSalt(String(t.saltG));
        if (typeof t.steps === "number") setSteps(String(t.steps));
        if (typeof t.sleepH === "number") setSleep(String(t.sleepH));

        const m: Metrics = {
          waterL: t.waterL ?? 0,
          saltG: t.saltG ?? 0,
          steps: t.steps ?? 0,
          sleepH: t.sleepH ?? 0,
        };
        setTodayScore(score(m));
        setAdviceText(getAdvice(m));
      }
    })();
  }, []);

  const onEvaluate = async () => {
    // 文字→数値、NaNは0に
    const w = Number(water) || 0;
    const s = Number(salt) || 0;
    const st = Number(steps) || 0;
    const sl = Number(sleep) || 0;

    // 将来、他単位対応するときに toBaseUnits を使う想定
    const base = toBaseUnits(
      {
        waterL: w,
        saltG: s,
        steps: st,
        sleepH: sl,
      },
      prefs
    );

    const m: Metrics = {
      waterL: base.waterL ?? 0,
      saltG: base.saltG ?? 0,
      steps: base.steps ?? 0,
      sleepH: base.sleepH ?? 0,
    };

    // 保存
    const toSave: TodayInputs = {
      waterL: m.waterL,
      saltG: m.saltG,
      steps: m.steps,
      sleepH: m.sleepH,
    };
    await saveToday(toSave);

    // 評価
    setTodayScore(score(m));
    setAdviceText(getAdvice(m));
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>今日のAIコーチ（オフライン）</Text>

          {/* 入力欄（見切れ対策で縦積み＆各項目を改行） */}
          <View style={styles.form}>
            <Text style={styles.label}>
              水分（{unitLabel("waterL", prefs)}）
            </Text>
            <TextInput
              value={water}
              onChangeText={setWater}
              keyboardType="numeric"
              placeholder="例) 1.8"
              style={styles.input}
            />

            <Text style={styles.label}>
              塩分（{unitLabel("saltG", prefs)}）
            </Text>
            <TextInput
              value={salt}
              onChangeText={setSalt}
              keyboardType="numeric"
              placeholder="例) 6"
              style={styles.input}
            />

            <Text style={styles.label}>歩数</Text>
            <TextInput
              value={steps}
              onChangeText={setSteps}
              keyboardType="numeric"
              placeholder="例) 8000"
              style={styles.input}
            />

            <Text style={styles.label}>睡眠（h）</Text>
            <TextInput
              value={sleep}
              onChangeText={setSleep}
              keyboardType="numeric"
              placeholder="例) 6.5"
              style={styles.input}
            />
          </View>

          <View style={styles.actions}>
            <Button title="評価＆アドバイス更新" onPress={onEvaluate} />
          </View>

          <View style={styles.card}>
            <Text style={styles.score}>今日のスコア：{todayScore} 点</Text>
            <Text style={styles.advice}>{adviceText}</Text>
          </View>

          {/* 追加機能：バーコードスキャン画面へ（後でAI連動予定） */}
          <View style={styles.actions}>
            <Link href="/BarcodeScanModal" asChild>
              <Button title="バーコードをスキャン" />
            </Link>
          </View>

          {/* おまけ：食事の簡易アドバイス見本 */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>食事のヒント（例）</Text>
            <Text style={styles.advice}>{mealAdvice("protein")}</Text>
            <Text style={styles.advice}>{mealAdvice("fiber")}</Text>
            <Text style={styles.advice}>{mealAdvice("salt")}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  form: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  actions: {
    marginTop: 8,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#fafafa",
    gap: 6,
  },
  cardTitle: {
    fontWeight: "700",
    marginBottom: 6,
  },
  score: {
    fontSize: 18,
    fontWeight: "700",
  },
  advice: {
    fontSize: 16,
    lineHeight: 22,
  },
});
