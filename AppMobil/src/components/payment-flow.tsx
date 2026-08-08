import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { AppButton } from "@/components/app-button";
import { AppCard } from "@/components/app-card";
import { StatusBadge } from "@/components/status-badge";
import { colors, radius, spacing, typography } from "@/theme";
import type { Cuenta, MetodoPago, PagoCreado, PedidoDetalle } from "@/types";
import { estadoLegible, formatDateTime, money } from "@/utils/dashboard";

type AccountCardProps = {
  cuenta: Cuenta;
  selected?: boolean;
  onPress: () => void;
};

export function AccountCard({ cuenta, selected = false, onPress }: AccountCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: selected ? colors.superficieMenta : colors.superficieElevada,
        borderColor: selected ? colors.verdeOscuro : colors.bordeSuave,
        borderCurve: "continuous",
        borderRadius: radius.lg,
        borderWidth: 1,
        gap: spacing.md,
        opacity: pressed ? 0.86 : 1,
        padding: spacing.lg,
      })}
    >
      <View style={{ alignItems: "flex-start", flexDirection: "row", gap: spacing.md, justifyContent: "space-between" }}>
        <View style={{ flex: 1, gap: spacing.xs }}>
          <Text selectable style={{ color: colors.texto, fontSize: typography.bodyLarge, fontWeight: "900" }}>
            Pedido #{cuenta.id_pedido}
          </Text>
          <Text selectable style={{ color: colors.textoSuave, fontWeight: "700" }}>
            Mesa {cuenta.numero_mesa} - {formatDateTime(cuenta.fecha_hora)}
          </Text>
        </View>
        <Text selectable style={{ color: colors.verdeOscuro, fontSize: typography.bodyLarge, fontWeight: "900", fontVariant: ["tabular-nums"] }}>
          {money(cuenta.total)}
        </Text>
      </View>
      <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: spacing.md }}>
        <StatusBadge label={estadoLegible(cuenta.estado)} tone={cuenta.estado === "listo" ? "success" : "warning"} />
        <Text selectable style={{ color: colors.verdeOscuro, fontWeight: "900" }}>
          Ver cuenta
        </Text>
      </View>
    </Pressable>
  );
}

const methods: Array<{ value: MetodoPago; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }> = [
  { value: "efectivo", label: "Efectivo", icon: "cash" },
  { value: "tarjeta", label: "Tarjeta", icon: "credit-card-outline" },
  { value: "transferencia", label: "Transferencia", icon: "bank-transfer" },
];

type PaymentMethodSelectorProps = {
  value: MetodoPago | null;
  onChange: (value: MetodoPago) => void;
};

export function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
      {methods.map((method) => {
        const selected = value === method.value;

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected }}
            key={method.value}
            onPress={() => onChange(method.value)}
            style={({ pressed }) => ({
              alignItems: "center",
              backgroundColor: selected ? colors.verdeOscuro : colors.superficieElevada,
              borderColor: selected ? colors.verdeOscuro : colors.bordeSuave,
              borderCurve: "continuous",
              borderRadius: radius.lg,
              borderWidth: 1,
              flexBasis: "31%",
              flexGrow: 1,
              gap: spacing.sm,
              minHeight: 98,
              opacity: pressed ? 0.84 : 1,
              padding: spacing.md,
            })}
          >
            <MaterialCommunityIcons name={method.icon} size={25} color={selected ? colors.textoInvertido : colors.verdeOscuro} />
            <Text selectable style={{ color: selected ? colors.textoInvertido : colors.texto, fontWeight: "900", textAlign: "center" }}>
              {method.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

type PaymentSummaryProps = {
  cuenta: Cuenta;
  detalle: PedidoDetalle;
  metodo: MetodoPago | null;
  processing?: boolean;
  onPay: () => void;
  onCancel: () => void;
};

export function PaymentSummary({ cuenta, detalle, metodo, processing = false, onPay, onCancel }: PaymentSummaryProps) {
  return (
    <View style={{ gap: spacing.md }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.md }}>
        <Text selectable style={{ color: colors.textoSuave, fontWeight: "800" }}>
          Mesa
        </Text>
        <Text selectable style={{ color: colors.texto, fontWeight: "900" }}>
          Mesa {cuenta.numero_mesa}
        </Text>
      </View>

      {detalle.detalle.map((item) => (
        <View
          key={item.id_detalle}
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
              {item.cantidad}x {item.nombre}
            </Text>
            <Text selectable style={{ color: colors.verdeOscuro, fontWeight: "900", fontVariant: ["tabular-nums"] }}>
              {money(Number(item.subtotal))}
            </Text>
          </View>
          <Text selectable style={{ color: colors.textoSuave, fontWeight: "700" }}>
            Unitario {money(Number(item.precio_unitario))}
          </Text>
          {item.observaciones ? (
            <Text selectable style={{ color: colors.cafe, fontWeight: "700", lineHeight: 19 }}>
              Obs: {item.observaciones}
            </Text>
          ) : null}
        </View>
      ))}

      <View
        style={{
          backgroundColor: colors.superficieMenta,
          borderColor: "#c6ddcf",
          borderCurve: "continuous",
          borderRadius: radius.lg,
          borderWidth: 1,
          gap: spacing.xs,
          padding: spacing.lg,
        }}
      >
        <Text selectable style={{ color: colors.textoSuave, fontWeight: "800" }}>
          Total definitivo
        </Text>
        <Text selectable style={{ color: colors.verdeOscuro, fontSize: 30, fontWeight: "900", fontVariant: ["tabular-nums"] }}>
          {money(Number(detalle.total))}
        </Text>
      </View>

      <View style={{ flexDirection: "row", gap: spacing.sm }}>
        <AppButton icon="arrow-left" onPress={onCancel} title="Volver" variant="ghost" />
        <AppButton
          disabled={processing}
          fullWidth
          icon="cash-check"
          onPress={onPay}
          title={processing ? "Procesando..." : `Cobrar ${money(Number(detalle.total))}`}
        />
      </View>
      {!metodo ? (
        <Text selectable style={{ color: colors.textoSuave, fontSize: typography.caption, fontWeight: "700" }}>
          Selecciona un metodo de pago para habilitar el cobro.
        </Text>
      ) : null}
    </View>
  );
}

type PaymentSuccessProps = {
  pago: PagoCreado;
};

export function PaymentSuccess({ pago }: PaymentSuccessProps) {
  return (
    <AppCard compact tone="mint">
      <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.md }}>
        <MaterialCommunityIcons name="check-circle-outline" size={28} color={colors.verde} />
        <View style={{ flex: 1, gap: spacing.xs }}>
          <Text selectable style={{ color: colors.texto, fontSize: typography.bodyLarge, fontWeight: "900" }}>
            Pago realizado
          </Text>
          <Text selectable style={{ color: colors.textoSuave, fontWeight: "700" }}>
            Pedido #{pago.id_pedido} - {money(Number(pago.monto))} - {estadoLegible(pago.metodo_pago)}
          </Text>
        </View>
      </View>
    </AppCard>
  );
}
