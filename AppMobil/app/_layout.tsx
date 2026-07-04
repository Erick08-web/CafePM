import { Stack } from "expo-router/stack";
import { StatusBar } from "expo-status-bar";

import { colors } from "@/theme/colors";

export default function Layout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.fondo },
          headerShadowVisible: false,
          headerTintColor: colors.cafeOscuro,
          contentStyle: { backgroundColor: colors.fondo },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Coffee Code" }} />
        <Stack.Screen name="mesero" options={{ title: "Mesero" }} />
        <Stack.Screen name="cocina" options={{ title: "Cocina" }} />
        <Stack.Screen name="caja" options={{ title: "Caja" }} />
      </Stack>
    </>
  );
}
