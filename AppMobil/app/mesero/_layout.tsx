import { Stack } from "expo-router/stack";

import { colors } from "@/theme";

export default function MeseroLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.verdeOscuro },
        headerShadowVisible: false,
        headerTintColor: colors.textoInvertido,
        contentStyle: { backgroundColor: colors.fondo },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Mesero" }} />
      <Stack.Screen name="mesas" options={{ title: "Mesas" }} />
      <Stack.Screen name="nueva-orden" options={{ title: "Nueva orden" }} />
      <Stack.Screen name="pedidos" options={{ title: "Pedidos" }} />
      <Stack.Screen name="perfil" options={{ title: "Perfil" }} />
    </Stack>
  );
}
