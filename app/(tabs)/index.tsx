import { getAdvice, Metrics, score } from "@/components/OfflineCoach";
import { loadToday, saveToday } from "@/lib/storage";
import { useEffect, useState } from "react";
import { Button, Text, TextInput, View } from "react-native";

export default function HomeScreen() {
  const [m, setM] = useState<Metrics>({});
  const [ad, setAd] = useState<string>("AIコーチ（オフライン）準備中…");
  const [sc, setSc] = useState<number>(0);

  useEffect(() => {
    loadToday().then((init) => {
      setM(init);
      setAd(getAdvice(init));
      setSc(score(init));
    });
  }, []);

  function update<K extends keyof Metrics>(k: K, v: string) {
    const num = v === "" ? undefined : Number(v);
    const next = { ...m, [k]: isNaN(Number(num)) ? undefined : num } as Metrics;
    setM(next);
  }

  async function onRecalc() {
    const s = score(m);
    const a = getAdvice(m);
    setSc(s);
    setAd(a);
    await saveToday(m);
  }

  const inputStyle = { borderWidth: 1, padding: 8, marginRight: 8, width: 90 };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>
        今日のAIコーチ（オフライン）
      </Text>

      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
        <Text>水分(L)</Text>
        <TextInput keyboardType="numeric" style={inputStyle}
          value={m.waterL?.toString() ?? ""} onChangeText={(v)=>update("waterL", v)} />
        <Text>塩分(g)</Text>
        <TextInput keyboardType="numeric" style={inputStyle}
          value={m.saltG?.toString() ?? ""} onChangeText={(v)=>update("saltG", v)} />
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
        <Text>歩数</Text>
        <TextInput keyboardType="numeric" style={inputStyle}
          value={m.steps?.toString() ?? ""} onChangeText={(v)=>update("steps", v)} />
        <Text>睡眠(h)</Text>
        <TextInput keyboardType="numeric" style={inputStyle}
          value={m.sleepH?.toString() ?? ""} onChangeText={(v)=>update("sleepH", v)} />
      </View>

      <Button title="評価＆アドバイス更新" onPress={onRecalc} />

      <Text style={{ marginTop: 16, fontSize: 18 }}>今日のスコア：{sc} 点</Text>
      <Text style={{ marginTop: 8, fontSize: 18, lineHeight: 26 }}>{ad}</Text>
    </View>
  );
}
