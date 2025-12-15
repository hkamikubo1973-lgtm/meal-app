import { Metrics } from "@/components/OfflineCoach";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "todayMetrics";
const today = () => new Date().toISOString().slice(0,10);

export async function saveToday(m: Metrics) {
  const data = { date: today(), ...m };
  await AsyncStorage.setItem(KEY, JSON.stringify(data));
}

export async function loadToday(): Promise<Metrics> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return {};
  const obj = JSON.parse(raw);
  return obj.date === today() ? obj : {};
}
