import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { Card } from "@/components/card";
import { ModuleLink } from "@/components/module-link";
import { Screen } from "@/components/screen";
import { obtenerApiBaseUrl } from "@/services/api";
import { colors } from "@/theme/colors";

export default function Inicio() {
  return (
    <Screen title="Operacion movil" subtitle="Mesero, cocina y caja conectados para mover la cafeteria desde el telefono.">
      <Card tone="mint">
        <View style={{ alignItems: "center", flexDirection: "row", gap: 12 }}>
          <View style={{ alignItems: "center", backgroundColor: colors.menta, borderRadius: 15, height: 46, justifyContent: "center", width: 46 }}>
            <MaterialCommunityIcons name="check-network" size={26} color="#fffdf8" />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text selectable style={{ color: colors.texto, fontSize: 18, fontWeight: "900" }}>API configurada</Text>
            <Text selectable style={{ color: colors.textoSuave, fontWeight: "600" }}>{obtenerApiBaseUrl()}</Text>
          </View>
        </View>
      </Card>

      <View style={{ gap: 14 }}>
        <ModuleLink
          href="/mesero"
          title="Mesero"
          description="Mesas, menu activo y seguimiento rapido para levantar comandas."
          label="Abrir modulo"
          icon="room-service-outline"
          accent={colors.coral}
          background={colors.superficieCoral}
        />
        <ModuleLink
          href="/cocina"
          title="Cocina"
          description="Pedidos pendientes e inventario bajo para preparar sin perder ritmo."
          label="Abrir modulo"
          icon="chef-hat"
          accent={colors.acento}
          background={colors.superficieMiel}
        />
        <ModuleLink
          href="/caja"
          title="Caja"
          description="Cuentas, ingresos y resumen monetario para cerrar ventas con claridad."
          label="Abrir modulo"
          icon="cash-register"
          accent={colors.menta}
          background={colors.superficieMenta}
        />
      </View>
    </Screen>
  );
}
