-- =========================================================
-- COFFEE CODE - Datos iniciales
-- =========================================================

INSERT INTO roles (nombre, descripcion) VALUES
('Admin', 'Administrador general del sistema'),
('Mesero', 'Toma pedidos y atiende mesas'),
('Caja', 'Cobra pedidos y registra gastos'),
('Cocina', 'Prepara pedidos y controla inventario');

INSERT INTO permisos (clave, nombre, descripcion) VALUES
('mesero', 'Modulo Mesero', 'Acceso a mesas y pedidos'),
('caja', 'Modulo Caja', 'Acceso a cobros, gastos y compras'),
('cocina', 'Modulo Cocina', 'Acceso a preparacion, menu e inventario'),
('admin', 'Modulo Admin', 'Acceso a panel administrativo, usuarios y reportes');

-- Usuario admin: admin@coffeecode.com / admin123
INSERT INTO usuarios (nombre, correo, password_hash, id_rol, activo) VALUES
('Administrador Coffee Code', 'admin@coffeecode.com', crypt('admin123', gen_salt('bf')), 1, TRUE),
('Carlos Mesero', 'mesero@coffeecode.com', crypt('1234', gen_salt('bf')), 2, TRUE),
('María Caja', 'caja@coffeecode.com', crypt('1234', gen_salt('bf')), 3, TRUE),
('Juan Cocina', 'cocina@coffeecode.com', crypt('1234', gen_salt('bf')), 4, TRUE);

INSERT INTO usuario_permisos (id_usuario, id_permiso) VALUES
(1, 4),
(2, 1),
(3, 2),
(4, 3);

INSERT INTO mesas (numero_mesa)
SELECT generate_series(1, 12);

INSERT INTO categorias_producto (nombre) VALUES
('Cafes calientes'),
('Cafes frios'),
('Espresso'),
('Chocolate y te'),
('Bebidas mezcladas'),
('Panaderia'),
('Postres'),
('Alimentos');

INSERT INTO categorias_gasto (nombre) VALUES
('Suministros'),
('Servicios'),
('Mantenimiento'),
('Compras'),
('Otros');

INSERT INTO proveedores (nombre, telefono, correo) VALUES
('Proveedor Central de Cafe', '4421000001', 'ventas@proveedorcafe.com'),
('Lacteos Queretaro', '4421000002', 'contacto@lacteosqro.com'),
('Panaderia La Estacion', '4421000003', 'pedidos@panestacion.com');

INSERT INTO inventario (nombre, stock_actual, stock_minimo, unidad_medida) VALUES
('Granos de cafe', 6.00, 1.00, 'kg'),
('Leche entera', 18.00, 3.00, 'l'),
('Pan croissant', 10.00, 5.00, 'pz'),
('Chocolate', 2.50, 1.00, 'kg'),
('Azucar', 4.00, 2.00, 'kg'),
('Te verde', 60.00, 15.00, 'pz'),
('Te negro', 60.00, 15.00, 'pz'),
('Matcha', 1.20, 0.30, 'kg'),
('Chai', 1.40, 0.30, 'kg'),
('Base frappe', 4.00, 1.00, 'kg'),
('Base vainilla', 2.00, 0.50, 'kg'),
('Muffin de vainilla', 14.00, 4.00, 'pz'),
('Cinnamon roll', 12.00, 4.00, 'pz'),
('Pan de chocolate', 12.00, 4.00, 'pz'),
('Brownie', 14.00, 4.00, 'pz'),
('Cheesecake', 10.00, 3.00, 'pz'),
('Galleta de avena', 20.00, 6.00, 'pz'),
('Pan sandwich', 10.00, 3.00, 'pz'),
('Bagel', 10.00, 3.00, 'pz'),
('Panini', 10.00, 3.00, 'pz'),
('Leche de avena', 8.00, 2.00, 'l'),
('Leche de almendra', 8.00, 2.00, 'l'),
('Leche de soya', 8.00, 2.00, 'l'),
('Leche de coco', 8.00, 2.00, 'l'),
('Jarabe vainilla', 3.00, 0.60, 'l'),
('Jarabe caramelo', 3.00, 0.60, 'l'),
('Jarabe avellana', 3.00, 0.60, 'l'),
('Canela', 1.00, 0.20, 'kg'),
('Crema batida', 4.00, 1.00, 'kg');

