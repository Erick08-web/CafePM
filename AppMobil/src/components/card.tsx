import { PropsWithChildren } from "react";
import { View } from "react-native";

import { colors } from "@/theme/colors";

type Props = PropsWithChildren<{
  tone?: "default" | "mint" | "honey" | "coral";
}>;

const backgrounds = {
  default: colors.superficie,
  mint: colors.superficieMenta,
  honey: colors.superficieMiel,
  coral: colors.superficieCoral,
};

export function Card({ children, tone = "default" }: Props) {
  return (
    <View
      style={{
        backgroundColor: backgrounds[tone],
        borderColor: colors.borde,
        borderCurve: "continuous",
        borderRadius: 18,
        borderWidth: 1,
        boxShadow: colors.sombra,
        padding: 18,
        gap: 12,
      }}
    >
      {children}
    </View>
  );
}
