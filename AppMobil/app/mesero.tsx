import { Text, View } from "react-native";

import { Card } from "@/components/card";
import { Screen } from "@/components/screen";
import { StatusMessage } from "@/components/status-message";
import { useApi } from "@/hooks/use-api";
import { colors } from "@/theme/colors";
import type { Mesa, Producto } from "@/types";

export default function Mesero() {
  const mesas = useApi<Mesa[]>("/mesero/mesas");
  const productos = useApi<Producto[]>("/mesero/productos");
  const loading = mesas.loading || productos.loading;

  return (
    <Screen title="Mesero" subtitle="Mesas disponibles, ocupadas y menu para levantar pedidos." refreshing={loading} onRefresh={() => { void mesas.recargar(); void productos.recargar(); }}>
      <StatusMessage loading={loading} error={mesas.error ?? productos.error} onRetry={() => { void mesas.recargar(); void productos.recargar(); }} />

      <Card>
        <Text selectable style={{ color: colors.texto, fontSize: 18, fontWeight: "800" }}>Mesas</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {(mesas.data ?? []).map((mesa) => (
            <View key={mesa.id_mesa} style={{ backgroundColor: mesa.estado === "libre" ? colors.verdeFondo : "#f0e1d3", borderRadius: 8, padding: 10, minWidth: 86 }}>
              <Text selectable style={{ color: colors.texto, fontWeight: "800" }}>Mesa {mesa.numero_mesa}</Text>
              <Text selectable style={{ color: mesa.estado === "libre" ? colors.verde : colors.cafe }}>{mesa.estado}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <Text selectable style={{ color: colors.texto, fontSize: 18, fontWeight: "800" }}>Menu activo</Text>
        {(productos.data ?? []).map((producto) => (
          <View key={producto.id_producto} style={{ borderBottomColor: colors.borde, borderBottomWidth: 1, paddingVertical: 10, gap: 3 }}>
            <Text selectable style={{ color: colors.texto, fontWeight: "800" }}>{producto.nombre}</Text>
            <Text selectable style={{ color: colors.textoSuave }}>{producto.categoria ?? "Sin categoria"}</Text>
            <Text selectable style={{ color: colors.cafe, fontWeight: "800" }}>${producto.precio.toFixed(2)}</Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
}
