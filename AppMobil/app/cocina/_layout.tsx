import { Stack } from "expo-router/stack";

import { colors } from "@/theme";

export default function CocinaLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.verdeOscuro },
        headerShadowVisible: false,
        headerTintColor: colors.textoInvertido,
        contentStyle: { backgroundColor: colors.fondo },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Cocina" }} />
      <Stack.Screen name="pedidos" options={{ title: "Pedidos" }} />
      <Stack.Screen name="pendientes" options={{ title: "Pendientes" }} />
      <Stack.Screen name="preparando" options={{ title: "Preparando" }} />
      <Stack.Screen name="listos" options={{ title: "Listos" }} />
      <Stack.Screen name="perfil" options={{ title: "Perfil" }} />
    </Stack>
  );
}
