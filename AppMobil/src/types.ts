export type Mesa = {
  id_mesa: number;
  numero_mesa: number;
  estado: string;
};

export type Producto = {
  id_producto: number;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  categoria?: string | null;
  activo?: boolean;
};

export type PersonalizacionSeleccionada = {
  id_opcion: number;
  nombre_grupo: string;
  nombre_opcion: string;
  precio_adicional: number;
};

export type OpcionModificador = {
  id_opcion: number;
  nombre: string;
  precio_adicional: number;
  es_default: boolean;
};

export type GrupoModificador = {
  id_grupo: number;
  clave: string;
  nombre: string;
  tipo_seleccion: "single" | "multi";
  obligatorio: boolean;
  opciones: OpcionModificador[];
};

export type PersonalizacionesProducto = {
  producto: Producto;
  grupos: GrupoModificador[];
};

export type PedidoCocina = {
  id_pedido: number;
  id_mesa?: number | null;
  numero_mesa: number;
  fecha_hora?: string;
  estado: string;
  total: number;
  detalle: Array<{
    id_detalle: number;
    nombre: string;
    cantidad: number;
    observaciones?: string | null;
    personalizaciones?: PersonalizacionSeleccionada[];
  }>;
};

export type EstadoPedido = "pendiente" | "en_preparacion" | "listo" | "entregado" | "pagado" | "cancelado";

export type ResumenCaja = {
  ingresos: number;
  gastos: number;
  compras: number;
  ganancia_estimada: number;
};

export type Inventario = {
  id_insumo: number;
  nombre: string;
  stock_actual: number;
  stock_minimo: number;
  unidad_medida: string;
};

export type Cuenta = {
  id_pedido: number;
  id_mesa?: number | null;
  numero_mesa: number;
  fecha_hora?: string;
  estado: string;
  total: number;
};

export type DetallePedido = {
  id_detalle: number;
  id_producto: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  observaciones?: string | null;
  personalizaciones?: PersonalizacionSeleccionada[];
};

export type PedidoDetalle = {
  id_pedido: number;
  id_mesa: number | null;
  id_mesero: number | null;
  fecha_hora: string;
  estado: string;
  total: number;
  detalle: DetallePedido[];
};

export type MetodoPago = "efectivo" | "tarjeta" | "transferencia";

export type PagoCrear = {
  id_pedido: number;
  metodo_pago: MetodoPago;
  monto: number;
};

export type PagoCreado = {
  id_pago: number;
  id_pedido: number;
  metodo_pago: MetodoPago;
  monto: number;
  fecha_pago: string;
};

export type PedidoPorEstado = {
  estado: string;
  total: number;
};

export type UsuarioResumen = {
  id_usuario: number;
  nombre: string;
  correo: string;
  activo: boolean;
  id_rol: number;
  rol: string;
};

export type PermisoUsuario = {
  clave: string;
  nombre: string;
};

export type UsuarioAutenticado = {
  id_usuario: number;
  nombre: string;
  correo: string;
  id_rol: number;
  rol?: string;
  activo: boolean;
  permisos: PermisoUsuario[];
  access_token: string;
  token_type: string;
  expires_in: number;
};

export type LoginRespuesta = UsuarioAutenticado & {
  usuario: Omit<UsuarioAutenticado, "access_token" | "token_type" | "expires_in">;
};

export type DetallePedidoCrear = {
  id_producto: number;
  cantidad: number;
  observaciones?: string | null;
  modificadores?: number[];
};

export type PedidoCrear = {
  id_mesa: number;
  id_mesero: number;
  productos: DetallePedidoCrear[];
};

export type PedidoCreado = {
  id_pedido: number;
  id_mesa: number;
  id_mesero: number;
  fecha_hora: string;
  estado: string;
  total: number;
};
