import { Link, type Href } from "expo-router";
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
  StatusBadge,
  StatusMessage,
  type KitchenFilter,
  AppButton,
} from "@/components";
import { cocinaNav, RoleTabBar } from "@/features/role-navigation";
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
    if (error.status === 404) return "El pedido ya no existe.";
    if (error.status === 400) return "La transicion fue rechazada.";
    if (error.status && error.status >= 500) return "Coffee Code no pudo actualizar el pedido.";
    return error.message || "No pudimos actualizar el pedido.";
  }

  return "No pudimos actualizar el pedido.";
}

function CocinaLoading({ title }: { title: string }) {
  return (
    <Screen title={title} subtitle="Validando tu acceso.">
      <LoadingState title="Recuperando sesion" message="Un momento." />
    </Screen>
  );
}

export function CocinaHome() {
  const auth = useRequireAuth();
  const pedidos = useApi<PedidoCocina[]>("/cocina/pedidos");
  const inventario = useApi<Inventario[]>("/cocina/inventario-bajo");
  const loading = pedidos.loading || inventario.loading;
  const error = pedidos.error ?? inventario.error;
  const pedidosData = pedidos.data ?? [];
  const pendientes = pedidosData.filter((pedido) => pedido.estado === "pendiente").length;
  const preparando = pedidosData.filter((pedido) => pedido.estado === "en_preparacion").length;
  const listos = pedidosData.filter((pedido) => pedido.estado === "listo").length;

  if (auth.cargandoSesion || !auth.usuario) return <CocinaLoading title="Cocina" />;

  const primerNombre = auth.usuario.nombre.split(" ")[0] ?? auth.usuario.nombre;

  async function recargarDatos() {
    await Promise.all([pedidos.recargar(), inventario.recargar()]);
  }

  return (
    <Screen title={`${obtenerSaludo()}, ${primerNombre}`} subtitle="Linea de cocina" refreshing={loading} onRefresh={() => void recargarDatos()}>
      <RoleTabBar items={cocinaNav} />
      <StatusMessage loading={loading} error={error} onRetry={() => void recargarDatos()} />

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
        <MetricCard icon="timer-sand" label="Pendientes" value={pendientes} tone={colors.coral} />
        <MetricCard icon="pot-steam-outline" label="Preparando" value={preparando} tone={colors.acento} />
        <MetricCard icon="check-circle-outline" label="Listos" value={listos} tone={colors.verde} />
        <MetricCard icon="package-variant-closed" label="Alertas" value={(inventario.data ?? []).length} tone={colors.azul} />
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
        <Link href={"/cocina/pedidos" as Href} asChild>
          <AppButton icon="clipboard-text-outline" title="Pedidos" variant="secondary" />
        </Link>
        <Link href={"/cocina/pendientes" as Href} asChild>
          <AppButton icon="timer-sand" title="Pendientes" variant="secondary" />
        </Link>
        <Link href={"/cocina/listos" as Href} asChild>
          <AppButton icon="check-circle-outline" title="Listos" />
        </Link>
      </View>

      <AppCard tone="honey">
        <SectionHeader title="Inventario bajo" icon="package-variant-closed" />
        {(inventario.data ?? []).length ? (
          <View style={{ gap: spacing.sm }}>
            {(inventario.data ?? []).slice(0, 4).map((item) => (
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
          !loading && <EmptyState title="Inventario estable" message="No hay alertas de inventario." />
        )}
      </AppCard>
    </Screen>
  );
}

export function CocinaPedidos({ initialFilter = "todos" }: { initialFilter?: KitchenFilter }) {
  const auth = useRequireAuth();
  const pedidos = useApi<PedidoCocina[]>("/cocina/pedidos");
  const inventario = useApi<Inventario[]>("/cocina/inventario-bajo");
  const [filter, setFilter] = useState<KitchenFilter>(initialFilter);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [updateError, setUpdateError] = useState("");
  const loading = pedidos.loading || inventario.loading;
  const error = pedidos.error ?? inventario.error;
  const pedidosData = pedidos.data ?? [];
  const pendientes = pedidosData.filter((pedido) => pedido.estado === "pendiente").length;
  const preparando = pedidosData.filter((pedido) => pedido.estado === "en_preparacion").length;
  const listos = pedidosData.filter((pedido) => pedido.estado === "listo").length;

  const sortedPedidos = useMemo(() => {
    return [...pedidosData].sort((a, b) => {
      const stateDiff = (priority[a.estado] ?? 99) - (priority[b.estado] ?? 99);
      if (stateDiff !== 0) return stateDiff;
      return (a.fecha_hora ? new Date(a.fecha_hora).getTime() : 0) - (b.fecha_hora ? new Date(b.fecha_hora).getTime() : 0);
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

  if (auth.cargandoSesion || !auth.usuario) return <CocinaLoading title="Pedidos" />;

  async function recargarDatos() {
    await Promise.all([pedidos.recargar(), inventario.recargar()]);
  }

  async function actualizarEstado(pedido: PedidoCocina, nextStatus: EstadoPedido) {
    if (updatingId !== null) return;
    if (!canTransition(pedido.estado, nextStatus)) {
      setUpdateError("Cambio de estado no disponible.");
      return;
    }

    try {
      setUpdatingId(pedido.id_pedido);
      setFeedback("");
      setUpdateError("");
      const respuesta = await enviarApi<PedidoCocina>(`/cocina/pedidos/${pedido.id_pedido}/estado`, { estado: nextStatus }, "PATCH");
      if (!respuesta?.id_pedido || respuesta.estado !== nextStatus) throw new ApiError("Coffee Code no confirmo el nuevo estado.");
      setFeedback(`Pedido #${pedido.id_pedido} actualizado.`);
      await recargarDatos();
    } catch (err) {
      setUpdateError(friendlyKitchenError(err));
      await pedidos.recargar();
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <Screen title="Pedidos" subtitle="Preparacion y entrega" refreshing={loading} onRefresh={() => void recargarDatos()}>
      <RoleTabBar items={cocinaNav} />
      <StatusMessage loading={loading} error={error} onRetry={() => void recargarDatos()} />
      {feedback ? <StatusBadge label={feedback} tone="success" /> : null}
      {updateError ? <StatusBadge label={updateError} tone="danger" /> : null}

      <AppCard>
        <SectionHeader title="Filtro" icon="filter-variant" />
        <KitchenStatusFilter counts={counts} onChange={setFilter} value={filter} />
      </AppCard>

      <AppCard>
        <SectionHeader title="Pedidos de cocina" icon="clipboard-text-outline" />
        {filteredPedidos.length ? (
          <View style={{ gap: spacing.md }}>
            {filteredPedidos.map((pedido) => (
              <KitchenOrderCard key={pedido.id_pedido} onAdvance={actualizarEstado} pedido={pedido} updating={updatingId === pedido.id_pedido} />
            ))}
          </View>
        ) : (
          !loading && <EmptyState title="Sin pedidos" message="No hay pedidos en este estado." />
        )}
      </AppCard>
    </Screen>
  );
}
