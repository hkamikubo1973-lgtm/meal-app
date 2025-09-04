import { getWeightKg, initDb, setWeightKg } from "@/lib/core";
import { useEffect, useState } from "react";
import { Button, Text, TextInput, View } from "react-native";

export default function HomeScreen() {
  const [weight, setWeight] = useState<number | null>(null);
  const [input, setInput] = useState("");

  // アプリ起動時にDB初期化＋現在体重を取得
  useEffect(() => {
    const setup = async () => {
      await initDb(); // DB初期化
      const w = await getWeightKg();
      setWeight(w);
    };
    setup();
  }, []);

  // 保存処理
  const handleSave = async () => {
    const w = Number(input);
    if (!isNaN(w) && w > 0) {
      await setWeightKg(w);
      setWeight(w);
      setInput(""); // 入力欄クリア
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>
        現在の体重: {weight !== null ? `${weight} kg` : "未入力"}
      </Text>

      <TextInput
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 5,
          padding: 8,
          width: 120,
          textAlign: "center",
          marginBottom: 10,
        }}
        keyboardType="numeric"
        value={input}
        placeholder="体重を入力"
        onChangeText={setInput}
      />

      <Button title="保存" onPress={handleSave} />
    </View>
  );
}
