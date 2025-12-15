import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#8e8e93",
        tabBarStyle: { paddingBottom: 4, height: 60 },
        tabBarLabelStyle: { fontSize: 12 },
      }}
    >
      {/* ホーム画面 */}
      <Tabs.Screen
        name="index"
        options={{
          title: "ホーム",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      {/* プロフィール画面 */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "プロフィール",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />

      {/* （他のタブを追加する場合はここに） */}
    </Tabs>
  );
}

