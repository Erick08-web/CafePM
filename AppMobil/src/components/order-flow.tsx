import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View } from "react-native";

import { AppCard } from "@/components/app-card";
import { AppButton } from "@/components/app-button";
import { AppInput } from "@/components/app-input";
import { StatusBadge } from "@/components/status-badge";
import { colors, radius, spacing, typography } from "@/theme";
import type { Mesa, PersonalizacionSeleccionada, Producto } from "@/types";
import { estadoLegible, money } from "@/utils/dashboard";

type Tone = "success" | "warning" | "neutral" | "danger";
type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export type OrderItem = {
  cartKey: string;
  producto: Producto;
  cantidad: number;
  precioUnitario: number;
  modificadores: number[];
  personalizaciones: PersonalizacionSeleccionada[];
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
  onOpenDetails?: () => void;
  showObservaciones?: boolean;
};

const categoryVisuals: Record<string, { icon: IconName; background: string; color: string }> = {
  "Cafes calientes": { icon: "coffee-outline", background: "#f4e7d5", color: colors.cafe },
  "Cafes frios": { icon: "cup-outline", background: "#e8f1f8", color: colors.azul },
  Espresso: { icon: "coffee-maker-outline", background: colors.superficieMenta, color: colors.verdeOscuro },
  "Chocolate y te": { icon: "tea-outline", background: colors.amarilloFondo, color: colors.cafe },
  "Bebidas mezcladas": { icon: "blender-outline", background: "#f2e4dc", color: colors.coral },
  Panaderia: { icon: "bread-slice-outline", background: "#f8eddb", color: colors.acento },
  Postres: { icon: "cake-variant-outline", background: "#fbefea", color: colors.coral },
  Alimentos: { icon: "food-outline", background: colors.superficieMenta, color: colors.verde },
};

function visualForProduct(producto: Producto) {
  const nombre = producto.nombre.toLowerCase();
  if (nombre.includes("espresso")) return { icon: "coffee-maker-outline" as IconName, background: colors.superficieMenta, color: colors.verdeOscuro };
  if (nombre.includes("frappe")) return { icon: "blender-outline" as IconName, background: "#f2e4dc", color: colors.coral };
  if (nombre.includes("chocolate") || nombre.includes("mocha")) return { icon: "cup" as IconName, background: colors.amarilloFondo, color: colors.cafe };
  if (nombre.includes("te ") || nombre.includes("chai") || nombre.includes("matcha")) return { icon: "tea-outline" as IconName, background: colors.verdeFondo, color: colors.verdeOscuro };
  if (nombre.includes("croissant")) return { icon: "bread-slice-outline" as IconName, background: "#f8eddb", color: colors.acento };
  if (nombre.includes("brownie") || nombre.includes("cheesecake") || nombre.includes("galleta")) return { icon: "cake-variant-outline" as IconName, background: "#fbefea", color: colors.coral };
  return categoryVisuals[producto.categoria ?? ""] ?? { icon: "coffee-outline" as IconName, background: colors.superficieMenta, color: colors.verdeOscuro };
}

