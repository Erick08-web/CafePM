import { PropsWithChildren } from "react";
import { RefreshControl, ScrollView } from "react-native";

import { ScreenHeader } from "@/components/screen-header";
import { colors, spacing } from "@/theme";

type Props = PropsWithChildren<{
  title: string;
  subtitle?: string;
  eyebrow?: string;
  refreshing?: boolean;
  onRefresh?: () => void;
}>;

export function Screen({ title, subtitle, eyebrow, refreshing = false, onRefresh, children }: Props) {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.verdeOscuro} /> : undefined}
      style={{ flex: 1, backgroundColor: colors.fondo }}
      contentContainerStyle={{ gap: spacing.lg, padding: spacing.lg, paddingBottom: 36 }}
    >
      <ScreenHeader eyebrow={eyebrow} title={title} subtitle={subtitle} />
      {children}
    </ScrollView>
  );
}
