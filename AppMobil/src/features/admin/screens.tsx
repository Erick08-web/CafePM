import { Link, type Href } from "expo-router";
import { Text, View } from "react-native";

import { useRequireAuth } from "@/auth/use-require-auth";
import { AppButton, AppCard, EmptyState, LoadingState, MetricCard, Screen, SectionHeader, StatusBadge, StatusMessage } from "@/components";
import { adminNav, RoleTabBar } from "@/features/role-navigation";
import { useApi } from "@/hooks/use-api";
import { colors, radius, spacing } from "@/theme";
import type { Inventario, PedidoPorEstado, ResumenCaja, UsuarioResumen } from "@/types";
import { estadoLegible, money, obtenerSaludo } from "@/utils/dashboard";

function AdminLoading({ title }: { title: string }) {
  return (
    <Screen title={title} subtitle="Validando tu acceso.">
      <LoadingState title="Recuperando sesion" message="Un momento." />
    </Screen>
  );
}

function useAdminData() {
  const resumen = useApi<ResumenCaja>("/estadisticas/resumen");
  const pedidosPorEstado = useApi<PedidoPorEstado[]>("/estadisticas/pedidos-por-estado");
  const usuarios = useApi<UsuarioResumen[]>("/usuarios");
  const inventarioBajo = useApi<Inventario[]>("/cocina/inventario-bajo");
  return { resumen, pedidosPorEstado, usuarios, inventarioBajo };
}

export function AdminHome() {
  const auth = useRequireAuth();
  const { resumen, pedidosPorEstado, usuarios, inventarioBajo } = useAdminData();
  const loading = resumen.loading || pedidosPorEstado.loading || usuarios.loading || inventarioBajo.loading;
  const error = resumen.error ?? pedidosPorEstado.error ?? usuarios.error ?? inventarioBajo.error;
  const usuariosData = usuarios.data ?? [];
  const inventarioData = inventarioBajo.data ?? [];
  const usuariosActivos = usuariosData.filter((usuario) => usuario.activo).length;

  if (auth.cargandoSesion || !auth.usuario) return <AdminLoading title="Admin" />;

  const primerNombre = auth.usuario.nombre.split(" ")[0] ?? auth.usuario.nombre;

  async function recargarDatos() {
    await Promise.all([resumen.recargar(), pedidosPorEstado.recargar(), usuarios.recargar(), inventarioBajo.recargar()]);
  }

  return (
    <Screen title={`${obtenerSaludo()}, ${primerNombre}`} subtitle="Panel movil" refreshing={loading} onRefresh={() => void recargarDatos()}>
      <RoleTabBar items={adminNav} />
      <StatusMessage loading={loading} error={error} onRetry={() => void recargarDatos()} />

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
        <MetricCard icon="trending-up" label="Ingresos" value={money(resumen.data?.ingresos)} tone={colors.verde} />
        <MetricCard icon="cash-multiple" label="Balance" value={money(resumen.data?.ganancia_estimada)} tone={colors.azul} />
        <MetricCard icon="account-group-outline" label="Usuarios" value={usuariosActivos} helper={`${usuariosData.length} total`} tone={colors.acento} />
        <MetricCard icon="alert-outline" label="Inventario" value={inventarioData.length} tone={colors.coral} />
      </View>

      <View style={{ flexDirection: "row", gap: spacing.sm }}>
        <Link href={"/admin/resumen" as Href} asChild>
          <AppButton icon="chart-donut" title="Resumen" variant="secondary" />
        </Link>
        <Link href={"/admin/inventario" as Href} asChild>
          <AppButton fullWidth icon="package-variant-closed" title="Inventario" />
        </Link>
      </View>
      <Link href={"/admin/usuarios" as Href} asChild>
        <AppButton fullWidth icon="account-group-outline" title="Usuarios" variant="secondary" />
      </Link>
    </Screen>
  );
}

export function AdminResumen() {
  const auth = useRequireAuth();
  const { resumen, pedidosPorEstado } = useAdminData();
  const loading = resumen.loading || pedidosPorEstado.loading;
  const error = resumen.error ?? pedidosPorEstado.error;
  const pedidosData = pedidosPorEstado.data ?? [];
  const pedidosTotales = pedidosData.reduce((total, item) => total + item.total, 0);

  if (auth.cargandoSesion || !auth.usuario) return <AdminLoading title="Resumen" />;

  return (
    <Screen title="Resumen" subtitle="Indicadores principales" refreshing={loading} onRefresh={() => void Promise.all([resumen.recargar(), pedidosPorEstado.recargar()])}>
      <RoleTabBar items={adminNav} />
      <StatusMessage loading={loading} error={error} onRetry={() => void Promise.all([resumen.recargar(), pedidosPorEstado.recargar()])} />

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
        <MetricCard icon="trending-up" label="Ingresos" value={money(resumen.data?.ingresos)} tone={colors.verde} />
        <MetricCard icon="receipt-text-outline" label="Gastos" value={money(resumen.data?.gastos)} tone={colors.coral} />
        <MetricCard icon="cart-outline" label="Compras" value={money(resumen.data?.compras)} tone={colors.acento} />
        <MetricCard icon="cash-multiple" label="Balance" value={money(resumen.data?.ganancia_estimada)} tone={colors.azul} />
      </View>

      <AppCard>
        <SectionHeader title="Pedidos por estado" subtitle={`${pedidosTotales} pedido(s)`} icon="clipboard-list-outline" />
        {pedidosData.length ? (
          <View style={{ gap: spacing.sm }}>
            {pedidosData.map((item) => (
              <View
                key={item.estado}
                style={{
                  alignItems: "center",
                  backgroundColor: colors.superficieElevada,
                  borderColor: colors.bordeSuave,
                  borderCurve: "continuous",
                  borderRadius: radius.md,
                  borderWidth: 1,
                  flexDirection: "row",
                  gap: spacing.md,
                  justifyContent: "space-between",
                  padding: spacing.md,
                }}
              >
                <Text selectable style={{ color: colors.texto, flex: 1, fontWeight: "900" }}>
                  {estadoLegible(item.estado)}
                </Text>
                <StatusBadge label={String(item.total)} tone={item.estado === "pagado" ? "success" : "neutral"} />
              </View>
            ))}
          </View>
        ) : (
          !loading && <EmptyState title="Sin pedidos" message="No hay pedidos para mostrar." />
        )}
      </AppCard>
    </Screen>
  );
}

