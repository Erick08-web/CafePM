import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { useAuth } from "@/auth/auth-context";
import { AppButton } from "@/components/app-button";
import { AppCard } from "@/components/app-card";
import { StatusBadge } from "@/components/status-badge";
import { colors, spacing, typography } from "@/theme";

export function SessionBar() {
  const { usuario, cerrarSesion } = useAuth();
  const router = useRouter();

  if (!usuario) {
    return null;
  }

  async function handleLogout() {
    await cerrarSesion();
    router.replace("/");
  }

  const permisoPrincipal = usuario.rol ?? usuario.permisos[0]?.nombre ?? "Sin rol asignado";

  return (
    <AppCard compact>
      <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.md }}>
        <View style={{ flex: 1, gap: spacing.xs }}>
          <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.sm }}>
            <MaterialCommunityIcons name="account-circle-outline" size={22} color={colors.verdeOscuro} />
            <Text selectable style={{ color: colors.texto, flex: 1, fontSize: typography.bodyLarge, fontWeight: "900" }}>
              {usuario.nombre}
            </Text>
          </View>
          <Text selectable style={{ color: colors.textoSuave, fontWeight: "600" }}>
            {usuario.correo}
          </Text>
          <StatusBadge label={permisoPrincipal} tone="success" />
        </View>
        <AppButton icon="logout" onPress={handleLogout} title="Salir" variant="ghost" />
      </View>
    </AppCard>
  );
}
