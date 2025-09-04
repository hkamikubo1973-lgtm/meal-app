// components/HapticTab.tsx
import * as Haptics from "expo-haptics";
import * as React from "react";
import { Pressable, type PressableProps } from "react-native";

export function HapticTab(props: PressableProps) {
  return (
    <Pressable
      onPressIn={() =>
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      }
      {...props}
    />
  );
}
