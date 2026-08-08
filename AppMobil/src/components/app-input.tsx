import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Text, TextInput, View, type TextInputProps } from "react-native";

import { colors, radius, spacing, typography } from "@/theme";

type Props = TextInputProps & {
  label: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  error?: string;
  rightSlot?: ReactNode;
};

export function AppInput({ label, icon, error, rightSlot, style, ...props }: Props) {
  return (
    <View style={{ gap: spacing.sm }}>
      <Text selectable style={{ color: colors.cafe, fontSize: typography.caption, fontWeight: "900", textTransform: "uppercase" }}>
        {label}
      </Text>
      <View
        style={{
          alignItems: "center",
          backgroundColor: colors.superficieElevada,
          borderColor: error ? colors.rojo : colors.borde,
          borderCurve: "continuous",
          borderRadius: radius.md,
          borderWidth: 1,
          flexDirection: "row",
          gap: spacing.sm,
          paddingHorizontal: spacing.md,
        }}
      >
        {icon ? <MaterialCommunityIcons name={icon} size={21} color={colors.textoSuave} /> : null}
        <TextInput
          placeholderTextColor="#9b897a"
          style={[{ color: colors.texto, flex: 1, fontSize: typography.bodyLarge, minHeight: 52 }, style]}
          {...props}
        />
        {rightSlot}
      </View>
      {error ? (
        <Text selectable style={{ color: colors.rojo, fontSize: typography.caption, fontWeight: "800" }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
