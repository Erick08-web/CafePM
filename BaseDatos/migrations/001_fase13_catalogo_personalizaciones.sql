-- Fase 13 - Catalogo premium + personalizaciones estructuradas.
-- Ejecutar sobre una BD existente sin borrar pedidos/pagos.

CREATE TABLE IF NOT EXISTS grupos_modificador (
    id_grupo SERIAL PRIMARY KEY,
    clave VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(80) NOT NULL,
    tipo_seleccion VARCHAR(10) NOT NULL CHECK (tipo_seleccion IN ('single', 'multi')),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    orden INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS opciones_modificador (
    id_opcion SERIAL PRIMARY KEY,
    id_grupo INT NOT NULL REFERENCES grupos_modificador(id_grupo) ON DELETE CASCADE,
    nombre VARCHAR(80) NOT NULL,
    precio_adicional NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (precio_adicional >= 0),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    orden INT NOT NULL DEFAULT 0,
    UNIQUE (id_grupo, nombre)
);

CREATE TABLE IF NOT EXISTS producto_grupo_modificador (
    id_producto INT NOT NULL REFERENCES productos(id_producto) ON DELETE CASCADE,
    id_grupo INT NOT NULL REFERENCES grupos_modificador(id_grupo) ON DELETE CASCADE,
    obligatorio BOOLEAN NOT NULL DEFAULT FALSE,
    orden INT NOT NULL DEFAULT 0,
    PRIMARY KEY (id_producto, id_grupo)
);

CREATE TABLE IF NOT EXISTS producto_opcion_modificador (
    id_producto INT NOT NULL REFERENCES productos(id_producto) ON DELETE CASCADE,
    id_opcion INT NOT NULL REFERENCES opciones_modificador(id_opcion) ON DELETE CASCADE,
    es_default BOOLEAN NOT NULL DEFAULT FALSE,
    orden INT NOT NULL DEFAULT 0,
    PRIMARY KEY (id_producto, id_opcion)
);

CREATE TABLE IF NOT EXISTS opcion_modificador_inventario (
    id_opcion INT NOT NULL REFERENCES opciones_modificador(id_opcion) ON DELETE CASCADE,
    id_insumo INT NOT NULL REFERENCES inventario(id_insumo) ON DELETE RESTRICT,
    cantidad_adicional NUMERIC(10,2) NOT NULL CHECK (cantidad_adicional > 0),
    PRIMARY KEY (id_opcion, id_insumo)
);

CREATE TABLE IF NOT EXISTS detalle_pedido_modificador (
    id_detalle_modificador SERIAL PRIMARY KEY,
    id_detalle INT NOT NULL REFERENCES detalle_pedido(id_detalle) ON DELETE CASCADE,
    id_opcion INT REFERENCES opciones_modificador(id_opcion) ON DELETE SET NULL,
    nombre_grupo VARCHAR(80) NOT NULL,
    nombre_opcion VARCHAR(80) NOT NULL,
    precio_adicional NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (precio_adicional >= 0)
);

CREATE INDEX IF NOT EXISTS idx_detalle_modificador_detalle ON detalle_pedido_modificador(id_detalle);

INSERT INTO categorias_producto (nombre)
SELECT nombre
FROM (VALUES
('Cafes calientes'), ('Cafes frios'), ('Espresso'), ('Chocolate y te'),
('Bebidas mezcladas'), ('Panaderia'), ('Postres'), ('Alimentos')
) AS data(nombre)
WHERE NOT EXISTS (SELECT 1 FROM categorias_producto c WHERE c.nombre = data.nombre);

WITH data(nombre, stock_actual, stock_minimo, unidad_medida) AS (
  VALUES
  ('Granos de cafe', 6.00, 1.00, 'kg'), ('Leche entera', 18.00, 3.00, 'l'), ('Pan croissant', 10.00, 5.00, 'pz'),
  ('Chocolate', 2.50, 1.00, 'kg'), ('Azucar', 4.00, 2.00, 'kg'), ('Te verde', 60.00, 15.00, 'pz'), ('Te negro', 60.00, 15.00, 'pz'),
  ('Matcha', 1.20, 0.30, 'kg'), ('Chai', 1.40, 0.30, 'kg'), ('Base frappe', 4.00, 1.00, 'kg'), ('Base vainilla', 2.00, 0.50, 'kg'),
  ('Muffin de vainilla', 14.00, 4.00, 'pz'), ('Cinnamon roll', 12.00, 4.00, 'pz'), ('Pan de chocolate', 12.00, 4.00, 'pz'),
  ('Brownie', 14.00, 4.00, 'pz'), ('Cheesecake', 10.00, 3.00, 'pz'), ('Galleta de avena', 20.00, 6.00, 'pz'),
  ('Pan sandwich', 10.00, 3.00, 'pz'), ('Bagel', 10.00, 3.00, 'pz'), ('Panini', 10.00, 3.00, 'pz'),
  ('Leche de avena', 8.00, 2.00, 'l'), ('Leche de almendra', 8.00, 2.00, 'l'), ('Leche de soya', 8.00, 2.00, 'l'), ('Leche de coco', 8.00, 2.00, 'l'),
  ('Jarabe vainilla', 3.00, 0.60, 'l'), ('Jarabe caramelo', 3.00, 0.60, 'l'), ('Jarabe avellana', 3.00, 0.60, 'l'), ('Canela', 1.00, 0.20, 'kg'), ('Crema batida', 4.00, 1.00, 'kg')
)
INSERT INTO inventario (nombre, stock_actual, stock_minimo, unidad_medida)
SELECT nombre, stock_actual, stock_minimo, unidad_medida FROM data
WHERE NOT EXISTS (SELECT 1 FROM inventario i WHERE i.nombre = data.nombre);

WITH data(nombre, descripcion, precio, categoria, activo) AS (
  VALUES
  ('Cafe Americano','Espresso con agua caliente.',38.00,'Cafes calientes',TRUE), ('Capuchino','Espresso con leche vaporizada y espuma.',55.00,'Cafes calientes',TRUE),
  ('Latte','Espresso suave con leche vaporizada.',54.00,'Cafes calientes',TRUE), ('Croissant','Pan de mantequilla horneado.',45.00,'Panaderia',TRUE),
  ('Chocolate Frio','Leche fria con chocolate.',58.00,'Chocolate y te',TRUE), ('Espresso','Carga intensa de cafe espresso.',32.00,'Espresso',TRUE),
  ('Doble Espresso','Dos cargas de espresso intenso.',42.00,'Espresso',TRUE), ('Flat White','Espresso con leche sedosa.',58.00,'Cafes calientes',TRUE),
  ('Mocha Caliente','Espresso con chocolate y leche.',60.00,'Cafes calientes',TRUE), ('Iced Americano','Espresso con agua fria y hielo.',42.00,'Cafes frios',TRUE),
  ('Iced Latte','Espresso frio con leche.',58.00,'Cafes frios',TRUE), ('Cold Brew','Cafe frio de extraccion lenta.',62.00,'Cafes frios',FALSE),
  ('Iced Mocha','Cafe frio con chocolate y leche.',64.00,'Cafes frios',TRUE), ('Chocolate Caliente','Chocolate con leche vaporizada.',56.00,'Chocolate y te',TRUE),
  ('Chai Latte','Chai especiado con leche vaporizada.',60.00,'Chocolate y te',TRUE), ('Matcha Latte','Matcha con leche vaporizada.',64.00,'Chocolate y te',TRUE),
  ('Te Verde','Infusion ligera de te verde.',36.00,'Chocolate y te',TRUE), ('Te Negro','Infusion clasica de te negro.',36.00,'Chocolate y te',TRUE),
  ('Frappe Cafe','Bebida mezclada con cafe.',68.00,'Bebidas mezcladas',TRUE), ('Frappe Chocolate','Bebida mezclada con chocolate.',70.00,'Bebidas mezcladas',TRUE),
  ('Frappe Vainilla','Bebida mezclada con vainilla.',70.00,'Bebidas mezcladas',TRUE), ('Muffin de Vainilla','Pan dulce individual.',42.00,'Panaderia',TRUE),
  ('Cinnamon Roll','Rollo de canela glaseado.',48.00,'Panaderia',TRUE), ('Pan de Chocolate','Pan dulce relleno de chocolate.',46.00,'Panaderia',TRUE),
  ('Brownie','Postre de chocolate horneado.',44.00,'Postres',TRUE), ('Cheesecake','Rebanada cremosa de queso.',58.00,'Postres',TRUE),
  ('Galleta de Avena','Galleta horneada de avena.',32.00,'Postres',TRUE), ('Sandwich de Pavo','Pan con pavo, queso y vegetales.',72.00,'Alimentos',TRUE),
  ('Bagel con Queso','Bagel tostado con queso crema.',58.00,'Alimentos',TRUE), ('Panini Caprese','Panini con queso, tomate y albahaca.',78.00,'Alimentos',TRUE)
)
UPDATE productos p
SET descripcion = data.descripcion, precio = data.precio, id_categoria = c.id_categoria, activo = data.activo
FROM data JOIN categorias_producto c ON c.nombre = data.categoria
WHERE p.nombre = data.nombre;

WITH data(nombre, descripcion, precio, categoria, activo) AS (
  VALUES
  ('Espresso','Carga intensa de cafe espresso.',32.00,'Espresso',TRUE), ('Latte','Espresso suave con leche vaporizada.',54.00,'Cafes calientes',TRUE), ('Doble Espresso','Dos cargas de espresso intenso.',42.00,'Espresso',TRUE),
  ('Flat White','Espresso con leche sedosa.',58.00,'Cafes calientes',TRUE), ('Mocha Caliente','Espresso con chocolate y leche.',60.00,'Cafes calientes',TRUE),
  ('Iced Americano','Espresso con agua fria y hielo.',42.00,'Cafes frios',TRUE), ('Iced Latte','Espresso frio con leche.',58.00,'Cafes frios',TRUE),
  ('Cold Brew','Cafe frio de extraccion lenta.',62.00,'Cafes frios',FALSE), ('Iced Mocha','Cafe frio con chocolate y leche.',64.00,'Cafes frios',TRUE),
  ('Chocolate Caliente','Chocolate con leche vaporizada.',56.00,'Chocolate y te',TRUE), ('Chai Latte','Chai especiado con leche vaporizada.',60.00,'Chocolate y te',TRUE),
  ('Matcha Latte','Matcha con leche vaporizada.',64.00,'Chocolate y te',TRUE), ('Te Verde','Infusion ligera de te verde.',36.00,'Chocolate y te',TRUE),
  ('Te Negro','Infusion clasica de te negro.',36.00,'Chocolate y te',TRUE), ('Frappe Cafe','Bebida mezclada con cafe.',68.00,'Bebidas mezcladas',TRUE),
  ('Frappe Chocolate','Bebida mezclada con chocolate.',70.00,'Bebidas mezcladas',TRUE), ('Frappe Vainilla','Bebida mezclada con vainilla.',70.00,'Bebidas mezcladas',TRUE),
  ('Muffin de Vainilla','Pan dulce individual.',42.00,'Panaderia',TRUE), ('Cinnamon Roll','Rollo de canela glaseado.',48.00,'Panaderia',TRUE),
  ('Pan de Chocolate','Pan dulce relleno de chocolate.',46.00,'Panaderia',TRUE), ('Brownie','Postre de chocolate horneado.',44.00,'Postres',TRUE),
  ('Cheesecake','Rebanada cremosa de queso.',58.00,'Postres',TRUE), ('Galleta de Avena','Galleta horneada de avena.',32.00,'Postres',TRUE),
  ('Sandwich de Pavo','Pan con pavo, queso y vegetales.',72.00,'Alimentos',TRUE), ('Bagel con Queso','Bagel tostado con queso crema.',58.00,'Alimentos',TRUE),
  ('Panini Caprese','Panini con queso, tomate y albahaca.',78.00,'Alimentos',TRUE)
)
INSERT INTO productos (nombre, descripcion, precio, id_categoria, activo)
SELECT data.nombre, data.descripcion, data.precio, c.id_categoria, data.activo
FROM data JOIN categorias_producto c ON c.nombre = data.categoria
WHERE NOT EXISTS (SELECT 1 FROM productos p WHERE p.nombre = data.nombre);

UPDATE productos
SET activo = FALSE
WHERE nombre = 'Cafe con Leche'
  AND EXISTS (SELECT 1 FROM productos WHERE nombre = 'Latte');

INSERT INTO receta (id_producto, id_insumo, cantidad_necesaria)
SELECT p.id_producto, i.id_insumo, data.cantidad
FROM (VALUES
('Cafe Americano','Granos de cafe',0.018),('Capuchino','Granos de cafe',0.018),('Capuchino','Leche entera',0.150),('Latte','Granos de cafe',0.018),('Latte','Leche entera',0.120),
('Croissant','Pan croissant',1.000),('Chocolate Frio','Chocolate',0.020),('Chocolate Frio','Leche entera',0.100),('Espresso','Granos de cafe',0.018),('Doble Espresso','Granos de cafe',0.036),
('Flat White','Granos de cafe',0.018),('Flat White','Leche entera',0.130),('Mocha Caliente','Granos de cafe',0.018),('Mocha Caliente','Leche entera',0.120),('Mocha Caliente','Chocolate',0.018),
('Iced Americano','Granos de cafe',0.018),('Iced Latte','Granos de cafe',0.018),('Iced Latte','Leche entera',0.140),('Cold Brew','Granos de cafe',0.025),('Iced Mocha','Granos de cafe',0.018),('Iced Mocha','Leche entera',0.120),('Iced Mocha','Chocolate',0.018),
('Chocolate Caliente','Chocolate',0.030),('Chocolate Caliente','Leche entera',0.180),('Chai Latte','Chai',0.025),('Chai Latte','Leche entera',0.180),('Matcha Latte','Matcha',0.018),('Matcha Latte','Leche entera',0.180),
('Te Verde','Te verde',1.000),('Te Negro','Te negro',1.000),('Frappe Cafe','Granos de cafe',0.018),('Frappe Cafe','Leche entera',0.140),('Frappe Cafe','Base frappe',0.045),
('Frappe Chocolate','Chocolate',0.030),('Frappe Chocolate','Leche entera',0.140),('Frappe Chocolate','Base frappe',0.045),('Frappe Vainilla','Base vainilla',0.035),('Frappe Vainilla','Leche entera',0.160),('Frappe Vainilla','Base frappe',0.040),
('Muffin de Vainilla','Muffin de vainilla',1.000),('Cinnamon Roll','Cinnamon roll',1.000),('Pan de Chocolate','Pan de chocolate',1.000),('Brownie','Brownie',1.000),('Cheesecake','Cheesecake',1.000),('Galleta de Avena','Galleta de avena',1.000),
('Sandwich de Pavo','Pan sandwich',1.000),('Bagel con Queso','Bagel',1.000),('Panini Caprese','Panini',1.000)
) AS data(producto, insumo, cantidad)
JOIN productos p ON p.nombre = data.producto
JOIN inventario i ON i.nombre = data.insumo
ON CONFLICT (id_producto, id_insumo) DO UPDATE SET cantidad_necesaria = EXCLUDED.cantidad_necesaria;

INSERT INTO grupos_modificador (clave, nombre, tipo_seleccion, activo, orden)
VALUES
('tamano','Tamaño','single',TRUE,1), ('temperatura','Temperatura','single',TRUE,2), ('leche','Leche','single',TRUE,3),
('espresso','Espresso','single',TRUE,4), ('dulzor','Dulzor','single',TRUE,5), ('jarabes','Jarabes','multi',TRUE,6),
('crema','Crema','single',TRUE,7), ('espuma','Espuma','single',TRUE,8), ('hielo','Hielo','single',TRUE,9), ('extras','Extras','multi',TRUE,10)
ON CONFLICT (clave) DO UPDATE SET nombre = EXCLUDED.nombre, tipo_seleccion = EXCLUDED.tipo_seleccion, activo = TRUE, orden = EXCLUDED.orden;

INSERT INTO opciones_modificador (id_grupo, nombre, precio_adicional, activo, orden)
SELECT g.id_grupo, data.nombre, data.precio, TRUE, data.orden
FROM (VALUES
('tamano','Chico',0.00,1),('tamano','Mediano',0.00,2),('tamano','Grande',10.00,3),('temperatura','Caliente',0.00,1),('temperatura','Frio',0.00,2),
('leche','Entera',0.00,1),('leche','Deslactosada',0.00,2),('leche','Light',0.00,3),('leche','Avena',8.00,4),('leche','Almendra',8.00,5),('leche','Soya',8.00,6),('leche','Coco',8.00,7),
('espresso','Normal',0.00,1),('espresso','Extra shot',12.00,2),('espresso','Doble extra',22.00,3),('espresso','Descafeinado',0.00,4),
('dulzor','Sin azucar',0.00,1),('dulzor','Poco',0.00,2),('dulzor','Normal',0.00,3),('dulzor','Extra',0.00,4),
('jarabes','Vainilla',8.00,1),('jarabes','Caramelo',8.00,2),('jarabes','Avellana',8.00,3),
('crema','Normal',0.00,1),('crema','Poca',0.00,2),('crema','Sin crema',0.00,3),('espuma','Normal',0.00,1),('espuma','Extra',0.00,2),('espuma','Sin espuma',0.00,3),
('hielo','Sin hielo',0.00,1),('hielo','Poco',0.00,2),('hielo','Normal',0.00,3),('hielo','Extra',0.00,4),
('extras','Cold foam',12.00,1),('extras','Canela',4.00,2),('extras','Chocolate',6.00,3),('extras','Caramelo',6.00,4),('extras','Crema batida',8.00,5)
) AS data(grupo, nombre, precio, orden)
JOIN grupos_modificador g ON g.clave = data.grupo
ON CONFLICT (id_grupo, nombre) DO UPDATE SET precio_adicional = EXCLUDED.precio_adicional, activo = TRUE, orden = EXCLUDED.orden;

INSERT INTO producto_grupo_modificador (id_producto, id_grupo, obligatorio, orden)
SELECT p.id_producto, g.id_grupo, config.obligatorio, g.orden
FROM productos p
JOIN categorias_producto c ON c.id_categoria = p.id_categoria
JOIN (VALUES
('Cafes calientes','tamano',TRUE),('Cafes calientes','temperatura',TRUE),('Cafes calientes','espresso',TRUE),('Cafes calientes','dulzor',TRUE),('Cafes calientes','jarabes',FALSE),
('Cafes frios','tamano',TRUE),('Cafes frios','temperatura',TRUE),('Cafes frios','espresso',TRUE),('Cafes frios','dulzor',TRUE),('Cafes frios','jarabes',FALSE),('Cafes frios','hielo',TRUE),('Cafes frios','extras',FALSE),
('Espresso','espresso',TRUE),('Espresso','dulzor',FALSE),('Chocolate y te','tamano',TRUE),('Chocolate y te','temperatura',TRUE),('Chocolate y te','dulzor',TRUE),('Chocolate y te','extras',FALSE),
('Bebidas mezcladas','tamano',TRUE),('Bebidas mezcladas','dulzor',TRUE),('Bebidas mezcladas','crema',FALSE),('Bebidas mezcladas','extras',FALSE)
) AS config(categoria, grupo, obligatorio) ON config.categoria = c.nombre
JOIN grupos_modificador g ON g.clave = config.grupo
ON CONFLICT (id_producto, id_grupo) DO UPDATE SET obligatorio = EXCLUDED.obligatorio, orden = EXCLUDED.orden;

INSERT INTO producto_grupo_modificador (id_producto, id_grupo, obligatorio, orden)
SELECT p.id_producto, g.id_grupo, TRUE, g.orden FROM productos p JOIN grupos_modificador g ON g.clave = 'leche'
WHERE p.nombre IN ('Capuchino','Latte','Flat White','Mocha Caliente','Iced Latte','Iced Mocha','Chocolate Frio','Chocolate Caliente','Chai Latte','Matcha Latte')
ON CONFLICT (id_producto, id_grupo) DO UPDATE SET obligatorio = TRUE, orden = EXCLUDED.orden;

INSERT INTO producto_grupo_modificador (id_producto, id_grupo, obligatorio, orden)
SELECT p.id_producto, g.id_grupo, FALSE, g.orden FROM productos p JOIN grupos_modificador g ON g.clave = 'espuma'
WHERE p.nombre IN ('Capuchino','Latte','Flat White','Mocha Caliente','Chai Latte','Matcha Latte')
ON CONFLICT (id_producto, id_grupo) DO UPDATE SET obligatorio = FALSE, orden = EXCLUDED.orden;

INSERT INTO producto_opcion_modificador (id_producto, id_opcion, es_default, orden)
SELECT pg.id_producto, o.id_opcion,
       ((g.clave='tamano' AND o.nombre='Mediano')
        OR (g.clave='temperatura' AND ((c.nombre IN ('Cafes calientes','Espresso') AND o.nombre='Caliente') OR (c.nombre IN ('Cafes frios','Bebidas mezcladas') AND o.nombre='Frio') OR (c.nombre='Chocolate y te' AND o.nombre = CASE WHEN p.nombre = 'Chocolate Frio' THEN 'Frio' ELSE 'Caliente' END)))
        OR (g.clave='leche' AND o.nombre='Entera') OR (g.clave='espresso' AND o.nombre='Normal') OR (g.clave='dulzor' AND o.nombre='Normal') OR (g.clave='crema' AND o.nombre='Normal') OR (g.clave='espuma' AND o.nombre='Normal') OR (g.clave='hielo' AND o.nombre='Normal')) AS es_default,
       o.orden
FROM producto_grupo_modificador pg
JOIN productos p ON p.id_producto = pg.id_producto
JOIN categorias_producto c ON c.id_categoria = p.id_categoria
JOIN grupos_modificador g ON g.id_grupo = pg.id_grupo
JOIN opciones_modificador o ON o.id_grupo = g.id_grupo
ON CONFLICT (id_producto, id_opcion) DO UPDATE SET es_default = EXCLUDED.es_default, orden = EXCLUDED.orden;

INSERT INTO opcion_modificador_inventario (id_opcion, id_insumo, cantidad_adicional)
SELECT o.id_opcion, i.id_insumo, data.cantidad
FROM (VALUES
('Extra shot','Granos de cafe',0.018),('Doble extra','Granos de cafe',0.036),('Avena','Leche de avena',0.120),('Almendra','Leche de almendra',0.120),('Soya','Leche de soya',0.120),('Coco','Leche de coco',0.120),
('Vainilla','Jarabe vainilla',0.025),('Avellana','Jarabe avellana',0.025),('Cold foam','Leche entera',0.080),('Canela','Canela',0.005),('Chocolate','Chocolate',0.012),('Caramelo','Jarabe caramelo',0.025),('Crema batida','Crema batida',0.030)
) AS data(opcion, insumo, cantidad)
JOIN opciones_modificador o ON o.nombre = data.opcion
JOIN inventario i ON i.nombre = data.insumo
ON CONFLICT (id_opcion, id_insumo) DO UPDATE SET cantidad_adicional = EXCLUDED.cantidad_adicional;

CREATE OR REPLACE FUNCTION fn_descontar_inventario_por_pago()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO movimientos_inventario (id_insumo, tipo_movimiento, cantidad, id_pedido)
    SELECT r.id_insumo, 'salida', r.cantidad_necesaria * dp.cantidad, NEW.id_pedido
    FROM detalle_pedido dp
    JOIN receta r ON r.id_producto = dp.id_producto
    WHERE dp.id_pedido = NEW.id_pedido;

    INSERT INTO movimientos_inventario (id_insumo, tipo_movimiento, cantidad, id_pedido)
    SELECT omi.id_insumo, 'salida', omi.cantidad_adicional * dp.cantidad, NEW.id_pedido
    FROM detalle_pedido dp
    JOIN detalle_pedido_modificador dpm ON dpm.id_detalle = dp.id_detalle
    JOIN opcion_modificador_inventario omi ON omi.id_opcion = dpm.id_opcion
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
