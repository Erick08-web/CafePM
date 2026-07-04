import { Text, View } from "react-native";

import { Card } from "@/components/card";
import { ModuleLink } from "@/components/module-link";
import { Screen } from "@/components/screen";
import { obtenerApiBaseUrl } from "@/services/api";
import { colors } from "@/theme/colors";

export default function Inicio() {
  return (
    <Screen title="Operacion movil" subtitle="Interfaces principales para Mesero, Cocina y Caja conectadas a la API del proyecto.">
      <Card>
        <Text selectable style={{ color: colors.texto, fontSize: 18, fontWeight: "800" }}>API configurada</Text>
        <Text selectable style={{ color: colors.textoSuave }}>{obtenerApiBaseUrl()}</Text>
      </Card>

      <View style={{ gap: 12 }}>
        <ModuleLink
          href="/mesero"
          title="Mesero"
          description="Consulta mesas, productos y el estado de pedidos para levantar comandas."
          label="Abrir modulo"
        />
        <ModuleLink
          href="/cocina"
          title="Cocina"
          description="Revisa pedidos pendientes e inventario bajo para preparar ordenes."
          label="Abrir modulo"
        />
        <ModuleLink
          href="/caja"
          title="Caja"
          description="Visualiza cuentas, ingresos, gastos, compras y resumen monetario."
          label="Abrir modulo"
        />
      </View>
    </Screen>
  );
}
