# Entrega Tercer Parcial - Coffee Code / CafePM

## Arquitectura

CafePM esta dividido en cuatro piezas desacopladas:

- AppMobil: Expo + React Native + TypeScript.
- WebAdmin: Flask + templates HTML/CSS.
- ApiBackend: FastAPI.
- BaseDatos: PostgreSQL en Docker.

## Orden de arranque

```bash
docker compose up -d postgres
```

```bash
cd ApiBackend
source .venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

```bash
cd WebAdmin
source .venv/bin/activate
API_BASE_URL=http://127.0.0.1:8000 python app.py
```

```bash
cd AppMobil
EXPO_PUBLIC_API_BASE_URL=http://TU_IP_LOCAL:8000 npm start
```

## Telefono fisico

`127.0.0.1` no funciona desde Expo Go en un telefono fisico porque apunta al telefono, no al Mac.

Usar:

```bash
ipconfig getifaddr en0
```

Despues levantar API en red local:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Y arrancar Expo:

```bash
EXPO_PUBLIC_API_BASE_URL=http://TU_IP_LOCAL:8000 npm start
```

## Flujo de demostracion

1. Login Mesero.
2. Crear pedido en mesa libre.
3. Login Cocina.
4. Cambiar pedido a `en_preparacion`.
5. Cambiar pedido a `listo`.
6. Login Caja.
7. Cobrar pedido.
8. Verificar mesa libre, pedido pagado, inventario y resumen financiero.
9. Entrar a WebAdmin con Admin y revisar dashboard/reportes/usuarios.

## Postman

Importar `Postman/CoffeeCode.postman_collection.json`.

Ejecutar primero `Login Admin - Capturar token`; la coleccion guarda el Bearer Token en la variable `token`.
