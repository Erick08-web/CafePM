import { Text, View } from "react-native";

import { Card } from "@/components/card";
import { Screen } from "@/components/screen";
import { StatusMessage } from "@/components/status-message";
import { useApi } from "@/hooks/use-api";
import { colors } from "@/theme/colors";
import type { Inventario, PedidoCocina } from "@/types";

export default function Cocina() {
  const pedidos = useApi<PedidoCocina[]>("/cocina/pedidos");
  const inventario = useApi<Inventario[]>("/cocina/inventario-bajo");
  const loading = pedidos.loading || inventario.loading;

  return (
    <Screen title="Cocina" subtitle="Pedidos pendientes y alertas de inventario para preparacion." refreshing={loading} onRefresh={() => { void pedidos.recargar(); void inventario.recargar(); }}>
      <StatusMessage loading={loading} error={pedidos.error ?? inventario.error} onRetry={() => { void pedidos.recargar(); void inventario.recargar(); }} />

      <Card>
        <Text selectable style={{ color: colors.texto, fontSize: 18, fontWeight: "800" }}>Pedidos pendientes</Text>
        {(pedidos.data ?? []).map((pedido) => (
          <View key={pedido.id_pedido} style={{ borderBottomColor: colors.borde, borderBottomWidth: 1, paddingVertical: 12, gap: 6 }}>
            <Text selectable style={{ color: colors.texto, fontWeight: "800" }}>Pedido #{pedido.id_pedido} · Mesa {pedido.numero_mesa}</Text>
            <Text selectable style={{ color: colors.cafe }}>{pedido.estado} · ${pedido.total.toFixed(2)}</Text>
            {pedido.detalle.map((item) => (
              <Text selectable key={item.id_detalle} style={{ color: colors.textoSuave }}>• {item.cantidad} x {item.nombre}{item.observaciones ? ` - ${item.observaciones}` : ""}</Text>
            ))}
          </View>
        ))}
        {(pedidos.data ?? []).length === 0 ? <Text selectable style={{ color: colors.textoSuave }}>No hay pedidos pendientes.</Text> : null}
      </Card>

      <Card>
        <Text selectable style={{ color: colors.texto, fontSize: 18, fontWeight: "800" }}>Inventario bajo</Text>
        {(inventario.data ?? []).map((item) => (
          <View key={item.id_insumo} style={{ flexDirection: "row", justifyContent: "space-between", gap: 12, borderBottomColor: colors.borde, borderBottomWidth: 1, paddingVertical: 10 }}>
            <Text selectable style={{ color: colors.texto, fontWeight: "700", flex: 1 }}>{item.nombre}</Text>
            <Text selectable style={{ color: colors.rojo }}>{item.stock_actual} / {item.stock_minimo} {item.unidad_medida}</Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
}
