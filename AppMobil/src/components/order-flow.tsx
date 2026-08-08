import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { AppCard } from "@/components/app-card";
import { AppInput } from "@/components/app-input";
import { StatusBadge } from "@/components/status-badge";
import { colors, radius, spacing, typography } from "@/theme";
import type { Mesa, Producto } from "@/types";
import { estadoLegible, money } from "@/utils/dashboard";

type Tone = "success" | "warning" | "neutral" | "danger";

export type OrderItem = {
  producto: Producto;
  cantidad: number;
  observaciones: string;
};

export function tableStateLabel(estado: string) {
  if (estado === "libre") return "Disponible";
  if (estado === "ocupada") return "Ocupada";
  if (estado === "lista") return "Cuenta pendiente";
  return estadoLegible(estado);
}

export function tableStateTone(estado: string): Tone {
  if (estado === "libre") return "success";
  if (estado === "lista") return "warning";
  if (estado === "ocupada") return "neutral";
  return "neutral";
}

type TableCardProps = {
  mesa: Mesa;
  selected?: boolean;
  onPress: () => void;
};

export function TableCard({ mesa, selected = false, onPress }: TableCardProps) {
  const disponible = mesa.estado === "libre";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !disponible, selected }}
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: selected ? colors.superficieMenta : colors.superficieElevada,
        borderColor: selected ? colors.verdeOscuro : colors.bordeSuave,
        borderCurve: "continuous",
        borderRadius: radius.md,
        borderWidth: 1,
        flexBasis: "30%",
        flexGrow: 1,
        gap: spacing.sm,
        minHeight: 116,
        minWidth: 96,
        opacity: pressed ? 0.84 : !disponible ? 0.72 : 1,
        padding: spacing.md,
      })}
    >
      <MaterialCommunityIcons name={disponible ? "table-chair" : "table-furniture"} size={22} color={disponible ? colors.verdeOscuro : colors.textoSuave} />
      <Text selectable style={{ color: colors.texto, fontSize: typography.bodyLarge, fontWeight: "900" }}>
        Mesa {mesa.numero_mesa}
      </Text>
      <StatusBadge label={tableStateLabel(mesa.estado)} tone={tableStateTone(mesa.estado)} />
    </Pressable>
  );
}

type QuantitySelectorProps = {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
};

export function QuantitySelector({ quantity, onIncrease, onDecrease }: QuantitySelectorProps) {
  return (
    <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.sm }}>
      <Pressable
        accessibilityRole="button"
        disabled={quantity <= 0}
        onPress={onDecrease}
        style={({ pressed }) => ({
          alignItems: "center",
          backgroundColor: colors.superficieMenta,
          borderColor: "#c6ddcf",
          borderRadius: radius.pill,
          borderWidth: 1,
          height: 40,
          justifyContent: "center",
          opacity: quantity <= 0 ? 0.45 : pressed ? 0.78 : 1,
          width: 40,
        })}
      >
        <MaterialCommunityIcons name="minus" size={20} color={colors.verdeOscuro} />
      </Pressable>
      <Text selectable style={{ color: colors.texto, fontSize: typography.bodyLarge, fontWeight: "900", minWidth: 28, textAlign: "center" }}>
        {quantity}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={onIncrease}
        style={({ pressed }) => ({
          alignItems: "center",
          backgroundColor: colors.verdeOscuro,
          borderRadius: radius.pill,
          height: 40,
          justifyContent: "center",
          opacity: pressed ? 0.82 : 1,
          width: 40,
        })}
      >
        <MaterialCommunityIcons name="plus" size={20} color={colors.textoInvertido} />
      </Pressable>
    </View>
  );
}

type ProductCardProps = {
  producto: Producto;
  quantity: number;
  observaciones: string;
  onIncrease: () => void;
  onDecrease: () => void;
  onChangeObservaciones: (value: string) => void;
};

