import { PropsWithChildren } from "react";
import { View } from "react-native";

import { colors } from "@/theme/colors";

export function Card({ children }: PropsWithChildren) {
  return (
    <View
      style={{
        backgroundColor: colors.superficie,
        borderColor: colors.borde,
        borderCurve: "continuous",
        borderRadius: 8,
        borderWidth: 1,
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
        padding: 16,
        gap: 10,
      }}
    >
      {children}
    </View>
  );
}