export function AdminInventario() {
  const auth = useRequireAuth();
  const inventarioBajo = useApi<Inventario[]>("/cocina/inventario-bajo");
  const inventarioData = inventarioBajo.data ?? [];

  if (auth.cargandoSesion || !auth.usuario) return <AdminLoading title="Inventario" />;

  return (
    <Screen title="Inventario" subtitle="Alertas de insumos" refreshing={inventarioBajo.loading} onRefresh={() => void inventarioBajo.recargar()}>
      <RoleTabBar items={adminNav} />
      <StatusMessage loading={inventarioBajo.loading} error={inventarioBajo.error} onRetry={() => void inventarioBajo.recargar()} />

      <AppCard tone="honey">
        <SectionHeader title="Inventario bajo" icon="package-variant-closed" />
        {inventarioData.length ? (
          <View style={{ gap: spacing.sm }}>
            {inventarioData.map((item) => (
              <View
                key={item.id_insumo}
                style={{
                  alignItems: "center",
                  backgroundColor: colors.superficieElevada,
                  borderColor: colors.bordeSuave,
                  borderCurve: "continuous",
                  borderRadius: radius.md,
                  borderWidth: 1,
                  flexDirection: "row",
                  gap: spacing.md,
                  justifyContent: "space-between",
                  padding: spacing.md,
                }}
              >
                <View style={{ flex: 1, gap: spacing.xs }}>
                  <Text selectable style={{ color: colors.texto, fontWeight: "900" }}>
                    {item.nombre}
                  </Text>
                  <Text selectable style={{ color: colors.textoSuave, fontWeight: "700" }}>
                    Minimo {item.stock_minimo} {item.unidad_medida}
                  </Text>
                </View>
                <StatusBadge label={`${item.stock_actual} ${item.unidad_medida}`} tone="danger" />
              </View>
            ))}
          </View>
        ) : (
          !inventarioBajo.loading && <EmptyState title="Inventario estable" message="No hay alertas de inventario." />
        )}
      </AppCard>
    </Screen>
  );
}

export function AdminUsuarios() {
  const auth = useRequireAuth();
  const usuarios = useApi<UsuarioResumen[]>("/usuarios");

  if (auth.cargandoSesion || !auth.usuario) return <AdminLoading title="Usuarios" />;

  return (
    <Screen title="Usuarios" subtitle="Equipo activo" refreshing={usuarios.loading} onRefresh={() => void usuarios.recargar()}>
      <RoleTabBar items={adminNav} />
      <StatusMessage loading={usuarios.loading} error={usuarios.error} onRetry={() => void usuarios.recargar()} />

      <AppCard>
        <SectionHeader title="Usuarios" icon="account-group-outline" />
        {(usuarios.data ?? []).length ? (
          <View style={{ gap: spacing.sm }}>
            {(usuarios.data ?? []).map((usuario) => (
              <View
                key={usuario.id_usuario}
                style={{
                  alignItems: "center",
                  backgroundColor: colors.superficieElevada,
                  borderColor: colors.bordeSuave,
                  borderCurve: "continuous",
                  borderRadius: radius.md,
                  borderWidth: 1,
                  flexDirection: "row",
                  gap: spacing.md,
                  justifyContent: "space-between",
                  padding: spacing.md,
                }}
              >
                <View style={{ flex: 1, gap: spacing.xs }}>
                  <Text selectable style={{ color: colors.texto, fontWeight: "900" }}>
                    {usuario.nombre}
                  </Text>
                  <Text selectable style={{ color: colors.textoSuave, fontWeight: "700" }}>
                    {usuario.correo}
                  </Text>
                </View>
                <StatusBadge label={usuario.activo ? "Activo" : "Inactivo"} tone={usuario.activo ? "success" : "neutral"} />
              </View>
            ))}
          </View>
        ) : (
          !usuarios.loading && <EmptyState title="Sin usuarios" message="No hay usuarios para mostrar." />
        )}
      </AppCard>
    </Screen>
  );
}
