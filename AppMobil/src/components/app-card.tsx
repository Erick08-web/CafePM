import { PropsWithChildren } from "react";
import { View, type ViewStyle } from "react-native";

import { colors, radius, shadows, spacing } from "@/theme";

type Tone = "default" | "mint" | "honey" | "coral" | "dark";

type Props = PropsWithChildren<{
  tone?: Tone;
  compact?: boolean;
  style?: ViewStyle;
}>;

const backgrounds: Record<Tone, string> = {
  default: colors.superficie,
  mint: colors.superficieMenta,
  honey: colors.superficieMiel,
  coral: colors.superficieCoral,
  dark: colors.superficieOscura,
};

export function AppCard({ children, tone = "default", compact = false, style }: Props) {
  const dark = tone === "dark";

  return (
    <View
      style={[
        {
          backgroundColor: backgrounds[tone],
          borderColor: dark ? "rgba(255, 250, 242, 0.14)" : colors.bordeSuave,
          borderCurve: "continuous",
          borderRadius: radius.lg,
          borderWidth: 1,
          boxShadow: dark ? shadows.header : shadows.soft,
          gap: compact ? spacing.md : spacing.lg,
          padding: compact ? spacing.lg : spacing.xl,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
