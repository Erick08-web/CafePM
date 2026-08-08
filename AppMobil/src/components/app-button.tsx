import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, type PressableProps, type ViewStyle } from "react-native";

import { colors, radius, spacing, typography } from "@/theme";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type Props = PressableProps & {
  title: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  variant?: Variant;
  fullWidth?: boolean;
  style?: ViewStyle;
};

const variants: Record<Variant, { background: string; color: string; border: string }> = {
  primary: { background: colors.verdeOscuro, color: colors.textoInvertido, border: colors.verdeOscuro },
  secondary: { background: colors.superficieMenta, color: colors.verdeOscuro, border: "#c6ddcf" },
  ghost: { background: "transparent", color: colors.cafe, border: colors.borde },
  danger: { background: colors.rojoFondo, color: colors.rojo, border: "#edc2ba" },
};

export function AppButton({ title, icon, variant = "primary", fullWidth = false, disabled, style, ...props }: Props) {
  const tone = variants[variant];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        {
          alignItems: "center",
          alignSelf: fullWidth ? "stretch" : "flex-start",
          backgroundColor: tone.background,
          borderColor: tone.border,
          borderCurve: "continuous",
          borderRadius: radius.md,
          borderWidth: 1,
          flexDirection: "row",
          gap: spacing.sm,
          justifyContent: "center",
          minHeight: 48,
          opacity: disabled ? 0.5 : pressed ? 0.88 : 1,
          paddingHorizontal: spacing.xl,
        },
        style,
      ]}
      {...props}
    >
      {icon ? <MaterialCommunityIcons name={icon} size={20} color={tone.color} /> : null}
      <Text selectable style={{ color: tone.color, fontSize: typography.body, fontWeight: "900" }}>
        {title}
      </Text>
    </Pressable>
  );
}
