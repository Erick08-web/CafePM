-- =========================================================
-- COFFEE CODE - Sistema de Cafeteria
-- Esquema PostgreSQL para Segundo Parcial
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE estado_pedido AS ENUM (
    'pendiente', 'en_preparacion', 'listo', 'entregado', 'pagado', 'cancelado'
);

CREATE TYPE estado_mesa AS ENUM ('libre', 'ocupada', 'lista');
CREATE TYPE tipo_movimiento_inv AS ENUM ('entrada', 'salida');
CREATE TYPE metodo_pago_enum AS ENUM ('efectivo', 'tarjeta', 'transferencia');
CREATE TYPE estado_compra AS ENUM ('registrada', 'recibida', 'cancelada');

CREATE TABLE roles (
    id_rol SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT
);

CREATE TABLE permisos (
    id_permiso SERIAL PRIMARY KEY,
    clave VARCHAR(30) NOT NULL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT
);

CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    id_rol INT NOT NULL REFERENCES roles(id_rol),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE usuario_permisos (
    id_usuario INT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    id_permiso INT NOT NULL REFERENCES permisos(id_permiso) ON DELETE CASCADE,
    PRIMARY KEY (id_usuario, id_permiso)
);

CREATE TABLE mesas (
    id_mesa SERIAL PRIMARY KEY,
    numero_mesa INT NOT NULL UNIQUE,
    estado estado_mesa NOT NULL DEFAULT 'libre'
);

