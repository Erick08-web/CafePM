# Endpoints principales

## Sistema

- `GET /health`
- `GET /health/db`

## Autenticacion

- `POST /auth/login`

Ejemplo:

```json
{
  "correo": "admin@coffeecode.com",
  "password": "admin123"
}
```

## Usuarios y roles

- `GET /usuarios`
- `GET /usuarios/{id_usuario}`
- `POST /usuarios`
- `PUT /usuarios/{id_usuario}`
- `GET /catalogos/roles`
- `GET /catalogos/permisos`

## Mesero

- `GET /mesero/mesas`
- `GET /mesero/productos`
- `POST /mesero/pedidos`
- `GET /mesero/pedidos/{id_pedido}`

## Cocina

- `GET /cocina/pedidos`
- `PATCH /cocina/pedidos/{id_pedido}/estado`
- `GET /cocina/inventario`
- `GET /cocina/inventario-bajo`
- `GET /cocina/menu`

## Caja

- `GET /caja/cuentas`
- `POST /caja/pagos`
- `GET /caja/gastos`
- `POST /caja/gastos`
- `GET /caja/compras`
- `POST /caja/compras`
- `PATCH /caja/compras/{id_compra}/recibir`
- `GET /caja/resumen`

## Estadisticas

- `GET /estadisticas/resumen`
- `GET /estadisticas/productos-mas-vendidos`
- `GET /estadisticas/gastos-por-categoria`
- `GET /estadisticas/pedidos-por-estado`

## Reportes

- `GET /reportes/pedidos`
- `GET /reportes/inventario`
- `GET /reportes/productos`
- `GET /reportes/{tipo}/pdf`
- `GET /reportes/{tipo}/xlsx`

Tipos disponibles:

- `pedidos`
- `inventario`
- `productos`
