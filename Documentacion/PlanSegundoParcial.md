# Plan Segundo Parcial - Coffee Code

## Lo que pide la entrega

- Backend funcional del API, web y frontend movil.
- API con logica de negocio funcional y preparada para web y movil.
- Web funcional para usuarios, roles, estadisticas y reportes.
- Endpoints probados en Postman para Cocina, Caja y Mesero.
- Frontend movil con las interfaces principales de cada modulo en telefono.

## Interpretacion del frontend movil

La rubrica dice "Solo FRONTEND", pero tambien pide probar endpoints de cada modulo. Por eso la mejor estrategia es hacer pantallas moviles principales que consuman la API para mostrar informacion real:

- Mesero: mesas, crear pedido, ver estado.
- Cocina: pedidos pendientes, cambiar estado, inventario/menu.
- Caja: cuenta, pago, gastos y compras.

Si el tiempo es corto, se priorizan pantallas navegables y consumo de endpoints principales.

## Orden de construccion

1. BaseDatos y Docker.
2. ApiBackend con conexion a PostgreSQL.
3. Endpoints de auth, usuarios y roles.
4. Endpoints de Cocina, Caja y Mesero.
5. Coleccion Postman.
6. WebAdmin.
7. AppMobil.
8. Capturas y evidencias.
