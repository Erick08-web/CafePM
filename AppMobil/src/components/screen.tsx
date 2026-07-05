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
      refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.coral} /> : undefined}
      style={{ flex: 1, backgroundColor: colors.fondo }}
      contentContainerStyle={{ padding: 18, gap: 16, paddingBottom: 34 }}
    >
      <View
        style={{
          backgroundColor: colors.superficieMiel,
          borderColor: colors.borde,
          borderCurve: "continuous",
          borderRadius: 24,
          borderWidth: 1,
          boxShadow: "0 14px 34px rgba(246, 177, 61, 0.18)",
          gap: 8,
          padding: 20,
        }}
      >
        <Text selectable style={{ color: colors.coral, fontSize: 12, fontWeight: "900", textTransform: "uppercase" }}>
          Coffee Code
        </Text>
        <Text selectable style={{ color: colors.texto, fontSize: 34, fontWeight: "900", lineHeight: 38 }}>
          {title}
        </Text>
        {subtitle ? (
          <Text selectable style={{ color: colors.textoSuave, fontSize: 16, lineHeight: 23, fontWeight: "600" }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {children}
    </ScrollView>
  );
}
