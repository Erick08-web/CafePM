import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Card } from "@/components/card";
import { colors } from "@/theme/colors";

type Props = {
  href: "/mesero" | "/cocina" | "/caja";
  title: string;
  description: string;
  label: string;
};

export function ModuleLink({ href, title, description, label }: Props) {
  return (
    <Link href={href} asChild>
      <Pressable>
        <Card>
          <View style={{ gap: 6 }}>
            <Text selectable style={{ color: colors.texto, fontSize: 20, fontWeight: "800" }}>{title}</Text>
            <Text selectable style={{ color: colors.textoSuave, lineHeight: 20 }}>{description}</Text>
          </View>
          <Text style={{ color: colors.cafe, fontWeight: "800" }}>{label}</Text>
        </Card>
      </Pressable>
    </Link>
  );
}
