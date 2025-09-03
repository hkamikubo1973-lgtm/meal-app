// app/(tabs)/explore.tsx
import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  assignBand,
  getWeightKg,
  initDb,
  insertMeal,
  nowHHMM,
  setWeightKg,
  todayStr,
} from "../../lib/core";
import { searchFoods, type FoodItem } from "../../lib/foodSearch";
import { fetchByBarcode } from "../../lib/openfoodfacts";
// 既存の import 群の下に追加

type Per100 = {
  kcal: number;
  p: number;
  f: number;
  c: number;
  fiber: number;
  sodium: number; // 食塩相当量(g)
} | null;

export default function AddScreen() {
  // 初期化
  useEffect(() => {
    initDb();
  }, []);

  const [date] = useState(todayStr());
  const [time, setTime] = useState(nowHHMM());

  // 入力項目
  const [name, setName] = useState("");
  const [kcal, setKcal] = useState("");
  const [p, setP] = useState("");
  const [f, setF] = useState("");
  const [c, setC] = useState("");
  const [fiber, setFiber] = useState("");
  const [sodium, setSodium] = useState("");

  // 100g 基準値（バーコード取得時に保持→NETで換算）
  const [per100, setPer100] = useState<Per100>(null);
  const [net, setNet] = useState<string>("100"); // g

  // 体重
  const [weight, setWeight] = useState<number>(70);
  useEffect(() => {
    getWeightKg().then((w) => setWeight(w));
  }, []);

  // 候補（ローカル辞書）
  const suggestions = useMemo<FoodItem[]>(
    () => (name.length ? searchFoods(name) : []),
    [name]
  );
  const applyFood = (it: FoodItem) => {
    setName(it.name);
    setKcal(String(it.kcal ?? 0));
    setP(String(it.p ?? 0));
    setF(String(it.f ?? 0));
    setC(String(it.c ?? 0));
    setFiber(String(it.fiber ?? 0));
    setSodium(String(it.sodium ?? 0));
    // ローカル辞書は 1食量不定のため per100 はクリア
    setPer100(null);
  };

  // --- NET(g) 変更 → per100 があるときだけ換算して反映 ---
  useEffect(() => {
    if (!per100) return;
    const g = +net || 0;
    const ratio = g > 0 ? g / 100 : 0;
    setKcal(r(per100.kcal * ratio));
    setP(r(per100.p * ratio));
    setF(r(per100.f * ratio));
    setC(r(per100.c * ratio));
    setFiber(r(per100.fiber * ratio));
    setSodium(r(per100.sodium * ratio));
  }, [net, per100]);

  // ========== バーコードスキャン ==========
  const [scanOpen, setScanOpen] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  // （任意）初回に自動で権限を聞く
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain)
      requestPermission();
  }, [permission]);

  const onScan = async (code: string) => {
    try {
      const v = await fetchByBarcode(code);
      setName(v.name || "");
      // 100g 基準値を保持
      setPer100({
        kcal: v.kcal ?? 0,
        p: v.p ?? 0,
        f: v.f ?? 0,
        c: v.c ?? 0,
        fiber: v.fiber ?? 0,
        sodium: v.sodium ?? 0,
      });
      // NET 初期値（1食量が取れればそれ、なければ100）
      setNet(String(v.serving ?? 100));
    } catch {
      Alert.alert(
        "見つかりませんでした",
        "手入力するか、別のバーコードを試してください。"
      );
    } finally {
      setScanOpen(false);
    }
  };

  // 保存
  const save = async () => {
    if (!/^\d{2}:\d{2}$/.test(time)) {
      Alert.alert("時刻", "HH:MM 形式で入力してください（例：08:00）");
      return;
    }
    try {
      await insertMeal({
        date,
        time,
        band: assignBand(time),
        name: name.trim(),
        kcal: +kcal || 0,
        p: +p || 0,
        f: +f || 0,
        c: +c || 0,
        fiber: +fiber || 0,
        sodium: +sodium || 0,
      });
      setName("");
      setTime(nowHHMM());
      setKcal("");
      setP("");
      setF("");
      setC("");
      setFiber("");
      setSodium("");
      setPer100(null);
      setNet("100");
      Alert.alert("保存", "追加しました。Homeタブに反映されます。");
    } catch (e: any) {
      Alert.alert("保存エラー", String(e));
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#fff" }}
      contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* 日付・時刻 */}
      <View style={styles.row}>
        <Text style={styles.label}>日付（固定）</Text>
        <Text style={styles.ro}>{date}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>時刻（HH:MM）</Text>
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={time}
            onChangeText={setTime}
            placeholder="08:00"
            keyboardType="numbers-and-punctuation"
          />
          <TouchableOpacity
            style={styles.smallBtn}
            onPress={() => setTime(nowHHMM())}
          >
            <Text style={styles.smallBtnText}>いま</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 名称 + 候補 */}
      <View style={styles.row}>
        <Text style={styles.label}>名称（候補タップで自動入力）</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="例：バナナ、豆乳、食パン…"
        />
        {name.trim().length > 0 && suggestions.length > 0 && (
    <View style={styles.suggestBox}>
      {suggestions.slice(0, 20).map((item) => (
        <TouchableOpacity
          key={item.name}
          style={styles.suggestItem}
          onPress={() => applyFood(item)}
        >
          <Text style={{ fontWeight: "600" }}>{item.name}</Text>
          <Text style={{ color: "#666", fontSize: 12 }}>
            kcal {item.kcal ?? 0} / P{item.p ?? 0} F{item.f ?? 0} C{item.c ?? 0} /
            繊維{item.fiber ?? 0} / 塩分{item.sodium ?? 0}g
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )}
</View>

      {/* スキャンボタン */}
      <TouchableOpacity
        style={[styles.scanBtn, { marginBottom: 10 }]}
        onPress={() => setScanOpen(true)}
      >
        <Text style={styles.scanText}>バーコードをスキャン</Text>
      </TouchableOpacity>
      {permission?.granted === false && (
        <Text style={{ color: "#b91c1c" }}>
          カメラ許可が必要です（設定→アプリ→Expo Go→カメラ）
        </Text>
      )}

      {/* NET(g) */}
      <View style={[styles.row, { marginTop: 6 }]}>
        <Text style={styles.label}>NET（g）</Text>
        <TextInput
          style={styles.input}
          value={net}
          onChangeText={(s) => setNet(s.replace(/[^\d.]/g, ""))}
          keyboardType="numeric"
          placeholder="100"
        />
        <Text style={{ color: "#666", fontSize: 12, marginTop: 6 }}>
          バーコード栄養は 100g 基準。NET を変更すると自動換算されます。
        </Text>
      </View>

      {/* 栄養入力 */}
      <View style={styles.grid}>
        <Field label="kcal" val={kcal} set={setKcal} />
        <Field label="P (g)" val={p} set={setP} />
        <Field label="F (g)" val={f} set={setF} />
        <Field label="C (g)" val={c} set={setC} />
        <Field label="食物繊維 (g)" val={fiber} set={setFiber} />
        <Field label="塩分 (g)" val={sodium} set={setSodium} />
      </View>

      {/* 体重(kg) */}
      <Field
        label="体重 (kg)"
        val={String(weight)}
        set={(s) => setWeight(Number(s) || 0)}
        full
      />

      <TouchableOpacity
        style={styles.saveBtn}
        onPress={async () => {
          await setWeightKg(weight);
          Alert.alert("保存しました", `現在の体重: ${weight}kg`);
        }}
      >
        <Text style={styles.saveText}>体重を保存</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveBtn} onPress={save}>
        <Text style={styles.saveText}>保存する</Text>
      </TouchableOpacity>

      {/* Scanner */}
      <Modal
        visible={scanOpen}
        animationType="slide"
        onRequestClose={() => setScanOpen(false)}
      >
        {permission?.granted ? (
          <CameraView
            style={{ flex: 1 }}
            barcodeScannerSettings={{
              barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128", "qr"],
            }}
            onBarcodeScanned={(res: any) => {
              const code = res?.data ?? res?.barcodes?.[0]?.data;
              if (code) onScan(code);
            }}
          />
        ) : (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ marginBottom: 12 }}>カメラ権限が必要です</Text>
            <TouchableOpacity style={styles.saveBtn} onPress={requestPermission}>
              <Text style={styles.saveText}>許可する</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: "#eee", margin: 16 }]}
          onPress={() => setScanOpen(false)}
        >
          <Text style={[styles.saveText, { color: "#333" }]}>閉じる</Text>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

// 小数1桁に整える文字列
function r(v: number) {
  if (!Number.isFinite(v)) return "0";
  return (Math.round(v * 10) / 10).toString();
}

function Field({
  label,
  val,
  set,
  full,
}: {
  label: string;
  val: string;
  set: (s: string) => void;
  full?: boolean;
}) {
  return (
    <View style={{ width: full ? "100%" : "48%" }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={val}
        onChangeText={set}
        keyboardType="numeric"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginBottom: 10 },
  label: { marginBottom: 6, color: "#333", fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  ro: { paddingVertical: 10, fontSize: 16, color: "#444" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 6 },

  smallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#e5e7eb",
  },
  smallBtnText: { fontWeight: "600", color: "#333" },

  suggestBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 6,
  },
  suggestItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#eee" },

  scanBtn: {
    backgroundColor: "#10b981",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  scanText: { color: "#fff", fontWeight: "bold" },

  saveBtn: {
    marginTop: 14,
    backgroundColor: "#0ea5e9",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
