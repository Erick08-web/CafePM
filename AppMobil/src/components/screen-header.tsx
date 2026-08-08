import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { colors, radius, shadows, spacing, typography } from "@/theme";

type Props = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
};

export function ScreenHeader({ title, subtitle, eyebrow = "Coffee Code", icon = "coffee-outline" }: Props) {
  return (
    <View
      style={{
        backgroundColor: colors.verdeOscuro,
        borderCurve: "continuous",
        borderRadius: radius["2xl"],
        boxShadow: shadows.header,
        gap: spacing.lg,
        overflow: "hidden",
        padding: spacing.xl,
      }}
    >
      <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.md, justifyContent: "space-between" }}>
        <View style={{ flex: 1, gap: spacing.xs }}>
          <Text selectable style={{ color: "#c8dccd", fontSize: typography.brand, fontWeight: "900", textTransform: "uppercase" }}>
            {eyebrow}
          </Text>
          <Text selectable style={{ color: colors.textoInvertido, fontSize: typography.screenTitle, fontWeight: "900", lineHeight: 36 }}>
            {title}
          </Text>
        </View>
        <View
          style={{
            alignItems: "center",
            backgroundColor: "rgba(255, 250, 242, 0.12)",
            borderColor: "rgba(255, 250, 242, 0.16)",
            borderRadius: radius.lg,
            borderWidth: 1,
            height: 52,
            justifyContent: "center",
            width: 52,
          }}
        >
          <MaterialCommunityIcons name={icon} size={28} color={colors.textoInvertido} />
        </View>
      </View>
      {subtitle ? (
        <Text selectable style={{ color: "#e9dfcf", fontSize: typography.bodyLarge, fontWeight: "600", lineHeight: 23 }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
