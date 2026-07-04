import { PropsWithChildren } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";

import { colors } from "@/theme/colors";

type Props = PropsWithChildren<{
  title: string;
  subtitle?: string;
  refreshing?: boolean;
  onRefresh?: () => void;
}>;

export function Screen({ title, subtitle, refreshing = false, onRefresh, children }: Props) {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined}
      style={{ flex: 1, backgroundColor: colors.fondo }}
      contentContainerStyle={{ padding: 18, gap: 16, paddingBottom: 32 }}
    >
      <View style={{ gap: 6 }}>
        <Text selectable style={{ color: colors.cafe, fontSize: 12, fontWeight: "800", textTransform: "uppercase" }}>
          Coffee Code
        </Text>
        <Text selectable style={{ color: colors.texto, fontSize: 30, fontWeight: "800" }}>
          {title}
        </Text>
        {subtitle ? (
          <Text selectable style={{ color: colors.textoSuave, fontSize: 15, lineHeight: 21 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {children}
    </ScrollView>
  );
}