INSERT INTO productos (nombre, descripcion, precio, id_categoria, activo) VALUES
('Cafe Americano', 'Espresso con agua caliente.', 38.00, 1, TRUE),
('Capuchino', 'Espresso con leche vaporizada y espuma.', 55.00, 1, TRUE),
('Latte', 'Espresso suave con leche vaporizada.', 54.00, 1, TRUE),
('Croissant', 'Pan de mantequilla horneado.', 45.00, 6, TRUE),
('Chocolate Frio', 'Leche fria con chocolate.', 58.00, 4, TRUE),
('Espresso', 'Carga intensa de cafe espresso.', 32.00, 3, TRUE),
('Doble Espresso', 'Dos cargas de espresso intenso.', 42.00, 3, TRUE),
('Flat White', 'Espresso con leche sedosa.', 58.00, 1, TRUE),
('Mocha Caliente', 'Espresso con chocolate y leche.', 60.00, 1, TRUE),
('Iced Americano', 'Espresso con agua fria y hielo.', 42.00, 2, TRUE),
('Iced Latte', 'Espresso frio con leche.', 58.00, 2, TRUE),
('Cold Brew', 'Cafe frio de extraccion lenta.', 62.00, 2, FALSE),
('Iced Mocha', 'Cafe frio con chocolate y leche.', 64.00, 2, TRUE),
('Chocolate Caliente', 'Chocolate con leche vaporizada.', 56.00, 4, TRUE),
('Chai Latte', 'Chai especiado con leche vaporizada.', 60.00, 4, TRUE),
('Matcha Latte', 'Matcha con leche vaporizada.', 64.00, 4, TRUE),
('Te Verde', 'Infusion ligera de te verde.', 36.00, 4, TRUE),
('Te Negro', 'Infusion clasica de te negro.', 36.00, 4, TRUE),
('Frappe Cafe', 'Bebida mezclada con cafe.', 68.00, 5, TRUE),
('Frappe Chocolate', 'Bebida mezclada con chocolate.', 70.00, 5, TRUE),
('Frappe Vainilla', 'Bebida mezclada con vainilla.', 70.00, 5, TRUE),
('Muffin de Vainilla', 'Pan dulce individual.', 42.00, 6, TRUE),
('Cinnamon Roll', 'Rollo de canela glaseado.', 48.00, 6, TRUE),
('Pan de Chocolate', 'Pan dulce relleno de chocolate.', 46.00, 6, TRUE),
('Brownie', 'Postre de chocolate horneado.', 44.00, 7, TRUE),
('Cheesecake', 'Rebanada cremosa de queso.', 58.00, 7, TRUE),
('Galleta de Avena', 'Galleta horneada de avena.', 32.00, 7, TRUE),
('Sandwich de Pavo', 'Pan con pavo, queso y vegetales.', 72.00, 8, TRUE),
('Bagel con Queso', 'Bagel tostado con queso crema.', 58.00, 8, TRUE),
('Panini Caprese', 'Panini con queso, tomate y albahaca.', 78.00, 8, TRUE);

INSERT INTO receta (id_producto, id_insumo, cantidad_necesaria) VALUES
(1, 1, 0.018),
(2, 1, 0.018),
(2, 2, 0.150),
(3, 1, 0.018),
(3, 2, 0.120),
(4, 3, 1.000),
(5, 4, 0.020),
(5, 2, 0.100),
(6, 1, 0.018),
(7, 1, 0.036),
(8, 1, 0.018),
(8, 2, 0.130),
(9, 1, 0.018),
(9, 2, 0.120),
(9, 4, 0.018),
(10, 1, 0.018),
(11, 1, 0.018),
(11, 2, 0.140),
(12, 1, 0.025),
(13, 1, 0.018),
(13, 2, 0.120),
(13, 4, 0.018),
(14, 4, 0.030),
(14, 2, 0.180),
(15, 9, 0.025),
(15, 2, 0.180),
(16, 8, 0.018),
(16, 2, 0.180),
(17, 6, 1.000),
(18, 7, 1.000),
(19, 1, 0.018),
(19, 2, 0.140),
(19, 10, 0.045),
(20, 4, 0.030),
(20, 2, 0.140),
(20, 10, 0.045),
(21, 11, 0.035),
(21, 2, 0.160),
(21, 10, 0.040),
(22, 12, 1.000),
(23, 13, 1.000),
(24, 14, 1.000),
(25, 15, 1.000),
(26, 16, 1.000),
(27, 17, 1.000),
(28, 18, 1.000),
(29, 19, 1.000),
(30, 20, 1.000);

INSERT INTO grupos_modificador (clave, nombre, tipo_seleccion, activo, orden) VALUES
('tamano', 'Tamaño', 'single', TRUE, 1),
('temperatura', 'Temperatura', 'single', TRUE, 2),
('leche', 'Leche', 'single', TRUE, 3),
('espresso', 'Espresso', 'single', TRUE, 4),
('dulzor', 'Dulzor', 'single', TRUE, 5),
('jarabes', 'Jarabes', 'multi', TRUE, 6),
('crema', 'Crema', 'single', TRUE, 7),
('espuma', 'Espuma', 'single', TRUE, 8),
('hielo', 'Hielo', 'single', TRUE, 9),
('extras', 'Extras', 'multi', TRUE, 10);

