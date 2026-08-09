import { PropsWithChildren, ReactNode } from "react";
import { RefreshControl, ScrollView, View } from "react-native";

import { ScreenHeader } from "@/components/screen-header";
import { colors, spacing } from "@/theme";

type Props = PropsWithChildren<{
  title: string;
  subtitle?: string;
  eyebrow?: string;
  refreshing?: boolean;
  onRefresh?: () => void;
  footer?: ReactNode;
}>;

export function Screen({ title, subtitle, eyebrow, refreshing = false, onRefresh, footer, children }: Props) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.fondo }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.verdeOscuro} /> : undefined}
        style={{ flex: 1, backgroundColor: colors.fondo }}
        contentContainerStyle={{ gap: spacing.lg, padding: spacing.lg, paddingBottom: footer ? 118 : 36 }}
      >
        <ScreenHeader eyebrow={eyebrow} title={title} subtitle={subtitle} />
        {children}
      </ScrollView>
      {footer ? (
        <View
          pointerEvents="box-none"
          style={{
            bottom: 0,
            left: 0,
            padding: spacing.lg,
            position: "absolute",
            right: 0,
          }}
        >
          {footer}
        </View>
      ) : null}
    </View>
  );
}
