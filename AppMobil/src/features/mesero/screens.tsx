import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Text, View } from "react-native";

import { useRequireAuth } from "@/auth/use-require-auth";
import {
  AppButton,
  AppCard,
  AppInput,
  EmptyState,
  FloatingCartBar,
  LoadingState,
  MenuCategoryFilter,
  MetricCard,
  OrderSummary,
  ProductCard,
  Screen,
  SectionHeader,
  StatusBadge,
  StatusMessage,
  TableCard,
  type OrderItem,
} from "@/components";
import { meseroNav, RoleTabBar } from "@/features/role-navigation";
import { useApi } from "@/hooks/use-api";
import { consultarApi, enviarApi } from "@/services/api";
import { colors, radius, spacing, typography } from "@/theme";
import type { Mesa, PedidoCocina, PedidoCrear, PedidoCreado, Producto } from "@/types";
import type { GrupoModificador, OpcionModificador, PersonalizacionSeleccionada, PersonalizacionesProducto } from "@/types";
import { estadoLegible, money, obtenerSaludo } from "@/utils/dashboard";

type CartState = Record<string, OrderItem>;
type PedidoFiltro = "activos" | "listos" | "pagados";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function pedidoTone(estado: string): "success" | "warning" | "neutral" {
  if (estado === "listo") return "success";
  if (estado === "en_preparacion") return "warning";
  return "neutral";
}

function friendlyOrderError(error: unknown) {
  if (error instanceof Error) {
    if (error.message.includes("Producto")) return "Alguno de los productos seleccionados ya no esta disponible.";
    if (error.message.includes("mesa") || error.message.includes("Mesa")) return "La mesa seleccionada no esta disponible.";
    if (error.message.includes("conectar")) return error.message;
    return error.message || "No pudimos enviar el pedido. Intentalo nuevamente.";
  }

  return "No pudimos enviar el pedido. Intentalo nuevamente.";
}

function AuthLoading({ title }: { title: string }) {
  return (
    <Screen title={title} subtitle="Validando tu acceso.">
      <LoadingState title="Recuperando sesion" message="Un momento." />
    </Screen>
  );
}

function PedidoRow({ pedido }: { pedido: PedidoCocina }) {
  return (
    <View
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
          {pedido.detalle.length} producto(s) - {money(Number(pedido.total))}
        </Text>
      </View>
      <StatusBadge label={estadoLegible(pedido.estado)} tone={pedidoTone(pedido.estado)} />
    </View>
  );
}

export function MeseroHome() {
  const auth = useRequireAuth();
  const mesas = useApi<Mesa[]>("/mesero/mesas");
  const pedidos = useApi<PedidoCocina[]>("/cocina/pedidos");
  const loading = mesas.loading || pedidos.loading;
  const error = mesas.error ?? pedidos.error;
  const mesasData = mesas.data ?? [];
  const pedidosData = pedidos.data ?? [];
  const disponibles = mesasData.filter((mesa) => mesa.estado === "libre").length;
  const ocupadas = mesasData.filter((mesa) => mesa.estado === "ocupada").length;
  const listas = mesasData.filter((mesa) => mesa.estado === "lista").length;

  if (auth.cargandoSesion || !auth.usuario) return <AuthLoading title="Mesero" />;

  const primerNombre = auth.usuario.nombre.split(" ")[0] ?? auth.usuario.nombre;

  async function recargarDatos() {
    await Promise.all([mesas.recargar(), pedidos.recargar()]);
  }

  return (
    <Screen
      title={`${obtenerSaludo()}, ${primerNombre}`}
      subtitle="Turno de salon"
      refreshing={loading}
      onRefresh={() => {
        void recargarDatos();
      }}
    >
      <RoleTabBar items={meseroNav} />
      <StatusMessage loading={loading} error={error} onRetry={() => void recargarDatos()} />

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
        <MetricCard icon="table-chair" label="Libres" value={disponibles} tone={colors.verde} />
        <MetricCard icon="silverware-fork-knife" label="Ocupadas" value={ocupadas} tone={colors.coral} />
        <MetricCard icon="receipt-text-outline" label="Activos" value={pedidosData.length} tone={colors.azul} />
        <MetricCard icon="cash-clock" label="Por cobrar" value={listas} tone={colors.acento} />
      </View>

      <View style={{ flexDirection: "row", gap: spacing.sm }}>
        <Link href={"/mesero/mesas" as Href} asChild>
          <AppButton icon="table-eye" title="Ver mesas" variant="secondary" />
        </Link>
        <Link href={"/mesero/nueva-orden" as Href} asChild>
          <AppButton fullWidth icon="plus-circle-outline" title="Nueva orden" />
        </Link>
      </View>

      <AppCard>
        <SectionHeader title="Actividad reciente" icon="clipboard-list-outline" />
        {pedidosData.length ? (
          <View style={{ gap: spacing.sm }}>
            {pedidosData.slice(0, 3).map((pedido) => (
              <PedidoRow key={pedido.id_pedido} pedido={pedido} />
            ))}
          </View>
        ) : (
          !loading && <EmptyState title="Sin pedidos activos" message="No hay pedidos pendientes." />
        )}
      </AppCard>
    </Screen>
  );
}

