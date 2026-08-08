import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Alert, Text, View } from "react-native";
import { useMemo, useState } from "react";

import { useRequireAuth } from "@/auth/use-require-auth";
import {
  ActionTile,
  AppButton,
  AppCard,
  AppInput,
  CartBar,
  EmptyState,
  LoadingState,
  MetricCard,
  OrderSummary,
  ProductCard,
  Screen,
  SectionHeader,
  SessionBar,
  StatusBadge,
  StatusMessage,
  TableCard,
  type OrderItem,
} from "@/components";
import { consultarApi, enviarApi } from "@/services/api";
import { useApi } from "@/hooks/use-api";
import { colors, radius, spacing, typography } from "@/theme";
import type { Mesa, PedidoCocina, PedidoCrear, PedidoCreado, Producto } from "@/types";
import { estadoLegible, obtenerSaludo } from "@/utils/dashboard";

type CartState = Record<number, OrderItem>;

function mesaLabel(estado: string) {
  if (estado === "libre") return "Disponible";
  if (estado === "lista") return "Cuenta pendiente";
  if (estado === "ocupada") return "Ocupada";
  return estadoLegible(estado);
}

function pedidoTone(estado: string): "success" | "warning" | "neutral" {
  if (estado === "listo") return "success";
  if (estado === "en_preparacion") return "warning";
  return "neutral";
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function friendlyOrderError(error: unknown) {
  if (error instanceof Error) {
    if (error.message.includes("Producto")) return "Alguno de los productos seleccionados ya no esta disponible.";
    if (error.message.includes("mesa") || error.message.includes("Mesa")) return "La mesa seleccionada no esta disponible para crear pedido.";
    if (error.message.includes("conectar")) return error.message;
    return error.message || "No pudimos enviar el pedido. Intentalo nuevamente.";
  }

  return "No pudimos enviar el pedido. Intentalo nuevamente.";
}

export default function Mesero() {
  const auth = useRequireAuth();
  const mesas = useApi<Mesa[]>("/mesero/mesas");
  const productos = useApi<Producto[]>("/mesero/productos");
  const pedidos = useApi<PedidoCocina[]>("/cocina/pedidos");
  const [mesaSeleccionada, setMesaSeleccionada] = useState<Mesa | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [cart, setCart] = useState<CartState>({});
  const [enviando, setEnviando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  const [errorPedido, setErrorPedido] = useState("");
  const loading = mesas.loading || productos.loading || pedidos.loading;
  const error = mesas.error ?? productos.error ?? pedidos.error;

  const items = useMemo(() => Object.values(cart).filter((item) => item.cantidad > 0), [cart]);
  const cantidadTotal = items.reduce((total, item) => total + item.cantidad, 0);
  const totalEstimado = items.reduce((total, item) => total + Number(item.producto.precio) * item.cantidad, 0);
  const mesasData = mesas.data ?? [];
  const productosData = productos.data ?? [];
  const pedidosData = pedidos.data ?? [];

  const productosFiltrados = useMemo(() => {
    const query = normalize(busqueda);
    if (!query) return productosData;

    return productosData.filter((producto) => {
      const categoria = producto.categoria ?? "";
      return normalize(producto.nombre).includes(query) || normalize(categoria).includes(query);
    });
  }, [busqueda, productosData]);

  const productosPorCategoria = useMemo(() => {
    return productosFiltrados.reduce<Record<string, Producto[]>>((grupos, producto) => {
      const categoria = producto.categoria ?? "Sin categoria";
      grupos[categoria] = [...(grupos[categoria] ?? []), producto];
      return grupos;
    }, {});
  }, [productosFiltrados]);

  if (auth.cargandoSesion || !auth.usuario) {
    return (
      <Screen title="Mesero" subtitle="Preparando tu sesion de trabajo.">
        <LoadingState title={auth.cargandoSesion ? "Recuperando sesion" : "Redirigiendo"} message="Verificando tu acceso a Coffee Code." />
      </Screen>
    );
  }

  const usuario = auth.usuario;
  const disponibles = mesasData.filter((mesa) => mesa.estado === "libre").length;
  const ocupadas = mesasData.filter((mesa) => mesa.estado === "ocupada").length;
  const pendientesCuenta = mesasData.filter((mesa) => mesa.estado === "lista").length;
  const primerNombre = usuario.nombre.split(" ")[0] ?? usuario.nombre;
  const ordenActiva = mesaSeleccionada !== null;

  async function recargarDatos() {
    await Promise.all([mesas.recargar(), productos.recargar(), pedidos.recargar()]);
  }

  function iniciarOrden(mesa: Mesa) {
    setMensajeExito("");
    setErrorPedido("");

    if (mesa.estado !== "libre") {
      Alert.alert("Mesa no disponible", `La mesa ${mesa.numero_mesa} esta en estado "${mesaLabel(mesa.estado)}". Elige una mesa disponible.`);
      return;
    }

    if (items.length > 0 && mesaSeleccionada?.id_mesa !== mesa.id_mesa) {
      Alert.alert("Pedido en curso", "Ya tienes productos seleccionados. Cancela o envia el pedido antes de cambiar de mesa.");
      return;
    }

    setMesaSeleccionada(mesa);
  }

  function cancelarOrden() {
    setMesaSeleccionada(null);
    setCart({});
    setBusqueda("");
    setErrorPedido("");
  }

  function aumentarProducto(producto: Producto) {
    if (producto.activo === false) {
      Alert.alert("Producto no disponible", "Este producto no puede agregarse al pedido.");
      return;
    }

    setErrorPedido("");
    setCart((actual) => {
      const existente = actual[producto.id_producto];
      return {
        ...actual,
        [producto.id_producto]: {
          producto,
          cantidad: (existente?.cantidad ?? 0) + 1,
          observaciones: existente?.observaciones ?? "",
        },
      };
    });
  }

  function disminuirProducto(producto: Producto) {
    setCart((actual) => {
      const existente = actual[producto.id_producto];
      if (!existente) return actual;

      if (existente.cantidad <= 1) {
        const siguiente = { ...actual };
        delete siguiente[producto.id_producto];
        return siguiente;
      }

      return {
        ...actual,
        [producto.id_producto]: {
          ...existente,
          cantidad: existente.cantidad - 1,
        },
      };
    });
  }

  function actualizarObservaciones(producto: Producto, observaciones: string) {
    setCart((actual) => {
      const existente = actual[producto.id_producto];
      if (!existente) return actual;

      return {
        ...actual,
        [producto.id_producto]: {
          ...existente,
          observaciones,
        },
      };
    });
  }

  async function enviarPedido() {
    if (enviando) return;

    if (!mesaSeleccionada) {
      setErrorPedido("Selecciona una mesa disponible antes de enviar el pedido.");
      return;
    }

    if (mesaSeleccionada.estado !== "libre") {
      setErrorPedido("La mesa seleccionada ya no esta disponible para crear pedido.");
      return;
    }

    if (!items.length) {
      setErrorPedido("Agrega al menos un producto antes de enviar a cocina.");
      return;
    }

    const payload: PedidoCrear = {
      id_mesa: mesaSeleccionada.id_mesa,
      id_mesero: usuario.id_usuario,
      productos: items.map((item) => ({
        id_producto: item.producto.id_producto,
        cantidad: item.cantidad,
        observaciones: item.observaciones.trim() || undefined,
      })),
    };

    try {
      setEnviando(true);
      setErrorPedido("");
      const mesasActuales = await consultarApi<Mesa[]>("/mesero/mesas");
      const mesaActual = mesasActuales.find((mesa) => mesa.id_mesa === mesaSeleccionada.id_mesa);

      if (!mesaActual || mesaActual.estado !== "libre") {
        setErrorPedido("La mesa seleccionada ya no esta disponible. Actualiza y elige otra mesa.");
        await recargarDatos();
        return;
      }

      const pedido = await enviarApi<PedidoCreado>("/mesero/pedidos", payload);

      if (!pedido?.id_pedido) {
        throw new Error("Coffee Code no devolvio la confirmacion del pedido.");
      }

      setMensajeExito(`Pedido #${pedido.id_pedido} enviado a cocina.`);
      cancelarOrden();
      await recargarDatos();
    } catch (err) {
      setErrorPedido(friendlyOrderError(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Screen
      title={`${obtenerSaludo()}, ${primerNombre}`}
      subtitle={ordenActiva ? `Nueva orden para mesa ${mesaSeleccionada.numero_mesa}` : "Operacion de salon: mesas, pedidos activos y registro real de ordenes."}
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

      {mensajeExito ? <StatusBadge label={mensajeExito} tone="success" /> : null}
      {errorPedido ? <StatusBadge label={errorPedido} tone="danger" /> : null}

      {!ordenActiva ? (
        <>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
            <MetricCard icon="table-chair" label="Disponibles" value={disponibles} tone={colors.verde} />
            <MetricCard icon="silverware-fork-knife" label="Ocupadas" value={ocupadas} tone={colors.coral} />
            <MetricCard icon="receipt-text-outline" label="Pedidos activos" value={pedidosData.length} tone={colors.azul} />
            <MetricCard icon="cash-clock" label="Cuenta pendiente" value={pendientesCuenta} tone={colors.acento} />
          </View>

          <AppCard>
            <SectionHeader title="Acciones rapidas" subtitle="Selecciona una mesa disponible para iniciar una orden real." icon="gesture-tap" />
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
              <ActionTile icon="plus-circle-outline" onPress={() => Alert.alert("Nueva orden", "Selecciona una mesa disponible para comenzar el pedido.")} title="Nueva orden" description="Elige mesa" />
              <ActionTile icon="table-eye" onPress={() => Alert.alert("Mesas", "Las mesas disponibles aparecen abajo con estado actualizado desde la API.")} title="Mesas" description="Estado real" tone={colors.azul} />
              <ActionTile icon="clipboard-list-outline" onPress={() => Alert.alert("Pedidos", "Los pedidos activos se muestran al final de este modulo.")} title="Pedidos" description="Activos" tone={colors.acento} />
            </View>
          </AppCard>
        </>
      ) : (
        <CartBar count={cantidadTotal} total={totalEstimado} />
      )}

      <AppCard>
        <SectionHeader
          title={ordenActiva ? "Mesa seleccionada" : "Selecciona mesa"}
          subtitle={ordenActiva ? "Puedes cancelar la orden antes de enviarla." : "Solo las mesas disponibles pueden iniciar pedido."}
          icon="table-furniture"
        />

        {mesasData.length ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
            {mesasData.map((mesa) => (
              <TableCard key={mesa.id_mesa} mesa={mesa} selected={mesaSeleccionada?.id_mesa === mesa.id_mesa} onPress={() => iniciarOrden(mesa)} />
            ))}
          </View>
        ) : (
          !loading && <EmptyState title="Sin mesas" message="No hay mesas registradas para mostrar." />
        )}

        {ordenActiva ? <AppButton icon="close-circle-outline" onPress={cancelarOrden} title="Cancelar orden" variant="ghost" /> : null}
      </AppCard>

      {ordenActiva ? (
        <>
          <AppCard>
            <SectionHeader title="Productos" subtitle="Selecciona productos reales del menu activo." icon="coffee-outline" />
            <AppInput
              autoCapitalize="none"
              icon="magnify"
              label="Buscar producto"
              onChangeText={setBusqueda}
              placeholder="Cafe, croissant, chocolate..."
              value={busqueda}
            />

            {Object.keys(productosPorCategoria).length ? (
              <View style={{ gap: spacing.lg }}>
                {Object.entries(productosPorCategoria).map(([categoria, lista]) => (
                  <View key={categoria} style={{ gap: spacing.md }}>
                    <Text selectable style={{ color: colors.cafe, fontSize: typography.caption, fontWeight: "900", textTransform: "uppercase" }}>
                      {categoria}
                    </Text>
                    {lista.map((producto) => (
                      <ProductCard
                        key={producto.id_producto}
                        producto={producto}
                        quantity={cart[producto.id_producto]?.cantidad ?? 0}
                        observaciones={cart[producto.id_producto]?.observaciones ?? ""}
                        onChangeObservaciones={(value) => actualizarObservaciones(producto, value)}
                        onDecrease={() => disminuirProducto(producto)}
                        onIncrease={() => aumentarProducto(producto)}
                      />
                    ))}
                  </View>
                ))}
              </View>
            ) : (
              !loading && <EmptyState title="Sin productos" message="No encontramos productos para tu busqueda." />
            )}
          </AppCard>

          <AppCard tone="honey">
            <SectionHeader title="Resumen del pedido" subtitle="Verifica cantidades, observaciones y total antes de enviar." icon="clipboard-check-outline" />
            {items.length ? (
              <>
                <OrderSummary mesa={mesaSeleccionada} items={items} total={totalEstimado} />
                <View
                  style={{
                    backgroundColor: colors.superficieElevada,
                    borderColor: colors.bordeSuave,
                    borderCurve: "continuous",
                    borderRadius: radius.md,
                    borderWidth: 1,
                    flexDirection: "row",
                    gap: spacing.md,
                    padding: spacing.md,
                  }}
                >
                  <MaterialCommunityIcons name="database-check-outline" size={22} color={colors.verdeOscuro} />
                  <Text selectable style={{ color: colors.textoSuave, flex: 1, fontWeight: "700", lineHeight: 20 }}>
                    El total final lo confirma la API y la base de datos al guardar el pedido.
                  </Text>
                </View>
                <AppButton disabled={enviando} fullWidth icon="send-check-outline" onPress={enviarPedido} title={enviando ? "Enviando..." : "Enviar a cocina"} />
              </>
            ) : (
              <EmptyState title="Carrito vacio" message="Agrega productos para revisar y enviar la orden." />
            )}
          </AppCard>
        </>
      ) : (
        <AppCard tone="honey">
          <SectionHeader title="Pedidos activos" subtitle="Pedidos que Cocina puede ver desde la API." icon="clipboard-text-outline" />

          {pedidosData.length ? (
            <View style={{ gap: spacing.sm }}>
              {pedidosData.slice(0, 4).map((pedido) => (
                <View
                  key={pedido.id_pedido}
                  style={{
                    alignItems: "center",
                    backgroundColor: colors.superficieElevada,
                    borderColor: colors.bordeSuave,
                    borderCurve: "continuous",
                    borderRadius: radius.md,
                    borderWidth: 1,
                    flexDirection: "row",
                    gap: spacing.md,
                    padding: spacing.md,
                  }}
                >
                  <View style={{ flex: 1, gap: spacing.xs }}>
                    <Text selectable style={{ color: colors.texto, fontWeight: "900" }}>
                      Pedido #{pedido.id_pedido} - Mesa {pedido.numero_mesa}
                    </Text>
                    <Text selectable style={{ color: colors.textoSuave, fontWeight: "700" }}>
                      {pedido.detalle.length} producto(s)
                    </Text>
                  </View>
                  <StatusBadge label={estadoLegible(pedido.estado)} tone={pedidoTone(pedido.estado)} />
                </View>
              ))}
            </View>
          ) : (
            !loading && <EmptyState title="Sin pedidos activos" message="No hay pedidos pendientes en este momento." />
          )}
        </AppCard>
      )}
    </Screen>
  );
}
