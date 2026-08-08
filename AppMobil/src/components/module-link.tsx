import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, type Href } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { AppCard } from "@/components/app-card";
import { colors, radius, spacing, typography } from "@/theme";

type Props = {
  href: Href;
  title: string;
  description: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  accent?: string;
};

export function ModuleLink({ href, title, description, label, icon, accent = colors.verdeOscuro }: Props) {
  return (
    <Link href={href} asChild>
      <Pressable>
        {({ pressed }) => (
          <AppCard style={{ opacity: pressed ? 0.9 : 1 }}>
            <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.md }}>
              <View
                style={{
                  alignItems: "center",
                  backgroundColor: colors.superficieMenta,
                  borderColor: "#c6ddcf",
                  borderRadius: radius.lg,
                  borderWidth: 1,
                  height: 50,
                  justifyContent: "center",
                  width: 50,
                }}
              >
                <MaterialCommunityIcons name={icon} size={27} color={accent} />
              </View>
              <View style={{ flex: 1, gap: spacing.xs }}>
                <Text selectable style={{ color: colors.texto, fontSize: typography.title, fontWeight: "900" }}>
                  {title}
                </Text>
                <Text selectable style={{ color: colors.textoSuave, fontWeight: "600", lineHeight: 20 }}>
                  {description}
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textoSuave} />
            </View>
            <Text selectable style={{ color: accent, fontWeight: "900" }}>
              {label}
            </Text>
          </AppCard>
        )}
      </Pressable>
    </Link>
  );
}