export function MeseroMesas() {
  const auth = useRequireAuth();
  const router = useRouter();
  const mesas = useApi<Mesa[]>("/mesero/mesas");
  const pedidos = useApi<PedidoCocina[]>("/cocina/pedidos");
  const loading = mesas.loading || pedidos.loading;
  const error = mesas.error ?? pedidos.error;
  const pedidosPorMesa = new Map((pedidos.data ?? []).filter((pedido) => pedido.id_mesa).map((pedido) => [pedido.id_mesa, pedido]));

  if (auth.cargandoSesion || !auth.usuario) return <AuthLoading title="Mesas" />;

  async function recargarDatos() {
    await Promise.all([mesas.recargar(), pedidos.recargar()]);
  }

  return (
    <Screen title="Mesas" subtitle="Estado del salon" refreshing={loading} onRefresh={() => void recargarDatos()}>
      <RoleTabBar items={meseroNav} />
      <StatusMessage loading={loading} error={error} onRetry={() => void recargarDatos()} />

      <AppCard>
        <SectionHeader title="Mesas" icon="table-furniture" />
        {(mesas.data ?? []).length ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
            {(mesas.data ?? []).map((mesa) => {
              const pedido = pedidosPorMesa.get(mesa.id_mesa);
              return (
                <View key={mesa.id_mesa} style={{ flexBasis: "30%", flexGrow: 1, minWidth: 96, gap: spacing.xs }}>
                  <TableCard
                    mesa={mesa}
                    onPress={() => {
                      if (mesa.estado === "libre") {
                        router.push({ pathname: "/mesero/nueva-orden", params: { id_mesa: String(mesa.id_mesa) } } as unknown as Href);
                        return;
                      }
                      router.push("/mesero/pedidos" as Href);
                    }}
                  />
                  {pedido ? (
                    <Text selectable style={{ color: colors.textoSuave, fontSize: typography.caption, fontWeight: "800", textAlign: "center" }}>
                      Pedido #{pedido.id_pedido}
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        ) : (
          !loading && <EmptyState title="Sin mesas" message="No hay mesas registradas." />
        )}
      </AppCard>
    </Screen>
  );
}

export function MeseroNuevaOrden() {
  const auth = useRequireAuth();
  const params = useLocalSearchParams<{ id_mesa?: string }>();
  const mesas = useApi<Mesa[]>("/mesero/mesas");
  const productos = useApi<Producto[]>("/mesero/productos");
  const [mesaSeleccionada, setMesaSeleccionada] = useState<Mesa | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todos");
  const [cart, setCart] = useState<CartState>({});
  const [mostrarResumen, setMostrarResumen] = useState(false);
  const [personalizacion, setPersonalizacion] = useState<PersonalizacionesProducto | null>(null);
  const [seleccionModificadores, setSeleccionModificadores] = useState<Record<number, number[]>>({});
  const [notaPersonalizacion, setNotaPersonalizacion] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  const [errorPedido, setErrorPedido] = useState("");
  const loading = mesas.loading || productos.loading;
  const error = mesas.error ?? productos.error;
  const items = useMemo(() => Object.values(cart).filter((item) => item.cantidad > 0), [cart]);
  const cantidadTotal = items.reduce((total, item) => total + item.cantidad, 0);
  const totalEstimado = items.reduce((total, item) => total + Number(item.precioUnitario) * item.cantidad, 0);
  const mesasData = mesas.data ?? [];
  const productosData = productos.data ?? [];
  const cantidadesPorProducto = useMemo(() => {
    return items.reduce<Record<number, number>>((totales, item) => {
      totales[item.producto.id_producto] = (totales[item.producto.id_producto] ?? 0) + item.cantidad;
      return totales;
    }, {});
  }, [items]);

  const categoriasMenu = useMemo(() => {
    const preferred = ["Cafes calientes", "Espresso", "Cafes frios", "Chocolate y te", "Bebidas mezcladas", "Panaderia", "Postres", "Alimentos"];
    const actuales = Array.from(new Set(productosData.map((producto) => producto.categoria).filter(Boolean))) as string[];
    return actuales.sort((a, b) => {
      const indexA = preferred.indexOf(a);
      const indexB = preferred.indexOf(b);
      if (indexA !== -1 || indexB !== -1) return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
      return a.localeCompare(b);
    });
  }, [productosData]);

  const productosFiltrados = useMemo(() => {
    const query = normalize(busqueda);
    return productosData.filter((producto) => {
      const matchesCategory = categoriaSeleccionada === "Todos" || producto.categoria === categoriaSeleccionada;
      const searchable = `${producto.nombre} ${producto.categoria ?? ""} ${producto.descripcion ?? ""}`;
      const matchesQuery = !query || normalize(searchable).includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [busqueda, categoriaSeleccionada, productosData]);

  const productosPorCategoria = useMemo(() => {
    return productosFiltrados.reduce<Record<string, Producto[]>>((grupos, producto) => {
      const categoria = producto.categoria ?? "Sin categoria";
      grupos[categoria] = [...(grupos[categoria] ?? []), producto];
      return grupos;
    }, {});
  }, [productosFiltrados]);

  useEffect(() => {
    if (mesaSeleccionada || !params.id_mesa) return;
    const idMesa = Number(params.id_mesa);
    const mesa = mesasData.find((item) => item.id_mesa === idMesa);
    if (mesa?.estado === "libre") setMesaSeleccionada(mesa);
  }, [mesaSeleccionada, mesasData, params.id_mesa]);

  if (auth.cargandoSesion || !auth.usuario) return <AuthLoading title="Nueva orden" />;

  const usuario = auth.usuario;

  async function recargarDatos() {
    await Promise.all([mesas.recargar(), productos.recargar()]);
  }

  function iniciarOrden(mesa: Mesa) {
    setMensajeExito("");
    setErrorPedido("");
    if (mesa.estado !== "libre") {
      Alert.alert("Mesa no disponible", `La mesa ${mesa.numero_mesa} no esta disponible.`);
      return;
    }
    if (items.length > 0 && mesaSeleccionada?.id_mesa !== mesa.id_mesa) {
      Alert.alert("Pedido en curso", "Termina o cancela el pedido antes de cambiar de mesa.");
      return;
    }
    setMesaSeleccionada(mesa);
  }

  function cancelarOrden() {
    setMesaSeleccionada(null);
    setCart({});
    setBusqueda("");
    setCategoriaSeleccionada("Todos");
    setMostrarResumen(false);
    cerrarPersonalizacion();
    setErrorPedido("");
  }

  function defaultSelections(grupos: GrupoModificador[]) {
    return grupos.reduce<Record<number, number[]>>((selecciones, grupo) => {
      const defaults = grupo.opciones.filter((opcion) => opcion.es_default).map((opcion) => opcion.id_opcion);
      selecciones[grupo.id_grupo] = defaults.length ? defaults : grupo.obligatorio && grupo.opciones[0] ? [grupo.opciones[0].id_opcion] : [];
      return selecciones;
    }, {});
  }

  async function abrirPersonalizacion(producto: Producto) {
    if (producto.activo === false) {
      Alert.alert("Producto no disponible", "Este producto no puede agregarse al pedido.");
      return;
    }
    try {
      const config = await consultarApi<PersonalizacionesProducto>(`/mesero/productos/${producto.id_producto}/personalizaciones`);
      setPersonalizacion(config);
      setSeleccionModificadores(defaultSelections(config.grupos));
      setNotaPersonalizacion("");
      setMostrarResumen(false);
    } catch (err) {
      setErrorPedido(err instanceof Error ? err.message : "No pudimos abrir la personalizacion.");
    }
  }

  function cerrarPersonalizacion() {
    setPersonalizacion(null);
    setSeleccionModificadores({});
    setNotaPersonalizacion("");
  }

  function opcionesSeleccionadas(config: PersonalizacionesProducto) {
    const opciones: Array<OpcionModificador & { grupo: GrupoModificador }> = [];
    for (const grupo of config.grupos) {
      const ids = seleccionModificadores[grupo.id_grupo] ?? [];
      for (const id of ids) {
        const opcion = grupo.opciones.find((item) => item.id_opcion === id);
        if (opcion) opciones.push({ ...opcion, grupo });
      }
    }
    return opciones;
  }

  function totalPersonalizacion(config: PersonalizacionesProducto) {
    return Number(config.producto.precio) + opcionesSeleccionadas(config).reduce((total, opcion) => total + Number(opcion.precio_adicional), 0);
  }

  function toggleOpcion(grupo: GrupoModificador, opcion: OpcionModificador) {
    setSeleccionModificadores((actual) => {
      const seleccionActual = actual[grupo.id_grupo] ?? [];
      if (grupo.tipo_seleccion === "single") {
        return { ...actual, [grupo.id_grupo]: [opcion.id_opcion] };
      }
      const existe = seleccionActual.includes(opcion.id_opcion);
      return { ...actual, [grupo.id_grupo]: existe ? seleccionActual.filter((id) => id !== opcion.id_opcion) : [...seleccionActual, opcion.id_opcion] };
    });
  }

  function agregarPersonalizado() {
    if (!personalizacion) return;
    for (const grupo of personalizacion.grupos) {
      if (grupo.obligatorio && !(seleccionModificadores[grupo.id_grupo] ?? []).length) {
        setErrorPedido(`${grupo.nombre} requerido.`);
        return;
      }
    }

    const opciones = opcionesSeleccionadas(personalizacion);
    const personalizaciones: PersonalizacionSeleccionada[] = opciones.map((opcion) => ({
      id_opcion: opcion.id_opcion,
      nombre_grupo: opcion.grupo.nombre,
      nombre_opcion: opcion.nombre,
      precio_adicional: Number(opcion.precio_adicional),
    }));
    const cartKey = `${personalizacion.producto.id_producto}-${opciones.map((opcion) => opcion.id_opcion).sort((a, b) => a - b).join(".")}-${Date.now()}`;
    setErrorPedido("");
    setErrorPedido("");
    setMostrarResumen(false);
    setCart((actual) => {
      return {
        ...actual,
        [cartKey]: {
          cartKey,
          producto: personalizacion.producto,
          cantidad: 1,
          precioUnitario: totalPersonalizacion(personalizacion),
          modificadores: opciones.map((opcion) => opcion.id_opcion),
          personalizaciones,
          observaciones: notaPersonalizacion,
        },
      };
    });
    cerrarPersonalizacion();
  }

  function disminuirProducto(producto: Producto) {
    setCart((actual) => {
      const key = Object.keys(actual).find((cartKey) => actual[cartKey].producto.id_producto === producto.id_producto);
      if (!key) return actual;
      const existente = actual[key];
      const siguiente = { ...actual };
      if (existente.cantidad <= 1) delete siguiente[key];
      else siguiente[key] = { ...existente, cantidad: existente.cantidad - 1 };
      return siguiente;
    });
  }

  function actualizarObservaciones(producto: Producto, observaciones: string) {
    setCart((actual) => {
      const existente = actual[producto.id_producto];
      if (!existente) return actual;
      return { ...actual, [producto.id_producto]: { ...existente, observaciones } };
    });
  }

  async function enviarPedido() {
    if (enviando) return;
    if (!mesaSeleccionada) {
      setErrorPedido("Selecciona una mesa disponible.");
      return;
    }
    if (!items.length) {
      setErrorPedido("Agrega al menos un producto.");
      return;
    }

    const payload: PedidoCrear = {
      id_mesa: mesaSeleccionada.id_mesa,
      id_mesero: usuario.id_usuario,
      productos: items.map((item) => ({
        id_producto: item.producto.id_producto,
        cantidad: item.cantidad,
        observaciones: item.observaciones.trim() || undefined,
        modificadores: item.modificadores,
      })),
    };

    try {
      setEnviando(true);
      setErrorPedido("");
      const mesasActuales = await consultarApi<Mesa[]>("/mesero/mesas");
      const mesaActual = mesasActuales.find((mesa) => mesa.id_mesa === mesaSeleccionada.id_mesa);
      if (!mesaActual || mesaActual.estado !== "libre") {
        setErrorPedido("La mesa seleccionada ya no esta disponible.");
        await recargarDatos();
        return;
      }
      const pedido = await enviarApi<PedidoCreado>("/mesero/pedidos", payload);
      if (!pedido?.id_pedido) throw new Error("Coffee Code no confirmo el pedido.");
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
      title="Nueva orden"
      subtitle={mesaSeleccionada ? `Mesa ${mesaSeleccionada.numero_mesa}` : "Selecciona una mesa"}
      refreshing={loading}
      onRefresh={() => void recargarDatos()}
      footer={
        mesaSeleccionada && items.length ? (
          <FloatingCartBar
            count={cantidadTotal}
            total={totalEstimado}
            onViewOrder={() => {
              setMostrarResumen((actual) => !actual);
            }}
          />
        ) : undefined
      }
    >
      <RoleTabBar items={meseroNav} />
      <StatusMessage loading={loading} error={error} onRetry={() => void recargarDatos()} />
      {mensajeExito ? <StatusBadge label={mensajeExito} tone="success" /> : null}
      {errorPedido ? <StatusBadge label={errorPedido} tone="danger" /> : null}

      <AppCard>
        <SectionHeader title={mesaSeleccionada ? "Mesa seleccionada" : "Mesa"} icon="table-furniture" />
        {mesaSeleccionada ? (
          <View style={{ gap: spacing.md }}>
            <TableCard mesa={mesaSeleccionada} selected onPress={() => undefined} />
            <AppButton icon="close-circle-outline" onPress={cancelarOrden} title="Cambiar mesa" variant="ghost" />
          </View>
        ) : (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
            {mesasData.map((mesa) => (
              <TableCard key={mesa.id_mesa} mesa={mesa} onPress={() => iniciarOrden(mesa)} />
            ))}
          </View>
        )}
      </AppCard>

      {mesaSeleccionada ? (
        <>
          {mostrarResumen ? (
            <AppCard tone="honey">
            <SectionHeader title="Resumen" icon="clipboard-check-outline" />
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
                  <MaterialCommunityIcons name="check-circle-outline" size={22} color={colors.verdeOscuro} />
                  <Text selectable style={{ color: colors.textoSuave, flex: 1, fontWeight: "700", lineHeight: 20 }}>
                    Revisa cantidades y observaciones antes de enviar.
                  </Text>
                </View>
                <AppButton disabled={enviando} fullWidth icon="send-check-outline" onPress={enviarPedido} title={enviando ? "Enviando..." : "Enviar a cocina"} />
              </>
            ) : (
              <EmptyState title="Carrito vacio" message="Agrega productos para enviar la orden." />
            )}
            </AppCard>
          ) : null}

          {personalizacion ? (
            <AppCard tone="honey">
              <SectionHeader title={personalizacion.producto.nombre} subtitle={money(totalPersonalizacion(personalizacion))} icon="tune-variant" />
              <Text selectable style={{ color: colors.textoSuave, fontWeight: "700", lineHeight: 20 }}>
                {personalizacion.producto.descripcion}
              </Text>
              {personalizacion.grupos.map((grupo) => (
                <View key={grupo.id_grupo} style={{ gap: spacing.sm }}>
                  <Text selectable style={{ color: colors.texto, fontWeight: "900" }}>
                    {grupo.nombre}{grupo.obligatorio ? " *" : ""}
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
                    {grupo.opciones.map((opcion) => {
                      const selected = (seleccionModificadores[grupo.id_grupo] ?? []).includes(opcion.id_opcion);
                      return (
                        <AppButton
                          key={opcion.id_opcion}
                          icon={selected ? "check" : undefined}
                          onPress={() => toggleOpcion(grupo, opcion)}
                          title={`${opcion.nombre}${Number(opcion.precio_adicional) > 0 ? ` +${money(Number(opcion.precio_adicional))}` : ""}`}
                          variant={selected ? "primary" : "secondary"}
                        />
                      );
                    })}
                  </View>
                </View>
              ))}
              <AppInput icon="note-edit-outline" label="Notas especiales" onChangeText={setNotaPersonalizacion} placeholder="Sin canela..." value={notaPersonalizacion} />
              <View style={{ flexDirection: "row", gap: spacing.sm }}>
                <AppButton icon="close" onPress={cerrarPersonalizacion} title="Cancelar" variant="ghost" />
                <AppButton fullWidth icon="cart-plus" onPress={agregarPersonalizado} title={`Agregar ${money(totalPersonalizacion(personalizacion))}`} />
              </View>
            </AppCard>
          ) : null}

          <AppCard>
            <SectionHeader title="Menu" subtitle={`${productosFiltrados.length} producto(s)`} icon="coffee-outline" />
            <MenuCategoryFilter categories={categoriasMenu} value={categoriaSeleccionada} onChange={setCategoriaSeleccionada} />
            <AppInput autoCapitalize="none" icon="magnify" label="Buscar producto" onChangeText={setBusqueda} placeholder="Cafe, croissant, chocolate..." value={busqueda} />
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
                        quantity={cantidadesPorProducto[producto.id_producto] ?? 0}
                        observaciones=""
                        onChangeObservaciones={(value) => actualizarObservaciones(producto, value)}
                        onDecrease={() => disminuirProducto(producto)}
                        onIncrease={() => {
                          void abrirPersonalizacion(producto);
                        }}
                        onOpenDetails={() => {
                          void abrirPersonalizacion(producto);
                        }}
                        showObservaciones={false}
                      />
                    ))}
                  </View>
                ))}
              </View>
            ) : (
              !loading && <EmptyState title="Sin productos" message="No encontramos productos." />
            )}
          </AppCard>
        </>
      ) : null}
    </Screen>
  );
}