CREATE TABLE categorias_producto (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE categorias_gasto (
    id_categoria_gasto SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE productos (
    id_producto SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
    id_categoria INT REFERENCES categorias_producto(id_categoria),
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE inventario (
    id_insumo SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    stock_actual NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (stock_actual >= 0),
    stock_minimo NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (stock_minimo >= 0),
    unidad_medida VARCHAR(20) NOT NULL
);

CREATE TABLE receta (
    id_receta SERIAL PRIMARY KEY,
    id_producto INT NOT NULL REFERENCES productos(id_producto) ON DELETE CASCADE,
    id_insumo INT NOT NULL REFERENCES inventario(id_insumo) ON DELETE RESTRICT,
    cantidad_necesaria NUMERIC(10,2) NOT NULL CHECK (cantidad_necesaria > 0),
    UNIQUE (id_producto, id_insumo)
);

CREATE TABLE proveedores (
    id_proveedor SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    correo VARCHAR(100),
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE compras (
    id_compra SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES usuarios(id_usuario),
    id_proveedor INT REFERENCES proveedores(id_proveedor),
    fecha_compra TIMESTAMP NOT NULL DEFAULT NOW(),
    estado estado_compra NOT NULL DEFAULT 'registrada',
    total NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total >= 0)
);

CREATE TABLE detalle_compra (
    id_detalle_compra SERIAL PRIMARY KEY,
    id_compra INT NOT NULL REFERENCES compras(id_compra) ON DELETE CASCADE,
    id_insumo INT NOT NULL REFERENCES inventario(id_insumo),
    cantidad NUMERIC(10,2) NOT NULL CHECK (cantidad > 0),
    costo_unitario NUMERIC(10,2) NOT NULL CHECK (costo_unitario >= 0),
    subtotal NUMERIC(10,2) GENERATED ALWAYS AS (cantidad * costo_unitario) STORED
);

CREATE TABLE pedidos (
    id_pedido SERIAL PRIMARY KEY,
    id_mesa INT REFERENCES mesas(id_mesa),
    id_mesero INT REFERENCES usuarios(id_usuario),
    fecha_hora TIMESTAMP NOT NULL DEFAULT NOW(),
    estado estado_pedido NOT NULL DEFAULT 'pendiente',
    total NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total >= 0)
);

CREATE TABLE detalle_pedido (
    id_detalle SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    id_producto INT NOT NULL REFERENCES productos(id_producto),
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10,2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal NUMERIC(10,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
    observaciones TEXT
);

CREATE TABLE pagos (
    id_pago SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL UNIQUE REFERENCES pedidos(id_pedido),
    metodo_pago metodo_pago_enum NOT NULL,
    monto NUMERIC(10,2) NOT NULL CHECK (monto >= 0),
    fecha_pago TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE movimientos_inventario (
    id_movimiento SERIAL PRIMARY KEY,
    id_insumo INT NOT NULL REFERENCES inventario(id_insumo),
    tipo_movimiento tipo_movimiento_inv NOT NULL,
    cantidad NUMERIC(10,2) NOT NULL CHECK (cantidad > 0),
    fecha_movimiento TIMESTAMP NOT NULL DEFAULT NOW(),
    id_pedido INT REFERENCES pedidos(id_pedido),
    id_compra INT REFERENCES compras(id_compra)
);

CREATE TABLE gastos (
    id_gasto SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES usuarios(id_usuario),
    concepto VARCHAR(200) NOT NULL,
    id_categoria_gasto INT NOT NULL REFERENCES categorias_gasto(id_categoria_gasto),
    monto NUMERIC(10,2) NOT NULL CHECK (monto >= 0),
    fecha_gasto DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedidos_fecha ON pedidos(fecha_hora);
CREATE INDEX idx_detalle_pedido ON detalle_pedido(id_pedido);
CREATE INDEX idx_gastos_fecha ON gastos(fecha_gasto);
CREATE INDEX idx_compras_fecha ON compras(fecha_compra);
CREATE INDEX idx_movimientos_insumo ON movimientos_inventario(id_insumo);

CREATE OR REPLACE FUNCTION fn_recalcular_total_pedido()
RETURNS TRIGGER AS $$
DECLARE
    v_id_pedido INT;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_id_pedido := OLD.id_pedido;
    ELSE
        v_id_pedido := NEW.id_pedido;
    END IF;

    UPDATE pedidos
    SET total = COALESCE((SELECT SUM(subtotal) FROM detalle_pedido WHERE id_pedido = v_id_pedido), 0)
    WHERE id_pedido = v_id_pedido;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_recalcular_total_pedido
AFTER INSERT OR UPDATE OR DELETE ON detalle_pedido
FOR EACH ROW EXECUTE FUNCTION fn_recalcular_total_pedido();

CREATE OR REPLACE FUNCTION fn_recalcular_total_compra()
RETURNS TRIGGER AS $$
DECLARE
    v_id_compra INT;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_id_compra := OLD.id_compra;
    ELSE
        v_id_compra := NEW.id_compra;
    END IF;

    UPDATE compras
    SET total = COALESCE((SELECT SUM(subtotal) FROM detalle_compra WHERE id_compra = v_id_compra), 0)
    WHERE id_compra = v_id_compra;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_recalcular_total_compra
AFTER INSERT OR UPDATE OR DELETE ON detalle_compra
FOR EACH ROW EXECUTE FUNCTION fn_recalcular_total_compra();

CREATE OR REPLACE FUNCTION fn_actualizar_estado_mesa()
RETURNS TRIGGER AS $$
DECLARE
    v_mesa INT := NEW.id_mesa;
    v_hay_activos BOOLEAN;
    v_hay_listos BOOLEAN;
BEGIN
    IF v_mesa IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM pedidos
        WHERE id_mesa = v_mesa AND estado NOT IN ('pagado', 'cancelado')
    ) INTO v_hay_activos;

    SELECT EXISTS (
        SELECT 1 FROM pedidos
        WHERE id_mesa = v_mesa AND estado = 'listo'
    ) INTO v_hay_listos;

    IF NOT v_hay_activos THEN
        UPDATE mesas SET estado = 'libre' WHERE id_mesa = v_mesa;
    ELSIF v_hay_listos THEN
        UPDATE mesas SET estado = 'lista' WHERE id_mesa = v_mesa;
    ELSE
        UPDATE mesas SET estado = 'ocupada' WHERE id_mesa = v_mesa;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_actualizar_estado_mesa
AFTER INSERT OR UPDATE OF estado ON pedidos
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_estado_mesa();

CREATE OR REPLACE FUNCTION fn_descontar_inventario_por_pago()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO movimientos_inventario (id_insumo, tipo_movimiento, cantidad, id_pedido)
    SELECT r.id_insumo, 'salida', r.cantidad_necesaria * dp.cantidad, NEW.id_pedido
    FROM detalle_pedido dp
    JOIN receta r ON r.id_producto = dp.id_producto
    WHERE dp.id_pedido = NEW.id_pedido;

    UPDATE inventario i
    SET stock_actual = stock_actual - mov.total_consumido
    FROM (
        SELECT id_insumo, SUM(cantidad) AS total_consumido
        FROM movimientos_inventario
        WHERE id_pedido = NEW.id_pedido AND tipo_movimiento = 'salida'
        GROUP BY id_insumo
    ) mov
    WHERE i.id_insumo = mov.id_insumo;

    UPDATE pedidos SET estado = 'pagado' WHERE id_pedido = NEW.id_pedido;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_descontar_inventario_por_pago
AFTER INSERT ON pagos
FOR EACH ROW EXECUTE FUNCTION fn_descontar_inventario_por_pago();

CREATE OR REPLACE FUNCTION fn_aumentar_inventario_por_compra_recibida()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado = 'recibida' AND OLD.estado <> 'recibida' THEN
        INSERT INTO movimientos_inventario (id_insumo, tipo_movimiento, cantidad, id_compra)
        SELECT id_insumo, 'entrada', cantidad, NEW.id_compra
        FROM detalle_compra
        WHERE id_compra = NEW.id_compra;

        UPDATE inventario i
        SET stock_actual = stock_actual + mov.total_recibido
        FROM (
            SELECT id_insumo, SUM(cantidad) AS total_recibido
            FROM detalle_compra
            WHERE id_compra = NEW.id_compra
            GROUP BY id_insumo
        ) mov
        WHERE i.id_insumo = mov.id_insumo;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_aumentar_inventario_por_compra_recibida
AFTER UPDATE OF estado ON compras
FOR EACH ROW EXECUTE FUNCTION fn_aumentar_inventario_por_compra_recibida();

CREATE VIEW vw_productos_mas_vendidos AS
SELECT
    p.id_producto,
    p.nombre,
    SUM(dp.cantidad) AS cantidad_vendida,
    SUM(dp.subtotal) AS importe_vendido
FROM detalle_pedido dp
JOIN productos p ON p.id_producto = dp.id_producto
JOIN pedidos pe ON pe.id_pedido = dp.id_pedido
WHERE pe.estado IN ('entregado', 'pagado')
GROUP BY p.id_producto, p.nombre
ORDER BY cantidad_vendida DESC;

CREATE VIEW vw_resumen_financiero AS
SELECT
    COALESCE((SELECT SUM(monto) FROM pagos), 0) AS ingresos,
    COALESCE((SELECT SUM(monto) FROM gastos), 0) AS gastos,
    COALESCE((SELECT SUM(total) FROM compras WHERE estado <> 'cancelada'), 0) AS compras,
    COALESCE((SELECT SUM(monto) FROM pagos), 0)
      - COALESCE((SELECT SUM(monto) FROM gastos), 0)
      - COALESCE((SELECT SUM(total) FROM compras WHERE estado <> 'cancelada'), 0) AS ganancia_estimada;

CREATE VIEW vw_inventario_bajo AS
SELECT *
FROM inventario
WHERE stock_actual <= stock_minimo;
