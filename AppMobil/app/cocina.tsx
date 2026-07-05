import { MaterialCommunityIcons } from "@expo/vector-icons";
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
    <Screen title="Cocina" subtitle="Pedidos pendientes y alertas de inventario para preparar a tiempo." refreshing={loading} onRefresh={() => { void pedidos.recargar(); void inventario.recargar(); }}>
      <StatusMessage loading={loading} error={pedidos.error ?? inventario.error} onRetry={() => { void pedidos.recargar(); void inventario.recargar(); }} />

      <Card tone="honey">
        <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
          <View>
            <Text selectable style={{ color: colors.texto, fontSize: 20, fontWeight: "900" }}>Pedidos pendientes</Text>
            <Text selectable style={{ color: colors.textoSuave, fontWeight: "600" }}>Ordenes listas para preparar</Text>
          </View>
          <MaterialCommunityIcons name="chef-hat" size={30} color={colors.acento} />
        </View>
        {(pedidos.data ?? []).map((pedido) => (
          <View key={pedido.id_pedido} style={{ backgroundColor: colors.superficie, borderColor: colors.borde, borderRadius: 16, borderWidth: 1, padding: 14, gap: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
              <Text selectable style={{ color: colors.texto, flex: 1, fontWeight: "900" }}>Pedido #{pedido.id_pedido} · Mesa {pedido.numero_mesa}</Text>
              <Text selectable style={{ color: colors.coral, fontWeight: "900" }}>${pedido.total.toFixed(2)}</Text>
            </View>
            <Text selectable style={{ color: colors.acento, fontWeight: "900" }}>{pedido.estado}</Text>
            {pedido.detalle.map((item) => (
              <Text selectable key={item.id_detalle} style={{ color: colors.textoSuave, fontWeight: "600" }}>- {item.cantidad} x {item.nombre}{item.observaciones ? ` - ${item.observaciones}` : ""}</Text>
            ))}
          </View>
        ))}
        {(pedidos.data ?? []).length === 0 ? <Text selectable style={{ color: colors.textoSuave, fontWeight: "700" }}>No hay pedidos pendientes.</Text> : null}
      </Card>

      <Card tone="mint">
        <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
          <View>
            <Text selectable style={{ color: colors.texto, fontSize: 20, fontWeight: "900" }}>Inventario bajo</Text>
            <Text selectable style={{ color: colors.textoSuave, fontWeight: "600" }}>Insumos que necesitan atencion</Text>
          </View>
          <MaterialCommunityIcons name="package-variant-closed" size={30} color={colors.menta} />
        </View>
        {(inventario.data ?? []).map((item) => (
          <View key={item.id_insumo} style={{ flexDirection: "row", justifyContent: "space-between", gap: 12, borderBottomColor: colors.borde, borderBottomWidth: 1, paddingVertical: 12 }}>
            <Text selectable style={{ color: colors.texto, fontWeight: "900", flex: 1 }}>{item.nombre}</Text>
            <Text selectable style={{ color: colors.rojo, fontWeight: "900" }}>{item.stock_actual} / {item.stock_minimo} {item.unidad_medida}</Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
}