export function ProductCard({ producto, quantity, observaciones, onIncrease, onDecrease, onChangeObservaciones, onOpenDetails, showObservaciones = true }: ProductCardProps) {
  const visual = visualForProduct(producto);
  const disponible = producto.activo !== false;

  return (
    <View
      style={{
        backgroundColor: colors.superficieElevada,
        borderColor: colors.bordeSuave,
        borderCurve: "continuous",
        borderRadius: radius.md,
        borderWidth: 1,
        gap: spacing.sm,
        opacity: disponible ? 1 : 0.62,
        padding: spacing.md,
      }}
    >
      <Pressable
        accessibilityRole="button"
        onPress={onOpenDetails}
        style={({ pressed }) => ({
          alignItems: "center",
          flexDirection: "row",
          gap: spacing.md,
          opacity: pressed ? 0.82 : 1,
        })}
      >
        <View
          style={{
            alignItems: "center",
            aspectRatio: 1,
            backgroundColor: visual.background,
            borderCurve: "continuous",
            borderRadius: radius.md,
            justifyContent: "center",
            width: 82,
          }}
        >
          <MaterialCommunityIcons name={visual.icon} size={34} color={visual.color} />
        </View>
        <View style={{ flex: 1, gap: spacing.xs }}>
          <Text numberOfLines={1} selectable style={{ color: colors.texto, fontSize: typography.bodyLarge, fontWeight: "900" }}>
            {producto.nombre}
          </Text>
          <Text numberOfLines={1} selectable style={{ color: colors.textoSuave, fontSize: typography.caption, fontWeight: "800" }}>
            {producto.categoria ?? "Sin categoria"}
          </Text>
          {producto.descripcion ? (
            <Text numberOfLines={2} selectable style={{ color: colors.textoSuave, fontWeight: "600", lineHeight: 18 }}>
              {producto.descripcion}
            </Text>
          ) : null}
          <Text selectable style={{ color: colors.verdeOscuro, fontSize: typography.bodyLarge, fontWeight: "900", fontVariant: ["tabular-nums"] }}>
            {money(Number(producto.precio))}
          </Text>
        </View>
      </Pressable>

      <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.md, justifyContent: "space-between" }}>
        {disponible ? <StatusBadge label={quantity > 0 ? "En pedido" : "Disponible"} tone={quantity > 0 ? "success" : "neutral"} /> : <StatusBadge label="Agotado" tone="danger" />}
        {quantity > 0 ? (
          <QuantitySelector quantity={quantity} onDecrease={onDecrease} onIncrease={onIncrease} />
        ) : (
          <AppButton disabled={!disponible} icon="plus" onPress={onIncrease} title="Agregar" variant="secondary" />
        )}
      </View>

      {quantity > 0 && showObservaciones ? (
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

type MenuCategoryFilterProps = {
  categories: string[];
  value: string;
  onChange: (value: string) => void;
};

export function MenuCategoryFilter({ categories, value, onChange }: MenuCategoryFilterProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, paddingRight: spacing.lg }}>
      {["Todos", ...categories].map((category) => {
        const selected = value === category;
        const visual = categoryVisuals[category] ?? { icon: "silverware-fork-knife" as IconName, background: colors.superficieElevada, color: colors.textoSuave };

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected }}
            key={category}
            onPress={() => onChange(category)}
            style={({ pressed }) => ({
              alignItems: "center",
              backgroundColor: selected ? colors.verdeOscuro : colors.superficieElevada,
              borderColor: selected ? colors.verdeOscuro : colors.bordeSuave,
              borderRadius: radius.pill,
              borderWidth: 1,
              flexDirection: "row",
              gap: spacing.sm,
              minHeight: 44,
              opacity: pressed ? 0.82 : 1,
              paddingHorizontal: spacing.md,
            })}
          >
            <MaterialCommunityIcons name={visual.icon} size={18} color={selected ? colors.textoInvertido : visual.color} />
            <Text selectable style={{ color: selected ? colors.textoInvertido : colors.texto, fontWeight: "900" }}>
              {category}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
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

type FloatingCartBarProps = CartBarProps & {
  onViewOrder: () => void;
};

export function FloatingCartBar({ count, total, onViewOrder }: FloatingCartBarProps) {
  return (
    <View
      style={{
        backgroundColor: colors.superficieOscura,
        borderColor: "rgba(255, 250, 242, 0.16)",
        borderCurve: "continuous",
        borderRadius: radius.xl,
        borderWidth: 1,
        boxShadow: "0 14px 32px rgba(18, 61, 47, 0.24)",
        flexDirection: "row",
        gap: spacing.md,
        alignItems: "center",
        padding: spacing.md,
      }}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Text selectable style={{ color: colors.textoInvertido, fontWeight: "900", fontVariant: ["tabular-nums"] }}>
          {count} producto(s)
        </Text>
        <Text selectable style={{ color: "#dbe8de", fontSize: typography.bodyLarge, fontWeight: "900", fontVariant: ["tabular-nums"] }}>
          {money(total)}
        </Text>
      </View>
      <AppButton icon="receipt-text-outline" onPress={onViewOrder} title="Ver pedido" variant="secondary" />
    </View>
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
        const subtotal = Number(item.precioUnitario) * item.cantidad;

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
              Unitario {money(Number(item.precioUnitario))}
            </Text>
            {item.personalizaciones.length ? (
              <View style={{ gap: 2 }}>
                {item.personalizaciones.map((opcion) => (
                  <Text key={`${item.cartKey}-${opcion.id_opcion}`} selectable style={{ color: colors.textoSuave, fontWeight: "700", lineHeight: 18 }}>
                    {opcion.nombre_opcion}
                    {Number(opcion.precio_adicional) > 0 ? ` +${money(Number(opcion.precio_adicional))}` : ""}
                  </Text>
                ))}
              </View>
            ) : null}
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
