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

export type PedidoCocina = {
  id_pedido: number;
  numero_mesa: number;
  estado: string;
  total: number;
  detalle: Array<{
    id_detalle: number;
    nombre: string;
    cantidad: number;
    observaciones?: string | null;
  }>;
};

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
  numero_mesa: number;
  estado: string;
  total: number;
};
