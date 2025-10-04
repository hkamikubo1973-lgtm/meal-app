// components/ui/IconSymbol.ios.tsx
import { MaterialIcons } from "@expo/vector-icons";
import { StyleProp, TextStyle } from "react-native";

type Props = {
  name: string;
  color?: string;
  size?: number;
  style?: StyleProp<TextStyle>;
};

const nameMap: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  "house.fill": "home",
  house: "home",
  "paperplane.fill": "send",
  paperplane: "send",
  search: "search",
};

export default function IconSymbol({ name, color, size = 24, style }: Props) {
  const mapped =
    (nameMap[name] ?? (name as keyof typeof MaterialIcons.glyphMap)) || "help";
  return (
    <MaterialIcons name={mapped} size={size} color={color} style={style as any} />
  );
}