export function ProductCard({ producto, quantity, observaciones, onIncrease, onDecrease, onChangeObservaciones }: ProductCardProps) {
  return (
    <View
      style={{
        backgroundColor: colors.superficieElevada,
        borderColor: colors.bordeSuave,
        borderCurve: "continuous",
        borderRadius: radius.lg,
        borderWidth: 1,
        gap: spacing.md,
        padding: spacing.lg,
      }}
    >
      <View style={{ alignItems: "flex-start", flexDirection: "row", gap: spacing.md, justifyContent: "space-between" }}>
        <View style={{ flex: 1, gap: spacing.xs }}>
          <Text selectable style={{ color: colors.texto, fontSize: typography.bodyLarge, fontWeight: "900" }}>
            {producto.nombre}
          </Text>
          <Text selectable style={{ color: colors.textoSuave, fontWeight: "700" }}>
            {producto.categoria ?? "Sin categoria"}
          </Text>
          {producto.descripcion ? (
            <Text selectable style={{ color: colors.textoSuave, fontWeight: "600", lineHeight: 20 }}>
              {producto.descripcion}
            </Text>
          ) : null}
          <StatusBadge label={producto.activo === false ? "No disponible" : "Disponible"} tone={producto.activo === false ? "danger" : "success"} />
        </View>
        <Text selectable style={{ color: colors.verdeOscuro, fontSize: typography.bodyLarge, fontWeight: "900", fontVariant: ["tabular-nums"] }}>
          {money(Number(producto.precio))}
        </Text>
      </View>

      <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.md, justifyContent: "space-between" }}>
        <Text selectable style={{ color: colors.cafe, fontWeight: "900" }}>
          Cantidad
        </Text>
        <QuantitySelector quantity={quantity} onDecrease={onDecrease} onIncrease={onIncrease} />
      </View>

      {quantity > 0 ? (
        <AppInput
          label="Observaciones"
          icon="note-edit-outline"
          onChangeText={onChangeObservaciones}
          placeholder="Sin azucar, leche deslactosada..."
          value={observaciones}
        />
      ) : null}
    </View>
  );
}

type CartBarProps = {
  count: number;
  total: number;
};

export function CartBar({ count, total }: CartBarProps) {
  return (
    <AppCard compact tone="dark">
      <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.md, justifyContent: "space-between" }}>
        <View style={{ flex: 1, gap: spacing.xs }}>
          <Text selectable style={{ color: colors.textoInvertido, fontSize: typography.bodyLarge, fontWeight: "900" }}>
            Pedido en curso
          </Text>
          <Text selectable style={{ color: "#dbe8de", fontWeight: "700" }}>
            {count} producto(s) seleccionados
          </Text>
        </View>
        <Text selectable style={{ color: colors.textoInvertido, fontSize: 22, fontWeight: "900", fontVariant: ["tabular-nums"] }}>
          {money(total)}
        </Text>
      </View>
    </AppCard>
  );
}

type OrderSummaryProps = {
  mesa: Mesa;
  items: OrderItem[];
  total: number;
};

export function OrderSummary({ mesa, items, total }: OrderSummaryProps) {
  return (
    <View style={{ gap: spacing.md }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.md }}>
        <Text selectable style={{ color: colors.textoSuave, fontWeight: "800" }}>
          Mesa
        </Text>
        <Text selectable style={{ color: colors.texto, fontWeight: "900" }}>
          Mesa {mesa.numero_mesa}
        </Text>
      </View>

      {items.map((item) => {
        const subtotal = Number(item.producto.precio) * item.cantidad;

        return (
          <View
            key={item.producto.id_producto}
            style={{
              backgroundColor: colors.superficieElevada,
              borderColor: colors.bordeSuave,
              borderCurve: "continuous",
              borderRadius: radius.md,
              borderWidth: 1,
              gap: spacing.xs,
              padding: spacing.md,
            }}
          >
            <View style={{ flexDirection: "row", gap: spacing.md, justifyContent: "space-between" }}>
              <Text selectable style={{ color: colors.texto, flex: 1, fontWeight: "900" }}>
                {item.cantidad}x {item.producto.nombre}
              </Text>
              <Text selectable style={{ color: colors.verdeOscuro, fontWeight: "900", fontVariant: ["tabular-nums"] }}>
                {money(subtotal)}
              </Text>
            </View>
            <Text selectable style={{ color: colors.textoSuave, fontWeight: "700" }}>
              Unitario {money(Number(item.producto.precio))}
            </Text>
            {item.observaciones.trim() ? (
              <Text selectable style={{ color: colors.cafe, fontWeight: "700", lineHeight: 19 }}>
                Obs: {item.observaciones.trim()}
              </Text>
            ) : null}
          </View>
        );
      })}

      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.md }}>
        <Text selectable style={{ color: colors.texto, fontSize: typography.bodyLarge, fontWeight: "900" }}>
          Total estimado
        </Text>
        <Text selectable style={{ color: colors.verdeOscuro, fontSize: typography.title, fontWeight: "900", fontVariant: ["tabular-nums"] }}>
          {money(total)}
        </Text>
      </View>
    </View>
  );
}
