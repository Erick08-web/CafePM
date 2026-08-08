import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View, type ViewStyle } from "react-native";

import { colors, radius, spacing, typography } from "@/theme";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

type MetricCardProps = {
  label: string;
  value: string | number;
  icon: IconName;
  tone?: string;
  helper?: string;
  style?: ViewStyle;
};

export function MetricCard({ label, value, icon, tone = colors.verdeOscuro, helper, style }: MetricCardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.superficieElevada,
          borderColor: colors.bordeSuave,
          borderCurve: "continuous",
          borderRadius: radius.lg,
          borderWidth: 1,
          flexBasis: "47%",
          flexGrow: 1,
          gap: spacing.sm,
          minHeight: 118,
          padding: spacing.lg,
        },
        style,
      ]}
    >
      <MaterialCommunityIcons name={icon} size={24} color={tone} />
      <Text selectable style={{ color: colors.textoSuave, fontWeight: "800" }}>
        {label}
      </Text>
      <Text selectable style={{ color: colors.texto, fontSize: 23, fontWeight: "900", fontVariant: ["tabular-nums"] }}>
        {value}
      </Text>
      {helper ? (
        <Text selectable style={{ color: colors.textoSuave, fontSize: typography.caption, fontWeight: "700" }}>
          {helper}
        </Text>
      ) : null}
    </View>
  );
}

type ActionTileProps = {
  title: string;
  description?: string;
  icon: IconName;
  onPress: () => void;
  tone?: string;
};

export function ActionTile({ title, description, icon, onPress, tone = colors.verdeOscuro }: ActionTileProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: colors.superficieElevada,
        borderColor: colors.bordeSuave,
        borderCurve: "continuous",
        borderRadius: radius.lg,
        borderWidth: 1,
        flexBasis: "31%",
        flexGrow: 1,
        gap: spacing.sm,
        minHeight: 106,
        opacity: pressed ? 0.86 : 1,
        padding: spacing.md,
      })}
    >
      <MaterialCommunityIcons name={icon} size={24} color={tone} />
      <Text selectable style={{ color: colors.texto, fontWeight: "900" }}>
        {title}
      </Text>
      {description ? (
        <Text selectable style={{ color: colors.textoSuave, fontSize: typography.caption, fontWeight: "700", lineHeight: 17 }}>
          {description}
        </Text>
      ) : null}
    </Pressable>
  );
}

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  icon?: IconName;
};

export function SectionHeader({ title, subtitle, icon }: SectionHeaderProps) {
  return (
    <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.md, justifyContent: "space-between" }}>
      <View style={{ flex: 1, gap: spacing.xs }}>
        <Text selectable style={{ color: colors.texto, fontSize: typography.title, fontWeight: "900" }}>
          {title}
        </Text>
        {subtitle ? (
          <Text selectable style={{ color: colors.textoSuave, fontWeight: "600", lineHeight: 20 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {icon ? <MaterialCommunityIcons name={icon} size={30} color={colors.verdeOscuro} /> : null}
    </View>
  );
}
