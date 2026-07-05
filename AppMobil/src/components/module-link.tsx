import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/theme/colors";

type Props = {
  href: "/mesero" | "/cocina" | "/caja";
  title: string;
  description: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  accent: string;
  background: string;
};

export function ModuleLink({ href, title, description, label, icon, accent, background }: Props) {
  return (
    <Link href={href} asChild>
      <Pressable>
        <View
          style={{
            backgroundColor: background,
            borderColor: colors.borde,
            borderCurve: "continuous",
            borderRadius: 22,
            borderWidth: 1,
            boxShadow: colors.sombra,
            gap: 14,
            padding: 18,
          }}
        >
          <View style={{ alignItems: "center", flexDirection: "row", gap: 12 }}>
            <View
              style={{
                alignItems: "center",
                backgroundColor: accent,
                borderRadius: 16,
                height: 48,
                justifyContent: "center",
                width: 48,
              }}
            >
              <MaterialCommunityIcons name={icon} size={27} color="#fffdf8" />
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <Text selectable style={{ color: colors.texto, fontSize: 21, fontWeight: "900" }}>{title}</Text>
              <Text selectable style={{ color: colors.textoSuave, lineHeight: 20, fontWeight: "600" }}>{description}</Text>
            </View>
          </View>
          <Text style={{ color: accent, fontWeight: "900" }}>{label}</Text>
        </View>
      </Pressable>
    </Link>
  );
}
