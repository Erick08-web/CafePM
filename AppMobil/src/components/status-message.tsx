import { Pressable, Text } from "react-native";

import { colors } from "@/theme/colors";

type Props = {
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

export function StatusMessage({ loading, error, onRetry }: Props) {
  if (loading) {
    return <Text selectable style={{ color: colors.textoSuave }}>Cargando datos...</Text>;
  }

  if (!error) {
    return null;
  }

  return (
    <Pressable
      onPress={onRetry}
      style={{
        backgroundColor: colors.rojoFondo,
        borderColor: "#e8b2aa",
        borderRadius: 8,
        borderWidth: 1,
        padding: 14,
        gap: 8,
      }}
    >
      <Text selectable style={{ color: colors.rojo, fontWeight: "800" }}>Sin conexion con la API</Text>
      <Text selectable style={{ color: colors.rojo }}>{error}</Text>
      {onRetry ? <Text style={{ color: colors.rojo, fontWeight: "800" }}>Toca para reintentar</Text> : null}
    </Pressable>
  );
}
