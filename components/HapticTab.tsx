// components/HapticTab.tsx
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { Pressable, View } from "react-native";

export function HapticTab({ style, children, ...rest }: BottomTabBarButtonProps) {
  return (
    <View style={style}>
      <Pressable
        onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        {...rest}
      >
        {children}
      </Pressable>
    </View>
  );
}
