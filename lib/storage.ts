import { Metrics } from "@/components/OfflineCoach";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "todayMetrics";

export async function saveToday(m: Metrics) {
  const data = { date: new Date().toISOString().slice(0,10), ...m };
  await AsyncStorage.setItem(KEY, JSON.stringify(data));
}

export async function loadToday(): Promise<Metrics> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return {};
  const obj = JSON.parse(raw);
  // 日付が変わっていたらリセット
  const today = new Date().toISOString().slice(0,10);
  return obj.date === today ? obj : {};
}
