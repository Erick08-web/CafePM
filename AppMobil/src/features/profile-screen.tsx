import { useRouter, type Href } from "expo-router";
import { Text, View } from "react-native";

import { useRequireAuth } from "@/auth/use-require-auth";
import { AppButton, AppCard, LoadingState, Screen, SectionHeader, StatusBadge } from "@/components";
import { colors, spacing } from "@/theme";
import { adminNav, cajaNav, cocinaNav, meseroNav, RoleTabBar } from "@/features/role-navigation";

type ProfileScreenProps = {
  roleBase: "/mesero" | "/cocina" | "/caja" | "/admin";
  roleLabel: string;
};

const navByRole = {
  "/mesero": meseroNav,
  "/cocina": cocinaNav,
  "/caja": cajaNav,
  "/admin": adminNav,
};

export function ProfileScreen({ roleBase, roleLabel }: ProfileScreenProps) {
  const auth = useRequireAuth();
  const router = useRouter();

  if (auth.cargandoSesion || !auth.usuario) {
    return (
      <Screen title="Perfil" subtitle="Validando tu acceso.">
        <LoadingState title="Recuperando sesion" message="Un momento." />
      </Screen>
    );
  }

  async function cerrarSesion() {
    await auth.cerrarSesion();
    router.replace("/" as Href);
  }

  return (
    <Screen title="Perfil" subtitle="Cuenta y sesion">
      <RoleTabBar items={navByRole[roleBase]} />

      <AppCard>
        <SectionHeader title="Coffee Code" subtitle={roleLabel} icon="account-circle-outline" />
        <View style={{ gap: spacing.md }}>
          <View style={{ gap: spacing.xs }}>
            <Text selectable style={{ color: colors.textoSuave, fontWeight: "800" }}>
              Nombre
            </Text>
            <Text selectable style={{ color: colors.texto, fontWeight: "900" }}>
              {auth.usuario.nombre}
            </Text>
          </View>
          <View style={{ gap: spacing.xs }}>
            <Text selectable style={{ color: colors.textoSuave, fontWeight: "800" }}>
              Correo
            </Text>
            <Text selectable style={{ color: colors.texto, fontWeight: "900" }}>
              {auth.usuario.correo}
            </Text>
          </View>
          <StatusBadge label={auth.usuario.rol ?? roleLabel} tone="success" />
        </View>
      </AppCard>

      <AppButton fullWidth icon="logout" onPress={cerrarSesion} title="Cerrar sesion" variant="danger" />
    </Screen>
  );
}
