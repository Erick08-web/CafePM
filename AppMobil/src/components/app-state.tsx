import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { colors, radius, spacing, states, typography } from "@/theme";

type StateProps = {
  title?: string;
  message?: string;
};

export function LoadingState({ title = "Cargando", message = "Actualizando informacion de Coffee Code." }: StateProps) {
  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: colors.superficieMenta,
        borderColor: states.success.border,
        borderCurve: "continuous",
        borderRadius: radius.lg,
        borderWidth: 1,
        flexDirection: "row",
        gap: spacing.md,
        padding: spacing.lg,
      }}
    >
      <ActivityIndicator color={colors.verdeOscuro} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text selectable style={{ color: colors.verdeOscuro, fontSize: typography.body, fontWeight: "900" }}>
          {title}
        </Text>
        <Text selectable style={{ color: colors.textoSuave, fontWeight: "600", lineHeight: 20 }}>
          {message}
        </Text>
      </View>
    </View>
  );
}

export function EmptyState({ title = "Sin informacion", message = "No hay elementos para mostrar por ahora." }: StateProps) {
  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: colors.superficieElevada,
        borderColor: colors.bordeSuave,
        borderCurve: "continuous",
        borderRadius: radius.lg,
        borderWidth: 1,
        gap: spacing.sm,
        padding: spacing.xl,
      }}
    >
      <MaterialCommunityIcons name="cup-outline" size={28} color={colors.textoSuave} />
      <Text selectable style={{ color: colors.texto, fontSize: typography.bodyLarge, fontWeight: "900", textAlign: "center" }}>
        {title}
      </Text>
      <Text selectable style={{ color: colors.textoSuave, fontWeight: "600", lineHeight: 20, textAlign: "center" }}>
        {message}
      </Text>
    </View>
  );
}

type ErrorProps = StateProps & {
  onRetry?: () => void;
};

export function ErrorState({ title = "No se pudo cargar", message = "Revisa la conexion con la API.", onRetry }: ErrorProps) {
  return (
    <Pressable
      accessibilityRole={onRetry ? "button" : undefined}
      onPress={onRetry}
      style={{
        backgroundColor: states.danger.background,
        borderColor: states.danger.border,
        borderCurve: "continuous",
        borderRadius: radius.lg,
        borderWidth: 1,
        gap: spacing.sm,
        padding: spacing.lg,
      }}
    >
      <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.sm }}>
        <MaterialCommunityIcons name="wifi-off" size={22} color={states.danger.text} />
        <Text selectable style={{ color: states.danger.text, fontSize: typography.bodyLarge, fontWeight: "900" }}>
          {title}
        </Text>
      </View>
      <Text selectable style={{ color: states.danger.text, fontWeight: "600", lineHeight: 20 }}>
        {message}
      </Text>
      {onRetry ? (
        <Text selectable style={{ color: states.danger.text, fontWeight: "900" }}>
          Toca para reintentar
        </Text>
      ) : null}
    </Pressable>
  );
}