INSERT INTO opciones_modificador (id_grupo, nombre, precio_adicional, activo, orden) VALUES
(1, 'Chico', 0.00, TRUE, 1), (1, 'Mediano', 0.00, TRUE, 2), (1, 'Grande', 10.00, TRUE, 3),
(2, 'Caliente', 0.00, TRUE, 1), (2, 'Frio', 0.00, TRUE, 2),
(3, 'Entera', 0.00, TRUE, 1), (3, 'Deslactosada', 0.00, TRUE, 2), (3, 'Light', 0.00, TRUE, 3),
(3, 'Avena', 8.00, TRUE, 4), (3, 'Almendra', 8.00, TRUE, 5), (3, 'Soya', 8.00, TRUE, 6), (3, 'Coco', 8.00, TRUE, 7),
(4, 'Normal', 0.00, TRUE, 1), (4, 'Extra shot', 12.00, TRUE, 2), (4, 'Doble extra', 22.00, TRUE, 3), (4, 'Descafeinado', 0.00, TRUE, 4),
(5, 'Sin azucar', 0.00, TRUE, 1), (5, 'Poco', 0.00, TRUE, 2), (5, 'Normal', 0.00, TRUE, 3), (5, 'Extra', 0.00, TRUE, 4),
(6, 'Vainilla', 8.00, TRUE, 1), (6, 'Caramelo', 8.00, TRUE, 2), (6, 'Avellana', 8.00, TRUE, 3),
(7, 'Normal', 0.00, TRUE, 1), (7, 'Poca', 0.00, TRUE, 2), (7, 'Sin crema', 0.00, TRUE, 3),
(8, 'Normal', 0.00, TRUE, 1), (8, 'Extra', 0.00, TRUE, 2), (8, 'Sin espuma', 0.00, TRUE, 3),
(9, 'Sin hielo', 0.00, TRUE, 1), (9, 'Poco', 0.00, TRUE, 2), (9, 'Normal', 0.00, TRUE, 3), (9, 'Extra', 0.00, TRUE, 4),
(10, 'Cold foam', 12.00, TRUE, 1), (10, 'Canela', 4.00, TRUE, 2), (10, 'Chocolate', 6.00, TRUE, 3), (10, 'Caramelo', 6.00, TRUE, 4), (10, 'Crema batida', 8.00, TRUE, 5);

INSERT INTO producto_grupo_modificador (id_producto, id_grupo, obligatorio, orden)
SELECT p.id_producto, g.id_grupo, config.obligatorio, g.orden
FROM productos p
JOIN (
    VALUES
    ('Cafes calientes', 'tamano', TRUE), ('Cafes calientes', 'temperatura', TRUE), ('Cafes calientes', 'espresso', TRUE), ('Cafes calientes', 'dulzor', TRUE), ('Cafes calientes', 'jarabes', FALSE),
    ('Cafes frios', 'tamano', TRUE), ('Cafes frios', 'temperatura', TRUE), ('Cafes frios', 'espresso', TRUE), ('Cafes frios', 'dulzor', TRUE), ('Cafes frios', 'jarabes', FALSE), ('Cafes frios', 'hielo', TRUE), ('Cafes frios', 'extras', FALSE),
    ('Espresso', 'espresso', TRUE), ('Espresso', 'dulzor', FALSE),
    ('Chocolate y te', 'tamano', TRUE), ('Chocolate y te', 'temperatura', TRUE), ('Chocolate y te', 'dulzor', TRUE), ('Chocolate y te', 'extras', FALSE),
    ('Bebidas mezcladas', 'tamano', TRUE), ('Bebidas mezcladas', 'dulzor', TRUE), ('Bebidas mezcladas', 'crema', FALSE), ('Bebidas mezcladas', 'extras', FALSE)
) AS config(categoria, grupo_clave, obligatorio) ON TRUE
JOIN categorias_producto c ON c.id_categoria = p.id_categoria AND c.nombre = config.categoria
JOIN grupos_modificador g ON g.clave = config.grupo_clave
WHERE c.nombre IN ('Cafes calientes', 'Cafes frios', 'Espresso', 'Chocolate y te', 'Bebidas mezcladas');

INSERT INTO producto_grupo_modificador (id_producto, id_grupo, obligatorio, orden)
SELECT p.id_producto, g.id_grupo, TRUE, g.orden
FROM productos p
JOIN grupos_modificador g ON g.clave = 'leche'
WHERE p.nombre IN ('Capuchino', 'Latte', 'Flat White', 'Mocha Caliente', 'Iced Latte', 'Iced Mocha', 'Chocolate Frio', 'Chocolate Caliente', 'Chai Latte', 'Matcha Latte');

