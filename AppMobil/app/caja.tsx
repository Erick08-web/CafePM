import { useState } from "react";
import { Text, View } from "react-native";

import { useRequireAuth } from "@/auth/use-require-auth";
import {
  AccountCard,
  AppCard,
  EmptyState,
  LoadingState,
  MetricCard,
  PaymentMethodSelector,
  PaymentSuccess,
  PaymentSummary,
  Screen,
  SectionHeader,
  SessionBar,
  StatusBadge,
  StatusMessage,
} from "@/components";
import { useApi } from "@/hooks/use-api";
import { ApiError, consultarApi, enviarApi } from "@/services/api";
import { colors, spacing } from "@/theme";
import type { Cuenta, Mesa, MetodoPago, PagoCreado, PagoCrear, PedidoDetalle, ResumenCaja } from "@/types";
import { estadoLegible, money, obtenerSaludo } from "@/utils/dashboard";

const ESTADOS_COBRABLES = new Set(["listo", "entregado"]);

function friendlyPaymentError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 404) return "El pedido ya no existe. Recarga las cuentas.";
    if (error.status === 409) return error.message || "La cuenta ya no esta disponible para cobro.";
    if (error.status === 400) return error.message || "El pago no cumple las reglas de caja.";
    if (error.status && error.status >= 500) return "Coffee Code no pudo registrar el pago. Intentalo nuevamente.";
    return error.message || "No pudimos registrar el pago. Intentalo nuevamente.";
  }

  return "No pudimos conectar con Coffee Code. Verifica tu conexion e intentalo nuevamente.";
}