export function MeseroPedidos() {
  const auth = useRequireAuth();
  const pedidos = useApi<PedidoCocina[]>("/cocina/pedidos");
  const [filtro, setFiltro] = useState<PedidoFiltro>("activos");
  const pedidosData = pedidos.data ?? [];

  const filtrados = useMemo(() => {
    if (filtro === "listos") return pedidosData.filter((pedido) => pedido.estado === "listo");
    if (filtro === "pagados") return [];
    return pedidosData;
  }, [filtro, pedidosData]);

  if (auth.cargandoSesion || !auth.usuario) return <AuthLoading title="Pedidos" />;

  return (
    <Screen title="Pedidos" subtitle="Seguimiento de ordenes" refreshing={pedidos.loading} onRefresh={() => void pedidos.recargar()}>
      <RoleTabBar items={meseroNav} />
      <StatusMessage loading={pedidos.loading} error={pedidos.error} onRetry={() => void pedidos.recargar()} />

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
        {(["activos", "listos", "pagados"] as PedidoFiltro[]).map((item) => (
          <AppButton key={item} title={item === "activos" ? "Activos" : item === "listos" ? "Listos" : "Pagados"} onPress={() => setFiltro(item)} variant={filtro === item ? "primary" : "secondary"} />
        ))}
      </View>

      <AppCard>
        <SectionHeader title={filtro === "pagados" ? "Pagados" : "Pedidos"} icon="clipboard-text-outline" />
        {filtrados.length ? (
          <View style={{ gap: spacing.sm }}>
            {filtrados.map((pedido) => (
              <PedidoRow key={pedido.id_pedido} pedido={pedido} />
            ))}
          </View>
        ) : (
          !pedidos.loading && <EmptyState title="Sin pedidos" message={filtro === "pagados" ? "El historial de pagos no esta disponible en esta vista." : "No hay pedidos para mostrar."} />
        )}
      </AppCard>
    </Screen>
  );
}
