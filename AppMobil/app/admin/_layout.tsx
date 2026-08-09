import { Stack } from "expo-router/stack";

import { colors } from "@/theme";

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.verdeOscuro },
        headerShadowVisible: false,
        headerTintColor: colors.textoInvertido,
        contentStyle: { backgroundColor: colors.fondo },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Admin" }} />
      <Stack.Screen name="resumen" options={{ title: "Resumen" }} />
      <Stack.Screen name="inventario" options={{ title: "Inventario" }} />
      <Stack.Screen name="usuarios" options={{ title: "Usuarios" }} />
      <Stack.Screen name="perfil" options={{ title: "Perfil" }} />
    </Stack>
  );
}
