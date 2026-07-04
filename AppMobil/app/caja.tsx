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
    <Screen title="Caja" subtitle="Resumen monetario y cuentas pendientes de cobro." refreshing={loading} onRefresh={() => { void resumen.recargar(); void cuentas.recargar(); }}>
      <StatusMessage loading={loading} error={resumen.error ?? cuentas.error} onRetry={() => { void resumen.recargar(); void cuentas.recargar(); }} />

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        <Card>
          <Text selectable style={{ color: colors.textoSuave }}>Ingresos</Text>
          <Text selectable style={{ color: colors.texto, fontSize: 22, fontWeight: "800", fontVariant: ["tabular-nums"] }}>{money(resumen.data?.ingresos)}</Text>
        </Card>
        <Card>
          <Text selectable style={{ color: colors.textoSuave }}>Gastos</Text>
          <Text selectable style={{ color: colors.texto, fontSize: 22, fontWeight: "800", fontVariant: ["tabular-nums"] }}>{money(resumen.data?.gastos)}</Text>
        </Card>
        <Card>
          <Text selectable style={{ color: colors.textoSuave }}>Compras</Text>
          <Text selectable style={{ color: colors.texto, fontSize: 22, fontWeight: "800", fontVariant: ["tabular-nums"] }}>{money(resumen.data?.compras)}</Text>
        </Card>
        <Card>
          <Text selectable style={{ color: colors.textoSuave }}>Ganancia</Text>
          <Text selectable style={{ color: colors.cafe, fontSize: 22, fontWeight: "800", fontVariant: ["tabular-nums"] }}>{money(resumen.data?.ganancia_estimada)}</Text>
        </Card>
      </View>

      <Card>
        <Text selectable style={{ color: colors.texto, fontSize: 18, fontWeight: "800" }}>Cuentas pendientes</Text>
        {(cuentas.data ?? []).map((cuenta) => (
          <View key={cuenta.id_pedido} style={{ borderBottomColor: colors.borde, borderBottomWidth: 1, paddingVertical: 12, gap: 4 }}>
            <Text selectable style={{ color: colors.texto, fontWeight: "800" }}>Pedido #{cuenta.id_pedido} · Mesa {cuenta.numero_mesa}</Text>
            <Text selectable style={{ color: colors.textoSuave }}>{cuenta.estado}</Text>
            <Text selectable style={{ color: colors.cafe, fontSize: 18, fontWeight: "800" }}>{money(cuenta.total)}</Text>
          </View>
        ))}
        {(cuentas.data ?? []).length === 0 ? <Text selectable style={{ color: colors.textoSuave }}>No hay cuentas pendientes.</Text> : null}
      </Card>
    </Screen>
  );
}
