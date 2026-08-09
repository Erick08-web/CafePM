import { Link, type Href } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { useRequireAuth } from "@/auth/use-require-auth";
import {
  AccountCard,
  AppButton,
  AppCard,
  EmptyState,
  LoadingState,
  MetricCard,
  PaymentMethodSelector,
  PaymentSuccess,
  PaymentSummary,
  Screen,
  SectionHeader,
  StatusBadge,
  StatusMessage,
} from "@/components";
import { cajaNav, RoleTabBar } from "@/features/role-navigation";
import { useApi } from "@/hooks/use-api";
import { ApiError, consultarApi, enviarApi } from "@/services/api";
import { colors, spacing } from "@/theme";
import type { Cuenta, Mesa, MetodoPago, PagoCreado, PagoCrear, PedidoDetalle, ResumenCaja } from "@/types";
import { estadoLegible, money, obtenerSaludo } from "@/utils/dashboard";

const ESTADOS_COBRABLES = new Set(["listo", "entregado"]);

function friendlyPaymentError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 404) return "El pedido ya no existe.";
    if (error.status === 409) return error.message || "La cuenta ya no esta disponible.";
    if (error.status === 400) return error.message || "El pago no cumple las reglas de caja.";
    if (error.status && error.status >= 500) return "Coffee Code no pudo registrar el pago.";
    return error.message || "No pudimos registrar el pago.";
  }

  return "No pudimos conectar con Coffee Code.";
}

function CajaLoading({ title }: { title: string }) {
  return (
    <Screen title={title} subtitle="Validando tu acceso.">
      <LoadingState title="Recuperando sesion" message="Un momento." />
    </Screen>
  );
}

function useCajaData() {
  const resumen = useApi<ResumenCaja>("/caja/resumen");
  const cuentas = useApi<Cuenta[]>("/caja/cuentas");
  const mesas = useApi<Mesa[]>("/mesero/mesas");
  return { resumen, cuentas, mesas };
}

export function CajaHome() {
  const auth = useRequireAuth();
  const { resumen, cuentas, mesas } = useCajaData();
  const loading = resumen.loading || cuentas.loading || mesas.loading;
  const error = resumen.error ?? cuentas.error ?? mesas.error;
  const cuentasData = cuentas.data ?? [];
  const totalPendiente = cuentasData.reduce((total, cuenta) => total + Number(cuenta.total), 0);
  const cuentasAbiertas = (mesas.data ?? []).filter((mesa) => mesa.estado === "ocupada" || mesa.estado === "lista").length;

  if (auth.cargandoSesion || !auth.usuario) return <CajaLoading title="Caja" />;

  const primerNombre = auth.usuario.nombre.split(" ")[0] ?? auth.usuario.nombre;

  async function recargarDatos() {
    await Promise.all([resumen.recargar(), cuentas.recargar(), mesas.recargar()]);
  }

  return (
    <Screen title={`${obtenerSaludo()}, ${primerNombre}`} subtitle="Turno de caja" refreshing={loading} onRefresh={() => void recargarDatos()}>
      <RoleTabBar items={cajaNav} />
      <StatusMessage loading={loading} error={error} onRetry={() => void recargarDatos()} />

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
        <MetricCard icon="trending-up" label="Ventas" value={money(resumen.data?.ingresos)} tone={colors.verde} />
        <MetricCard icon="cash-clock" label="Por cobrar" value={money(totalPendiente)} helper={`${cuentasData.length} cuenta(s)`} tone={colors.acento} />
        <MetricCard icon="receipt-text-outline" label="Abiertas" value={cuentasAbiertas} tone={colors.azul} />
        <MetricCard icon="cash-multiple" label="Balance" value={money(resumen.data?.ganancia_estimada)} tone={colors.coral} />
      </View>

      <View style={{ flexDirection: "row", gap: spacing.sm }}>
        <Link href={"/caja/cuentas" as Href} asChild>
          <AppButton icon="receipt-text-outline" title="Cuentas" variant="secondary" />
        </Link>
        <Link href={"/caja/resumen" as Href} asChild>
          <AppButton fullWidth icon="chart-donut" title="Resumen" />
        </Link>
      </View>
    </Screen>
  );
}

