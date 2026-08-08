import { Stack } from "expo-router/stack";
import { StatusBar } from "expo-status-bar";

import { AuthProvider } from "@/auth/auth-context";
import { colors } from "@/theme";

export default function Layout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.verdeOscuro },
          headerShadowVisible: false,
          headerTintColor: colors.textoInvertido,
          contentStyle: { backgroundColor: colors.fondo },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Coffee Code", headerShown: false }} />
        <Stack.Screen name="mesero" options={{ title: "Mesero" }} />
        <Stack.Screen name="cocina" options={{ title: "Cocina" }} />
        <Stack.Screen name="caja" options={{ title: "Caja" }} />
        <Stack.Screen name="admin" options={{ title: "Administrador" }} />
      </Stack>
    </AuthProvider>
  );
}
