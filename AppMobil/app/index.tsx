import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Pressable, ScrollView, Text, View } from "react-native";

import { useAuth } from "@/auth/auth-context";
import { AppButton, AppCard, AppInput, LoadingState, StatusBadge } from "@/components";
import { colors, radius, shadows, spacing, typography } from "@/theme";

export default function InicioSesion() {
  const router = useRouter();
  const { cargandoSesion, iniciarSesion, obtenerRutaInicial, usuario } = useAuth();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!cargandoSesion && usuario) {
      router.replace(obtenerRutaInicial(usuario));
    }
  }, [cargandoSesion, obtenerRutaInicial, router, usuario]);

  async function handleLogin() {
    const correoLimpio = correo.trim();
    const passwordLimpio = password.trim();

    if (!correoLimpio) {
      setError("Ingresa tu correo para continuar.");
      return;
    }

    if (!passwordLimpio) {
      setError("Ingresa tu contraseña para continuar.");
      return;
    }

    try {
      setEnviando(true);
      setError("");
      const ruta = await iniciarSesion(correoLimpio, passwordLimpio);
      router.replace(ruta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos iniciar sesion. Intentalo nuevamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        style={{ flex: 1, backgroundColor: colors.fondo }}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: spacing.xl, gap: spacing.xl }}
      >
        <View style={{ alignItems: "center", gap: spacing.md }}>
          <View
            style={{
              alignItems: "center",
              backgroundColor: colors.verdeOscuro,
              borderCurve: "continuous",
              borderRadius: radius["2xl"],
              boxShadow: shadows.header,
              height: 82,
              justifyContent: "center",
              width: 82,
            }}
          >
            <MaterialCommunityIcons name="coffee" size={42} color={colors.textoInvertido} />
          </View>
          <View style={{ alignItems: "center", gap: spacing.xs }}>
            <StatusBadge label="Coffee Code / CafePM" tone="success" />
            <Text selectable style={{ color: colors.texto, fontSize: typography.hero, fontWeight: "900", lineHeight: 40 }}>
              Bienvenido
            </Text>
            <Text selectable style={{ color: colors.textoSuave, fontSize: typography.bodyLarge, fontWeight: "700", textAlign: "center" }}>
              Administracion de cafeteria con una experiencia movil limpia y profesional.
            </Text>
          </View>
        </View>

        <AppCard style={{ gap: spacing.lg }}>
          {cargandoSesion ? <LoadingState title="Recuperando sesion" message="Estamos verificando si ya tienes una sesion activa." /> : null}
          {error ? <StatusBadge label={error} tone="danger" /> : null}

          <AppInput
            autoCapitalize="none"
            autoComplete="email"
            icon="email-outline"
            keyboardType="email-address"
            label="Correo electronico"
            onChangeText={setCorreo}
            placeholder="usuario@coffeecode.com"
            textContentType="emailAddress"
            value={correo}
          />

          <AppInput
            autoComplete="password"
            icon="lock-outline"
            label="Contraseña"
            onChangeText={setPassword}
            placeholder="Tu contraseña"
            secureTextEntry={!mostrarPassword}
            textContentType="password"
            value={password}
            rightSlot={
              <Pressable
                accessibilityLabel={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                hitSlop={10}
                onPress={() => setMostrarPassword((valor) => !valor)}
              >
                <MaterialCommunityIcons name={mostrarPassword ? "eye-off-outline" : "eye-outline"} size={22} color={colors.textoSuave} />
              </Pressable>
            }
          />

          <AppButton disabled={enviando || cargandoSesion} fullWidth icon="login" onPress={handleLogin} title={enviando ? "Verificando..." : "Iniciar sesion"} />
        </AppCard>

        <Text selectable style={{ color: colors.textoSuave, fontSize: typography.caption, fontWeight: "700", textAlign: "center" }}>
          Sistema de cafeteria - UPQ 2026
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
