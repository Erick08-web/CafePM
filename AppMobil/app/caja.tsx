import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { Card } from "@/components/card";
import { Screen } from "@/components/screen";
import { StatusMessage } from "@/components/status-message";
import { useApi } from "@/hooks/use-api";
import { colors } from "@/theme/colors";
import type { Cuenta, ResumenCaja } from "@/types";

function money(value: number | undefined) {
  return `$${(value ?? 0).toFixed(2)}`;
}

export default function Caja() {
  const resumen = useApi<ResumenCaja>("/caja/resumen");
  const cuentas = useApi<Cuenta[]>("/caja/cuentas");
  const loading = resumen.loading || cuentas.loading;

  return (
    <Screen title="Caja" subtitle="Cuentas pendientes y resumen monetario para cerrar el dia con claridad." refreshing={loading} onRefresh={() => { void resumen.recargar(); void cuentas.recargar(); }}>
      <StatusMessage loading={loading} error={resumen.error ?? cuentas.error} onRetry={() => { void resumen.recargar(); void cuentas.recargar(); }} />

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {[
          ["Ingresos", money(resumen.data?.ingresos), colors.menta, "trending-up"],
          ["Gastos", money(resumen.data?.gastos), colors.coral, "receipt-text-outline"],
          ["Compras", money(resumen.data?.compras), colors.azul, "cart-outline"],
          ["Ganancia", money(resumen.data?.ganancia_estimada), colors.acento, "cash-multiple"],
        ].map(([label, value, accent, icon]) => (
          <View key={String(label)} style={{ backgroundColor: colors.superficie, borderColor: colors.borde, borderRadius: 18, borderWidth: 1, boxShadow: colors.sombra, flexBasis: "47%", flexGrow: 1, gap: 8, padding: 15 }}>
            <MaterialCommunityIcons name={icon as keyof typeof MaterialCommunityIcons.glyphMap} size={24} color={String(accent)} />
            <Text selectable style={{ color: colors.textoSuave, fontWeight: "800" }}>{label}</Text>
            <Text selectable style={{ color: colors.texto, fontSize: 22, fontWeight: "900", fontVariant: ["tabular-nums"] }}>{value}</Text>
          </View>
        ))}
      </View>

      <Card tone="mint">
        <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
          <View>
            <Text selectable style={{ color: colors.texto, fontSize: 20, fontWeight: "900" }}>Cuentas pendientes</Text>
            <Text selectable style={{ color: colors.textoSuave, fontWeight: "600" }}>Pedidos listos para cobrar</Text>
          </View>
          <MaterialCommunityIcons name="cash-register" size={30} color={colors.menta} />
        </View>
        {(cuentas.data ?? []).map((cuenta) => (
          <View key={cuenta.id_pedido} style={{ backgroundColor: colors.superficie, borderColor: colors.borde, borderRadius: 16, borderWidth: 1, padding: 14, gap: 5 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
              <Text selectable style={{ color: colors.texto, flex: 1, fontWeight: "900" }}>Pedido #{cuenta.id_pedido} · Mesa {cuenta.numero_mesa}</Text>
              <Text selectable style={{ color: colors.menta, fontSize: 18, fontWeight: "900" }}>{money(cuenta.total)}</Text>
            </View>
            <Text selectable style={{ color: colors.textoSuave, fontWeight: "700" }}>{cuenta.estado}</Text>
          </View>
        ))}
        {(cuentas.data ?? []).length === 0 ? <Text selectable style={{ color: colors.textoSuave, fontWeight: "700" }}>No hay cuentas pendientes.</Text> : null}
      </Card>
    </Screen>
  );
}
