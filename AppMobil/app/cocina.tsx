import { useMemo, useState } from "react";
import { Text, View } from "react-native";

import { useRequireAuth } from "@/auth/use-require-auth";
import {
  AppCard,
  EmptyState,
  KitchenOrderCard,
  KitchenStatusFilter,
  LoadingState,
  MetricCard,
  Screen,
  SectionHeader,
  SessionBar,
  StatusBadge,
  StatusMessage,
  type KitchenFilter,
} from "@/components";
import { useApi } from "@/hooks/use-api";
import { ApiError, enviarApi } from "@/services/api";
import { colors, radius, spacing } from "@/theme";
import type { EstadoPedido, Inventario, PedidoCocina } from "@/types";
import { obtenerSaludo } from "@/utils/dashboard";

const priority: Record<string, number> = {
  pendiente: 1,
  en_preparacion: 2,
  listo: 3,
};

function canTransition(current: string, next: EstadoPedido) {
  return (current === "pendiente" && next === "en_preparacion") || (current === "en_preparacion" && next === "listo");
}

function friendlyKitchenError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 404) return "El pedido ya no existe. Recargamos la informacion.";
    if (error.status === 400) return "La transicion fue rechazada. Recarga e intentalo nuevamente.";
    if (error.status && error.status >= 500) return "Coffee Code no pudo actualizar el pedido. Intentalo nuevamente.";
    return error.message || "No pudimos actualizar el pedido. Intentalo nuevamente.";
  }

  return "No pudimos actualizar el pedido. Verifica tu conexion e intentalo nuevamente.";
}

export default function Cocina() {
  const auth = useRequireAuth();
  const pedidos = useApi<PedidoCocina[]>("/cocina/pedidos");
  const inventario = useApi<Inventario[]>("/cocina/inventario-bajo");
  const [filter, setFilter] = useState<KitchenFilter>("todos");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [updateError, setUpdateError] = useState("");
  const loading = pedidos.loading || inventario.loading;
  const error = pedidos.error ?? inventario.error;

  if (auth.cargandoSesion || !auth.usuario) {
    return (
      <Screen title="Cocina" subtitle="Preparando tu sesion de trabajo.">
        <LoadingState title={auth.cargandoSesion ? "Recuperando sesion" : "Redirigiendo"} message="Verificando tu acceso a Coffee Code." />
      </Screen>
    );
  }

  const pedidosData = pedidos.data ?? [];
  const pendientes = pedidosData.filter((pedido) => pedido.estado === "pendiente").length;
  const preparando = pedidosData.filter((pedido) => pedido.estado === "en_preparacion").length;
  const listos = pedidosData.filter((pedido) => pedido.estado === "listo").length;
  const primerNombre = auth.usuario.nombre.split(" ")[0] ?? auth.usuario.nombre;

  const sortedPedidos = useMemo(() => {
    return [...pedidosData].sort((a, b) => {
      const stateDiff = (priority[a.estado] ?? 99) - (priority[b.estado] ?? 99);
      if (stateDiff !== 0) return stateDiff;

      const aDate = a.fecha_hora ? new Date(a.fecha_hora).getTime() : 0;
      const bDate = b.fecha_hora ? new Date(b.fecha_hora).getTime() : 0;
      return aDate - bDate;
    });
  }, [pedidosData]);

  const filteredPedidos = useMemo(() => {
    if (filter === "todos") return sortedPedidos;
    return sortedPedidos.filter((pedido) => pedido.estado === filter);
  }, [filter, sortedPedidos]);

  const counts: Record<KitchenFilter, number> = {
    todos: pedidosData.length,
    pendiente: pendientes,
    en_preparacion: preparando,
    listo: listos,
  };

  async function recargarDatos() {
    await Promise.all([pedidos.recargar(), inventario.recargar()]);
  }

  async function actualizarEstado(pedido: PedidoCocina, nextStatus: EstadoPedido) {
    if (updatingId !== null) return;

    if (!canTransition(pedido.estado, nextStatus)) {
      setUpdateError("Ese cambio de estado no es valido para Cocina.");
      return;
    }

    try {
      setUpdatingId(pedido.id_pedido);
      setFeedback("");
      setUpdateError("");
      const respuesta = await enviarApi<PedidoCocina>(`/cocina/pedidos/${pedido.id_pedido}/estado`, { estado: nextStatus }, "PATCH");

      if (!respuesta?.id_pedido || respuesta.estado !== nextStatus) {
        throw new ApiError("Coffee Code no confirmo el nuevo estado del pedido.");
      }

      setFeedback(`Pedido #${pedido.id_pedido} actualizado a ${nextStatus === "listo" ? "listo" : "en preparacion"}.`);
      await recargarDatos();
    } catch (err) {
      setUpdateError(friendlyKitchenError(err));
      await pedidos.recargar();
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <Screen
      title={`${obtenerSaludo()}, ${primerNombre}`}
      subtitle="Linea de cocina: cambia pedidos reales de pendiente a preparacion y listo."
      refreshing={loading}
      onRefresh={() => {
        void recargarDatos();
      }}
    >
      <StatusMessage
        loading={loading}
        error={error}
        onRetry={() => {
          void recargarDatos();
        }}
      />

      <SessionBar />

      {feedback ? <StatusBadge label={feedback} tone="success" /> : null}
      {updateError ? <StatusBadge label={updateError} tone="danger" /> : null}

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
        <MetricCard icon="timer-sand" label="Pendientes" value={pendientes} tone={colors.coral} />
        <MetricCard icon="pot-steam-outline" label="Preparando" value={preparando} tone={colors.acento} />
        <MetricCard icon="check-circle-outline" label="Listos" value={listos} tone={colors.verde} />
      </View>

      <AppCard>
        <SectionHeader title="Filtro de pedidos" subtitle="Ordenados por prioridad y antiguedad." icon="filter-variant" />
        <KitchenStatusFilter counts={counts} onChange={setFilter} value={filter} />
      </AppCard>

      <AppCard>
        <SectionHeader title="Pedidos de cocina" subtitle="Productos, cantidades y observaciones destacadas." icon="clipboard-text-outline" />

        {filteredPedidos.length ? (
          <View style={{ gap: spacing.md }}>
            {filteredPedidos.map((pedido) => (
              <KitchenOrderCard key={pedido.id_pedido} onAdvance={actualizarEstado} pedido={pedido} updating={updatingId === pedido.id_pedido} />
            ))}
          </View>
        ) : (
          !loading && <EmptyState title="Sin pedidos en este filtro" message="Recarga o cambia el filtro para revisar otros estados." />
        )}
      </AppCard>

      <AppCard tone="honey">
        <SectionHeader title="Inventario bajo" subtitle="Alertas reales de insumos por debajo del minimo." icon="package-variant-closed" />

        {(inventario.data ?? []).length ? (
          <View style={{ gap: spacing.sm }}>
            {(inventario.data ?? []).map((item) => (
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
                    Minimo requerido: {item.stock_minimo} {item.unidad_medida}
                  </Text>
                </View>
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
