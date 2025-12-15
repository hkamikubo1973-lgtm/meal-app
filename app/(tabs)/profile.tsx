import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Alert, Button, ScrollView, Text, TextInput, View } from "react-native";

type Profile = {
  heightCm?: number;
  weightKg?: number;
  age?: number;
  sex?: "男" | "女" | "不問";
};

const KEY = "profile";

export default function ProfileScreen() {
  const [p, setP] = useState<Profile>({});

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => {
      if (raw) setP(JSON.parse(raw));
    });
  }, []);

  function setNum<K extends keyof Profile>(k: K, v: string) {
    const num = v === "" ? undefined : Number(v);
    setP({ ...p, [k]: isNaN(Number(num)) ? undefined : num } as Profile);
  }

  async function save() {
    await AsyncStorage.setItem(KEY, JSON.stringify(p));
    Alert.alert("保存しました");
  }

  const input = { borderWidth: 1 as const, padding: 8, borderRadius: 8, marginBottom: 10 };

  const bmi = (() => {
    if (!p.heightCm || !p.weightKg) return undefined;
    const h = p.heightCm / 100;
    return +(p.weightKg / (h * h)).toFixed(1);
  })();

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>プロフィール</Text>

      <Text>身長(cm)</Text>
      <TextInput keyboardType="numeric" style={input}
        value={p.heightCm?.toString() ?? ""} onChangeText={v => setNum("heightCm", v)} />

      <Text>体重(kg)</Text>
      <TextInput keyboardType="numeric" style={input}
        value={p.weightKg?.toString() ?? ""} onChangeText={v => setNum("weightKg", v)} />

      <Text>年齢</Text>
      <TextInput keyboardType="numeric" style={input}
        value={p.age?.toString() ?? ""} onChangeText={v => setNum("age", v)} />

      <Text>性別（男・女・不問）</Text>
      <TextInput autoCapitalize="none" style={input}
        value={p.sex ?? ""}
        placeholder="例：男"
        onChangeText={v => setP({ ...p, sex: v as any })}
      />

      {bmi && <Text style={{ marginTop: 8 }}>BMI：{bmi}</Text>}

      <View style={{ marginTop: 12 }}>
        <Button title="保存" onPress={save} />
      </View>
    </ScrollView>
  );
}
