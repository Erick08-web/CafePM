import { Stack } from "expo-router/stack";

import { colors } from "@/theme";

export default function CajaLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.verdeOscuro },
        headerShadowVisible: false,
        headerTintColor: colors.textoInvertido,
        contentStyle: { backgroundColor: colors.fondo },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Caja" }} />
      <Stack.Screen name="cuentas" options={{ title: "Cuentas" }} />
      <Stack.Screen name="historial" options={{ title: "Historial" }} />
      <Stack.Screen name="resumen" options={{ title: "Resumen" }} />
      <Stack.Screen name="perfil" options={{ title: "Perfil" }} />
    </Stack>
  );
}