INSERT INTO producto_grupo_modificador (id_producto, id_grupo, obligatorio, orden)
SELECT p.id_producto, g.id_grupo, FALSE, g.orden
FROM productos p
JOIN grupos_modificador g ON g.clave = 'espuma'
WHERE p.nombre IN ('Capuchino', 'Latte', 'Flat White', 'Mocha Caliente', 'Chai Latte', 'Matcha Latte');

INSERT INTO producto_opcion_modificador (id_producto, id_opcion, es_default, orden)
SELECT pg.id_producto, o.id_opcion,
       ((g.clave = 'tamano' AND o.nombre = 'Mediano')
        OR (g.clave = 'temperatura' AND ((c.nombre IN ('Cafes calientes', 'Espresso') AND o.nombre = 'Caliente') OR (c.nombre IN ('Cafes frios', 'Bebidas mezcladas') AND o.nombre = 'Frio') OR (c.nombre = 'Chocolate y te' AND o.nombre = CASE WHEN p.nombre = 'Chocolate Frio' THEN 'Frio' ELSE 'Caliente' END)))
        OR (g.clave = 'leche' AND o.nombre = 'Entera')
        OR (g.clave = 'espresso' AND o.nombre = 'Normal')
        OR (g.clave = 'dulzor' AND o.nombre = 'Normal')
        OR (g.clave = 'crema' AND o.nombre = 'Normal')
        OR (g.clave = 'espuma' AND o.nombre = 'Normal')
        OR (g.clave = 'hielo' AND o.nombre = 'Normal')) AS es_default,
       o.orden
FROM producto_grupo_modificador pg
JOIN productos p ON p.id_producto = pg.id_producto
JOIN categorias_producto c ON c.id_categoria = p.id_categoria
JOIN grupos_modificador g ON g.id_grupo = pg.id_grupo
JOIN opciones_modificador o ON o.id_grupo = g.id_grupo
WHERE NOT (g.clave = 'temperatura' AND c.nombre = 'Cafes calientes' AND o.nombre = 'Frio')
  AND NOT (g.clave = 'temperatura' AND c.nombre = 'Espresso' AND o.nombre = 'Frio')
  AND NOT (g.clave = 'temperatura' AND c.nombre = 'Cafes frios' AND o.nombre = 'Caliente')
  AND NOT (g.clave = 'temperatura' AND c.nombre = 'Bebidas mezcladas' AND o.nombre = 'Caliente');

INSERT INTO opcion_modificador_inventario (id_opcion, id_insumo, cantidad_adicional)
SELECT o.id_opcion, i.id_insumo, data.cantidad
FROM (
    VALUES
    ('Extra shot', 'Granos de cafe', 0.018), ('Doble extra', 'Granos de cafe', 0.036),
    ('Avena', 'Leche de avena', 0.120), ('Almendra', 'Leche de almendra', 0.120), ('Soya', 'Leche de soya', 0.120), ('Coco', 'Leche de coco', 0.120),
    ('Vainilla', 'Jarabe vainilla', 0.025), ('Avellana', 'Jarabe avellana', 0.025),
    ('Cold foam', 'Leche entera', 0.080), ('Canela', 'Canela', 0.005), ('Chocolate', 'Chocolate', 0.012), ('Caramelo', 'Jarabe caramelo', 0.025), ('Crema batida', 'Crema batida', 0.030)
) AS data(opcion, insumo, cantidad)
JOIN opciones_modificador o ON o.nombre = data.opcion
JOIN inventario i ON i.nombre = data.insumo;

INSERT INTO pedidos (id_mesa, id_mesero, estado) VALUES
(3, 2, 'pendiente'),
(5, 2, 'entregado');

INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario, observaciones) VALUES
(1, 2, 1, 55.00, 'Sin canela'),
(1, 4, 2, 45.00, NULL),
(2, 1, 2, 38.00, NULL),
(2, 5, 1, 58.00, 'Con poco hielo');

INSERT INTO pagos (id_pedido, metodo_pago, monto) VALUES
(2, 'efectivo', 134.00);

INSERT INTO gastos (id_usuario, concepto, id_categoria_gasto, monto, fecha_gasto) VALUES
(3, 'Pago de luz', 2, 450.00, CURRENT_DATE),
(3, 'Mantenimiento cafetera', 3, 300.00, CURRENT_DATE);

INSERT INTO compras (id_usuario, id_proveedor, estado) VALUES
(3, 1, 'registrada');

INSERT INTO detalle_compra (id_compra, id_insumo, cantidad, costo_unitario) VALUES
(1, 1, 2.00, 280.00),
(1, 5, 3.00, 30.00);