export function CajaCuentas() {
  const auth = useRequireAuth();
  const { resumen, cuentas, mesas } = useCajaData();
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

  if (auth.cargandoSesion || !auth.usuario) return <CajaLoading title="Cuentas" />;

  async function recargarDatos() {
    await Promise.all([resumen.recargar(), cuentas.recargar(), mesas.recargar()]);
  }

  async function seleccionarCuenta(cuenta: Cuenta) {
    setPaymentSuccess(null);
    setPaymentError("");
    setDetalleError("");
    setMetodoPago(null);
    if (!ESTADOS_COBRABLES.has(cuenta.estado)) {
      setPaymentError("Esta cuenta no esta lista para cobro.");
      return;
    }

    try {
      setCuentaSeleccionada(cuenta);
      setDetalle(null);
      setLoadingDetalle(true);
      const pedido = await consultarApi<PedidoDetalle>(`/mesero/pedidos/${cuenta.id_pedido}`);
      if (!pedido?.id_pedido || !Array.isArray(pedido.detalle)) throw new ApiError("Coffee Code no devolvio el detalle de la cuenta.");
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
      setPaymentError("Selecciona una cuenta.");
      return;
    }
    if (!ESTADOS_COBRABLES.has(detalle.estado)) {
      setPaymentError("El pedido ya no esta listo para cobro.");
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
      if (!pago?.id_pago || pago.id_pedido !== detalle.id_pedido) throw new ApiError("Coffee Code no confirmo el pago.");
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
      title={cuentaSeleccionada ? `Pedido #${cuentaSeleccionada.id_pedido}` : "Cuentas"}
      subtitle={cuentaSeleccionada ? `Mesa ${cuentaSeleccionada.numero_mesa} - ${estadoLegible(cuentaSeleccionada.estado)}` : "Cuentas por cobrar"}
      refreshing={loading}
      onRefresh={() => void recargarDatos()}
    >
      <RoleTabBar items={cajaNav} />
      <StatusMessage loading={loading} error={error} onRetry={() => void recargarDatos()} />
      {paymentSuccess ? <PaymentSuccess pago={paymentSuccess} /> : null}
      {paymentError ? <StatusBadge label={paymentError} tone="danger" /> : null}

      {!cuentaSeleccionada ? (
        <AppCard>
          <SectionHeader title="Cuentas pendientes" icon="clipboard-text-clock-outline" />
          {(cuentas.data ?? []).length ? (
            <View style={{ gap: spacing.sm }}>
              {(cuentas.data ?? []).map((cuenta) => (
                <AccountCard key={cuenta.id_pedido} cuenta={cuenta} onPress={() => void seleccionarCuenta(cuenta)} />
              ))}
            </View>
          ) : (
            !loading && <EmptyState title="Sin cuentas pendientes" message="No hay pedidos listos para cobrar." />
          )}
        </AppCard>
      ) : (
        <AppCard>
          <SectionHeader title="Detalle de cuenta" icon="receipt-text-outline" />
          {loadingDetalle ? <LoadingState title="Cargando cuenta" message="Consultando detalle." /> : null}
          {detalleError ? <StatusBadge label={detalleError} tone="danger" /> : null}
          {detalle ? (
            <View style={{ gap: spacing.lg }}>
              <PaymentMethodSelector onChange={setMetodoPago} value={metodoPago} />
              <PaymentSummary cuenta={cuentaSeleccionada} detalle={detalle} metodo={metodoPago} onCancel={volverACuentas} onPay={cobrarCuenta} processing={procesandoPago} />
            </View>
          ) : (
            !loadingDetalle && !detalleError && <EmptyState title="Sin detalle" message="No hay informacion suficiente para cobrar esta cuenta." />
          )}
        </AppCard>
      )}
    </Screen>
  );
}

export function CajaResumen() {
  const auth = useRequireAuth();
  const resumen = useApi<ResumenCaja>("/caja/resumen");

  if (auth.cargandoSesion || !auth.usuario) return <CajaLoading title="Resumen" />;

  return (
    <Screen title="Resumen" subtitle="Balance del turno" refreshing={resumen.loading} onRefresh={() => void resumen.recargar()}>
      <RoleTabBar items={cajaNav} />
      <StatusMessage loading={resumen.loading} error={resumen.error} onRetry={() => void resumen.recargar()} />

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
        <MetricCard icon="trending-up" label="Ingresos" value={money(resumen.data?.ingresos)} tone={colors.verde} />
        <MetricCard icon="receipt-text-outline" label="Gastos" value={money(resumen.data?.gastos)} tone={colors.coral} />
        <MetricCard icon="cart-outline" label="Compras" value={money(resumen.data?.compras)} tone={colors.acento} />
        <MetricCard icon="cash-multiple" label="Balance" value={money(resumen.data?.ganancia_estimada)} tone={colors.azul} />
      </View>
    </Screen>
  );
}

export function CajaHistorial() {
  const auth = useRequireAuth();

  if (auth.cargandoSesion || !auth.usuario) return <CajaLoading title="Historial" />;

  return (
    <Screen title="Historial" subtitle="Pagos cerrados">
      <RoleTabBar items={cajaNav} />
      <AppCard>
        <SectionHeader title="Historial de pagos" icon="history" />
        <EmptyState title="Sin historial disponible" message="Los pagos cerrados se consultan desde reportes administrativos." />
      </AppCard>
    </Screen>
  );
}
