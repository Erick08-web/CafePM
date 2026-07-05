import { MaterialCommunityIcons } from "@expo/vector-icons";
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
    <Screen title="Mesero" subtitle="Mesas disponibles, ocupadas y menu listo para tomar pedidos." refreshing={loading} onRefresh={() => { void mesas.recargar(); void productos.recargar(); }}>
      <StatusMessage loading={loading} error={mesas.error ?? productos.error} onRetry={() => { void mesas.recargar(); void productos.recargar(); }} />

      <Card tone="coral">
        <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
          <View>
            <Text selectable style={{ color: colors.texto, fontSize: 20, fontWeight: "900" }}>Mesas</Text>
            <Text selectable style={{ color: colors.textoSuave, fontWeight: "600" }}>Vista rapida del salon</Text>
          </View>
          <MaterialCommunityIcons name="table-chair" size={30} color={colors.coral} />
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {(mesas.data ?? []).map((mesa) => {
            const libre = mesa.estado === "libre";
            return (
              <View key={mesa.id_mesa} style={{ backgroundColor: libre ? colors.verdeFondo : colors.superficieMiel, borderColor: libre ? "#bdebd0" : colors.borde, borderRadius: 16, borderWidth: 1, padding: 12, minWidth: 96, gap: 3 }}>
                <Text selectable style={{ color: colors.texto, fontWeight: "900" }}>Mesa {mesa.numero_mesa}</Text>
                <Text selectable style={{ color: libre ? colors.verde : colors.cafe, fontWeight: "800" }}>{mesa.estado}</Text>
              </View>
            );
          })}
        </View>
      </Card>

      <Card>
        <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
          <View>
            <Text selectable style={{ color: colors.texto, fontSize: 20, fontWeight: "900" }}>Menu activo</Text>
            <Text selectable style={{ color: colors.textoSuave, fontWeight: "600" }}>Productos disponibles</Text>
          </View>
          <MaterialCommunityIcons name="coffee-outline" size={30} color={colors.acento} />
        </View>
        {(productos.data ?? []).map((producto) => (
          <View key={producto.id_producto} style={{ borderBottomColor: colors.borde, borderBottomWidth: 1, paddingVertical: 12, gap: 5 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
              <Text selectable style={{ color: colors.texto, flex: 1, fontWeight: "900", fontSize: 16 }}>{producto.nombre}</Text>
              <Text selectable style={{ color: colors.coral, fontWeight: "900", fontVariant: ["tabular-nums"] }}>${producto.precio.toFixed(2)}</Text>
            </View>
            <Text selectable style={{ color: colors.textoSuave, fontWeight: "600" }}>{producto.categoria ?? "Sin categoria"}</Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
}
