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
('Bebidas'),
('Alimentos'),
('Postres');

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
('Granos de cafe', 4.50, 1.00, 'kg'),
('Leche entera', 12.00, 3.00, 'l'),
('Pan croissant', 8.00, 5.00, 'pz'),
('Chocolate', 0.20, 1.00, 'kg'),
('Azucar', 1.20, 2.00, 'kg');

INSERT INTO productos (nombre, descripcion, precio, id_categoria, activo) VALUES
('Cafe Americano', 'Espresso con agua caliente', 35.00, 1, TRUE),
('Capuchino', 'Espresso con leche vaporizada y espuma', 50.00, 1, TRUE),
('Cafe con Leche', 'Espresso con leche vaporizada', 45.00, 1, TRUE),
('Croissant', 'Pan de mantequilla', 45.00, 2, TRUE),
('Chocolate Frio', 'Leche con chocolate y hielo', 55.00, 1, TRUE);

INSERT INTO receta (id_producto, id_insumo, cantidad_necesaria) VALUES
(1, 1, 0.018),
(2, 1, 0.018),
(2, 2, 0.150),
(3, 1, 0.018),
(3, 2, 0.120),
(4, 3, 1.000),
(5, 4, 0.020),
(5, 2, 0.100);

INSERT INTO pedidos (id_mesa, id_mesero, estado) VALUES
(3, 2, 'pendiente'),
(5, 2, 'entregado');

INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario, observaciones) VALUES
(1, 2, 1, 50.00, 'Sin canela'),
(1, 4, 2, 45.00, NULL),
(2, 1, 2, 35.00, NULL),
(2, 5, 1, 55.00, 'Con poco hielo');

INSERT INTO pagos (id_pedido, metodo_pago, monto) VALUES
(2, 'efectivo', 125.00);

INSERT INTO gastos (id_usuario, concepto, id_categoria_gasto, monto, fecha_gasto) VALUES
(3, 'Pago de luz', 2, 450.00, CURRENT_DATE),
(3, 'Mantenimiento cafetera', 3, 300.00, CURRENT_DATE);

INSERT INTO compras (id_usuario, id_proveedor, estado) VALUES
(3, 1, 'registrada');

INSERT INTO detalle_compra (id_compra, id_insumo, cantidad, costo_unitario) VALUES
(1, 1, 2.00, 280.00),
(1, 5, 3.00, 30.00);