export default function Caja() {
  const auth = useRequireAuth();
  const resumen = useApi<ResumenCaja>("/caja/resumen");
  const cuentas = useApi<Cuenta[]>("/caja/cuentas");
  const mesas = useApi<Mesa[]>("/mesero/mesas");
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState<Cuenta | null>(null);
  const [detalle, setDetalle] = useState<PedidoDetalle | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [detalleError, setDetalleError] = useState("");
  const [metodoPago, setMetodoPago] = useState<MetodoPago | null>(null);
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState<PagoCreado | null>(null);
  const loading = resumen.loading || cuentas.loading;
  const error = resumen.error ?? cuentas.error;

  if (auth.cargandoSesion || !auth.usuario) {
    return (
      <Screen title="Caja" subtitle="Preparando tu sesion de trabajo.">
        <LoadingState title={auth.cargandoSesion ? "Recuperando sesion" : "Redirigiendo"} message="Verificando tu acceso a Coffee Code." />
      </Screen>
    );
  }

  const usuario = auth.usuario;
  const cuentasData = cuentas.data ?? [];
  const totalPendiente = cuentasData.reduce((total, cuenta) => total + Number(cuenta.total), 0);
  const primerNombre = usuario.nombre.split(" ")[0] ?? usuario.nombre;
  const detailMode = cuentaSeleccionada !== null;

  async function recargarDatos() {
    await Promise.all([resumen.recargar(), cuentas.recargar(), mesas.recargar()]);
  }

  async function seleccionarCuenta(cuenta: Cuenta) {
    setPaymentSuccess(null);
    setPaymentError("");
    setDetalleError("");
    setMetodoPago(null);

    if (!ESTADOS_COBRABLES.has(cuenta.estado)) {
      setPaymentError("Esta cuenta no esta en un estado cobrable.");
      return;
    }

    try {
      setCuentaSeleccionada(cuenta);
      setDetalle(null);
      setLoadingDetalle(true);
      const pedido = await consultarApi<PedidoDetalle>(`/mesero/pedidos/${cuenta.id_pedido}`);

      if (!pedido?.id_pedido || !Array.isArray(pedido.detalle)) {
        throw new ApiError("Coffee Code no devolvio el detalle de la cuenta.");
      }

      setDetalle(pedido);
    } catch (err) {
      setDetalleError(friendlyPaymentError(err));
    } finally {
      setLoadingDetalle(false);
    }
  }

  function volverACuentas() {
    setCuentaSeleccionada(null);
    setDetalle(null);
    setDetalleError("");
    setMetodoPago(null);
    setPaymentError("");
  }

  async function cobrarCuenta() {
    if (procesandoPago) return;

    if (!cuentaSeleccionada || !detalle) {
      setPaymentError("Selecciona una cuenta antes de cobrar.");
      return;
    }

    if (!ESTADOS_COBRABLES.has(detalle.estado)) {
      setPaymentError("El pedido ya no esta listo para cobro. Recarga las cuentas.");
      return;
    }

    if (!metodoPago) {
      setPaymentError("Selecciona un metodo de pago.");
      return;
    }

    const payload: PagoCrear = {
      id_pedido: detalle.id_pedido,
      metodo_pago: metodoPago,
      monto: Number(detalle.total),
    };

    try {
      setProcesandoPago(true);
      setPaymentError("");
      const pago = await enviarApi<PagoCreado>("/caja/pagos", payload);

      if (!pago?.id_pago || pago.id_pedido !== detalle.id_pedido) {
        throw new ApiError("Coffee Code no confirmo el pago correctamente.");
      }

      setPaymentSuccess(pago);
      volverACuentas();
      await recargarDatos();
    } catch (err) {
      setPaymentError(friendlyPaymentError(err));
      await recargarDatos();
    } finally {
      setProcesandoPago(false);
    }
  }

  return (
    <Screen
      title={`${obtenerSaludo()}, ${primerNombre}`}
      subtitle={detailMode ? `Cobro de pedido #${cuentaSeleccionada.id_pedido}` : "Operacion financiera: cuentas abiertas y cobro real."}
      refreshing={loading}
      onRefresh={() => {
        void recargarDatos();
      }}
    >
      <StatusMessage
        loading={loading}
        error={error}
        onRetry={() => {
          void recargarDatos();
        }}
      />

      <SessionBar />

      {paymentSuccess ? <PaymentSuccess pago={paymentSuccess} /> : null}
      {paymentError ? <StatusBadge label={paymentError} tone="danger" /> : null}

      {!detailMode ? (
        <>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
            <MetricCard icon="trending-up" label="Ingresos" value={money(resumen.data?.ingresos)} tone={colors.verde} />
            <MetricCard icon="cash-clock" label="Pendiente" value={money(totalPendiente)} helper={`${cuentasData.length} cuenta(s)`} tone={colors.acento} />
            <MetricCard icon="receipt-text-outline" label="Gastos" value={money(resumen.data?.gastos)} tone={colors.coral} />
            <MetricCard icon="cash-multiple" label="Ganancia" value={money(resumen.data?.ganancia_estimada)} tone={colors.azul} />
          </View>

          <AppCard>
            <SectionHeader title="Cuentas pendientes" subtitle="Selecciona una cuenta real para ver detalle y cobrar." icon="clipboard-text-clock-outline" />

            {cuentasData.length ? (
              <View style={{ gap: spacing.sm }}>
                {cuentasData.map((cuenta) => (
                  <AccountCard
                    cuenta={cuenta}
                    key={cuenta.id_pedido}
                    onPress={() => {
                      void seleccionarCuenta(cuenta);
                    }}
                  />
                ))}
              </View>
            ) : (
              !loading && <EmptyState title="Sin cuentas pendientes" message="No hay pedidos listos o entregados para cobrar." />
            )}
          </AppCard>

          <AppCard tone="honey">
            <SectionHeader title="Resumen del turno" subtitle="Datos reales del resumen financiero." icon="chart-donut" />
            <View style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.md }}>
                <Text selectable style={{ color: colors.textoSuave, fontWeight: "800" }}>
                  Compras registradas
                </Text>
                <Text selectable style={{ color: colors.texto, fontWeight: "900", fontVariant: ["tabular-nums"] }}>
                  {money(resumen.data?.compras)}
                </Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.md }}>
                <Text selectable style={{ color: colors.textoSuave, fontWeight: "800" }}>
                  Balance estimado
                </Text>
                <Text selectable style={{ color: colors.verdeOscuro, fontWeight: "900", fontVariant: ["tabular-nums"] }}>
                  {money(resumen.data?.ganancia_estimada)}
                </Text>
              </View>
            </View>
          </AppCard>
        </>
      ) : (
        <>
          <AppCard>
            <SectionHeader title={`Pedido #${cuentaSeleccionada.id_pedido}`} subtitle={`Mesa ${cuentaSeleccionada.numero_mesa} - ${estadoLegible(cuentaSeleccionada.estado)}`} icon="receipt-text-outline" />

            {loadingDetalle ? <LoadingState title="Cargando cuenta" message="Consultando detalle real del pedido." /> : null}
            {detalleError ? <StatusBadge label={detalleError} tone="danger" /> : null}

            {detalle ? (
              <View style={{ gap: spacing.lg }}>
                <PaymentMethodSelector onChange={setMetodoPago} value={metodoPago} />
                <PaymentSummary
                  cuenta={cuentaSeleccionada}
                  detalle={detalle}
                  metodo={metodoPago}
                  onCancel={volverACuentas}
                  onPay={cobrarCuenta}
                  processing={procesandoPago}
                />
              </View>
            ) : (
              !loadingDetalle && !detalleError && <EmptyState title="Sin detalle" message="No hay informacion suficiente para cobrar esta cuenta." />
            )}
          </AppCard>
        </>
      )}
    </Screen>
  );
}
