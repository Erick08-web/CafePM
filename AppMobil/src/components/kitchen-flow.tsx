import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { AppButton } from "@/components/app-button";
import { AppCard } from "@/components/app-card";
import { StatusBadge } from "@/components/status-badge";
import { colors, radius, spacing, typography } from "@/theme";
import type { EstadoPedido, PedidoCocina } from "@/types";
import { elapsedFromNow, estadoLegible, formatDateTime } from "@/utils/dashboard";

export type KitchenFilter = "todos" | "pendiente" | "en_preparacion" | "listo";

const filterLabels: Record<KitchenFilter, string> = {
  todos: "Activos",
  pendiente: "Pendientes",
  en_preparacion: "Preparando",
  listo: "Listos",
};

export function kitchenStatusLabel(estado: string) {
  if (estado === "en_preparacion") return "En preparacion";
  return estadoLegible(estado);
}

export function kitchenStatusTone(estado: string): "success" | "warning" | "danger" | "neutral" {
  if (estado === "listo") return "success";
  if (estado === "en_preparacion") return "warning";
  if (estado === "cancelado") return "danger";
  return "neutral";
}

type KitchenStatusFilterProps = {
  value: KitchenFilter;
  counts: Record<KitchenFilter, number>;
  onChange: (value: KitchenFilter) => void;
};

export function KitchenStatusFilter({ value, counts, onChange }: KitchenStatusFilterProps) {
  const filters: KitchenFilter[] = ["todos", "pendiente", "en_preparacion", "listo"];

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
      {filters.map((filter) => {
        const selected = value === filter;

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected }}
            key={filter}
            onPress={() => onChange(filter)}
            style={({ pressed }) => ({
              alignItems: "center",
              backgroundColor: selected ? colors.verdeOscuro : colors.superficieElevada,
              borderColor: selected ? colors.verdeOscuro : colors.bordeSuave,
              borderRadius: radius.pill,
              borderWidth: 1,
              flexDirection: "row",
              gap: spacing.sm,
              minHeight: 42,
              opacity: pressed ? 0.82 : 1,
              paddingHorizontal: spacing.md,
            })}
          >
            <Text selectable style={{ color: selected ? colors.textoInvertido : colors.texto, fontWeight: "900" }}>
              {filterLabels[filter]}
            </Text>
            <View
              style={{
                backgroundColor: selected ? "rgba(255, 250, 242, 0.16)" : colors.superficieMenta,
                borderRadius: radius.pill,
                paddingHorizontal: spacing.sm,
                paddingVertical: 3,
              }}
            >
              <Text selectable style={{ color: selected ? colors.textoInvertido : colors.verdeOscuro, fontSize: typography.caption, fontWeight: "900" }}>
                {counts[filter]}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

type OrderItemsListProps = {
  pedido: PedidoCocina;
};

export function OrderItemsList({ pedido }: OrderItemsListProps) {
  return (
    <View style={{ gap: spacing.sm }}>
      {pedido.detalle.map((item) => (
        <View key={item.id_detalle} style={{ gap: spacing.xs }}>
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <Text selectable style={{ color: colors.cafe, fontWeight: "900", minWidth: 34 }}>
              {item.cantidad}x
            </Text>
            <Text selectable style={{ color: colors.texto, flex: 1, fontWeight: "900", lineHeight: 20 }}>
              {item.nombre}
            </Text>
          </View>
          {item.observaciones ? (
            <View
              style={{
                backgroundColor: colors.amarilloFondo,
                borderColor: "#ead3a7",
                borderCurve: "continuous",
                borderRadius: radius.sm,
                borderWidth: 1,
                flexDirection: "row",
                gap: spacing.sm,
                padding: spacing.sm,
              }}
            >
              <MaterialCommunityIcons name="note-text-outline" size={18} color={colors.cafe} />
              <Text selectable style={{ color: colors.cafe, flex: 1, fontWeight: "800", lineHeight: 19 }}>
                {item.observaciones}
              </Text>
            </View>
          ) : null}
          {item.personalizaciones?.length ? (
            <View style={{ gap: 3, paddingLeft: 42 }}>
              {item.personalizaciones.map((opcion) => (
                <Text key={`${item.id_detalle}-${opcion.id_opcion}`} selectable style={{ color: colors.textoSuave, fontWeight: "800", lineHeight: 18 }}>
                  {opcion.nombre_opcion}
                </Text>
              ))}
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}

type KitchenOrderCardProps = {
  pedido: PedidoCocina;
  updating?: boolean;
  onAdvance: (pedido: PedidoCocina, nextStatus: EstadoPedido) => void;
};

export function KitchenOrderCard({ pedido, updating = false, onAdvance }: KitchenOrderCardProps) {
  const elapsed = elapsedFromNow(pedido.fecha_hora);
  const canStart = pedido.estado === "pendiente";
  const canReady = pedido.estado === "en_preparacion";
  const nextStatus: EstadoPedido | null = canStart ? "en_preparacion" : canReady ? "listo" : null;
  const actionTitle = canStart ? "Comenzar preparacion" : canReady ? "Marcar como listo" : "Pedido listo";

  return (
    <AppCard compact tone={pedido.estado === "listo" ? "mint" : "default"}>
      <View style={{ alignItems: "flex-start", flexDirection: "row", gap: spacing.md, justifyContent: "space-between" }}>
        <View style={{ flex: 1, gap: spacing.xs }}>
          <Text selectable style={{ color: colors.texto, fontSize: typography.bodyLarge, fontWeight: "900" }}>
            Pedido #{pedido.id_pedido}
          </Text>
          <Text selectable style={{ color: colors.textoSuave, fontWeight: "700" }}>
            Mesa {pedido.numero_mesa} - {elapsed ?? formatDateTime(pedido.fecha_hora)}
          </Text>
          <Text selectable style={{ color: colors.textoSuave, fontSize: typography.caption, fontWeight: "700" }}>
            {formatDateTime(pedido.fecha_hora)}
          </Text>
        </View>
        <StatusBadge label={kitchenStatusLabel(pedido.estado)} tone={kitchenStatusTone(pedido.estado)} />
      </View>

      <OrderItemsList pedido={pedido} />

      {nextStatus ? (
        <AppButton
          disabled={updating}
          fullWidth
          icon={nextStatus === "listo" ? "check-circle-outline" : "pot-steam-outline"}
          onPress={() => onAdvance(pedido, nextStatus)}
          title={updating ? "Actualizando..." : actionTitle}
          variant={nextStatus === "listo" ? "primary" : "secondary"}
        />
      ) : (
        <View
          style={{
            alignItems: "center",
            backgroundColor: colors.verdeFondo,
            borderColor: "#bddfca",
            borderCurve: "continuous",
            borderRadius: radius.md,
            borderWidth: 1,
            flexDirection: "row",
            gap: spacing.sm,
            padding: spacing.md,
          }}
        >
          <MaterialCommunityIcons name="check-circle-outline" size={20} color={colors.verde} />
          <Text selectable style={{ color: colors.verde, flex: 1, fontWeight: "900" }}>
            Listo para caja
          </Text>
        </View>
      )}
    </AppCard>
  );
}
