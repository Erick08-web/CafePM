import { Alert, Text, View } from "react-native";

import { useRequireAuth } from "@/auth/use-require-auth";
import {
  ActionTile,
  AppCard,
  EmptyState,
  LoadingState,
  MetricCard,
  Screen,
  SectionHeader,
  SessionBar,
  StatusBadge,
  StatusMessage,
} from "@/components";
import { useApi } from "@/hooks/use-api";
import { colors, radius, spacing } from "@/theme";
import type { Inventario, PedidoPorEstado, ResumenCaja, UsuarioResumen } from "@/types";
import { estadoLegible, money, obtenerSaludo } from "@/utils/dashboard";

function accionPreparada(nombre: string) {
  Alert.alert(nombre, "Este acceso quedara conectado en las siguientes fases administrativas.");
}

export default function Admin() {
  const auth = useRequireAuth();
  const resumen = useApi<ResumenCaja>("/estadisticas/resumen");
  const pedidosPorEstado = useApi<PedidoPorEstado[]>("/estadisticas/pedidos-por-estado");
  const usuarios = useApi<UsuarioResumen[]>("/usuarios");
  const inventarioBajo = useApi<Inventario[]>("/cocina/inventario-bajo");
  const loading = resumen.loading || pedidosPorEstado.loading || usuarios.loading || inventarioBajo.loading;
  const error = resumen.error ?? pedidosPorEstado.error ?? usuarios.error ?? inventarioBajo.error;

  if (auth.cargandoSesion || !auth.usuario) {
    return (
      <Screen title="Administrador" subtitle="Preparando tu sesion de trabajo.">
        <LoadingState title={auth.cargandoSesion ? "Recuperando sesion" : "Redirigiendo"} message="Verificando tu acceso a Coffee Code." />
      </Screen>
    );
  }

  const usuariosData = usuarios.data ?? [];
  const inventarioData = inventarioBajo.data ?? [];
  const pedidosData = pedidosPorEstado.data ?? [];
  const usuariosActivos = usuariosData.filter((usuario) => usuario.activo).length;
  const pedidosTotales = pedidosData.reduce((total, item) => total + item.total, 0);
  const primerNombre = auth.usuario.nombre.split(" ")[0] ?? auth.usuario.nombre;

  return (
    <Screen
      title={`${obtenerSaludo()}, ${primerNombre}`}
      subtitle="Vista administrativa con indicadores reales de Coffee Code."
      refreshing={loading}
      onRefresh={() => {
        void resumen.recargar();
        void pedidosPorEstado.recargar();
        void usuarios.recargar();
        void inventarioBajo.recargar();
      }}
    >
      <StatusMessage
        loading={loading}
        error={error}
        onRetry={() => {
          void resumen.recargar();
          void pedidosPorEstado.recargar();
          void usuarios.recargar();
          void inventarioBajo.recargar();
        }}
      />

      <SessionBar />

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
        <MetricCard icon="trending-up" label="Ingresos" value={money(resumen.data?.ingresos)} tone={colors.verde} />
        <MetricCard icon="cash-multiple" label="Ganancia" value={money(resumen.data?.ganancia_estimada)} tone={colors.azul} />
        <MetricCard icon="account-group-outline" label="Usuarios activos" value={usuariosActivos} helper={`${usuariosData.length} total`} tone={colors.acento} />
        <MetricCard icon="alert-outline" label="Inventario bajo" value={inventarioData.length} tone={colors.coral} />
      </View>

      <AppCard>
        <SectionHeader title="Accesos rapidos" subtitle="Entrada visual a modulos administrativos existentes o futuros." icon="view-dashboard-outline" />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
          <ActionTile icon="chart-donut" onPress={() => accionPreparada("Resumen")} title="Resumen" description="Indicadores" />
          <ActionTile icon="account-cog-outline" onPress={() => accionPreparada("Usuarios")} title="Usuarios" description={`${usuariosData.length} registrados`} tone={colors.acento} />
          <ActionTile icon="package-variant-closed" onPress={() => accionPreparada("Inventario")} title="Inventario" description={`${inventarioData.length} alertas`} tone={colors.coral} />
          <ActionTile icon="file-chart-outline" onPress={() => accionPreparada("Reportes")} title="Reportes" description="Disponibles en WebAdmin" tone={colors.azul} />
        </View>
      </AppCard>

      <AppCard>
        <SectionHeader title="Pedidos por estado" subtitle={`${pedidosTotales} pedido(s) registrados en la base.`} icon="clipboard-list-outline" />

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
          !loading && <EmptyState title="Sin pedidos" message="Aun no hay estados de pedidos para mostrar." />
        )}
      </AppCard>

      <AppCard tone="honey">
        <SectionHeader title="Inventario bajo" subtitle="Insumos que requieren atencion operativa." icon="package-variant-closed" />

        {inventarioData.length ? (
          <View style={{ gap: spacing.sm }}>
            {inventarioData.slice(0, 5).map((item) => (
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
                <Text selectable style={{ color: colors.texto, flex: 1, fontWeight: "900" }}>
                  {item.nombre}
                </Text>
                <StatusBadge label={`${item.stock_actual} ${item.unidad_medida}`} tone="danger" />
              </View>
            ))}
          </View>
        ) : (
          !loading && <EmptyState title="Inventario saludable" message="No hay insumos por debajo del minimo." />
        )}
      </AppCard>
    </Screen>
  );
}
