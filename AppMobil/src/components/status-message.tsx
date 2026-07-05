import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/theme/colors";

type Props = {
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

export function StatusMessage({ loading, error, onRetry }: Props) {
  if (loading) {
    return (
      <View style={{ backgroundColor: colors.superficieMenta, borderRadius: 18, padding: 14 }}>
        <Text selectable style={{ color: colors.verde, fontWeight: "800" }}>Cargando datos frescos...</Text>
      </View>
    );
  }

  if (!error) {
    return null;
  }

  return (
    <Pressable
      onPress={onRetry}
      style={{
        backgroundColor: colors.rojoFondo,
        borderColor: "#f1b8ad",
        borderCurve: "continuous",
        borderRadius: 18,
        borderWidth: 1,
        padding: 16,
        gap: 10,
      }}
    >
      <View style={{ alignItems: "center", flexDirection: "row", gap: 8 }}>
        <MaterialCommunityIcons name="wifi-off" size={22} color={colors.rojo} />
        <Text selectable style={{ color: colors.rojo, fontWeight: "900", fontSize: 17 }}>Sin conexion con la API</Text>
      </View>
      <Text selectable style={{ color: colors.rojo, lineHeight: 20, fontWeight: "600" }}>{error}</Text>
      {onRetry ? <Text style={{ color: colors.rojo, fontWeight: "900" }}>Toca para reintentar</Text> : null}
    </Pressable>
  );
}
