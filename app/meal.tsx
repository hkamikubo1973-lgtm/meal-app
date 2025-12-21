// app/meal.tsx
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    Alert,
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
import { addMealToday } from "../lib/meals";

function toNumberOrNull(s: string): number | null {
  const n = Number(String(s).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export default function MealInputScreen() {
  const [name, setName] = useState("昼食");
  const [kcal, setKcal] = useState("");
  const [p, setP] = useState("");
  const [f, setF] = useState("");
  const [c, setC] = useState("");
  const [salt, setSalt] = useState("");

  const canSave = useMemo(() => {
    return name.trim().length > 0 && (toNumberOrNull(kcal) ?? 0) >= 0;
  }, [name, kcal]);

  const onSave = async () => {
    if (!canSave) {
      Alert.alert("入力が足りません", "食事名とカロリーは必須にしました。");
      return;
    }

    await addMealToday({
      name: name.trim(),
      kcal: toNumberOrNull(kcal) ?? 0,
      p: toNumberOrNull(p) ?? 0,
      f: toNumberOrNull(f) ?? 0,
      c: toNumberOrNull(c) ?? 0,
      salt: toNumberOrNull(salt) ?? 0,
      createdAt: Date.now(),
    });

    Alert.alert("保存しました", "今日の食事に追加しました。", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>食事入力</Text>

          <View style={styles.form}>
            <Text style={styles.label}>食事名（例：朝食/昼食/夕食）</Text>
            <TextInput value={name} onChangeText={setName} style={styles.input} />

            <Text style={styles.label}>カロリー（kcal）*</Text>
            <TextInput
              value={kcal}
              onChangeText={setKcal}
              keyboardType="numeric"
              placeholder="例) 650"
              style={styles.input}
            />

            <Text style={styles.label}>たんぱく質 P（g）</Text>
            <TextInput value={p} onChangeText={setP} keyboardType="numeric" placeholder="例) 35" style={styles.input} />

            <Text style={styles.label}>脂質 F（g）</Text>
            <TextInput value={f} onChangeText={setF} keyboardType="numeric" placeholder="例) 18" style={styles.input} />

            <Text style={styles.label}>炭水化物 C（g）</Text>
            <TextInput value={c} onChangeText={setC} keyboardType="numeric" placeholder="例) 75" style={styles.input} />

            <Text style={styles.label}>塩分（g）</Text>
            <TextInput value={salt} onChangeText={setSalt} keyboardType="numeric" placeholder="例) 4.2" style={styles.input} />
          </View>

          <View style={styles.actions}>
            <Button title="保存" onPress={onSave} />
          </View>

          <View style={styles.actions}>
            <Button title="戻る" onPress={() => router.back()} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  title: { fontSize: 22, fontWeight: "700" },
  form: { gap: 8 },
  label: { fontSize: 16, fontWeight: "600", marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  actions: { marginTop: 8 },
});
