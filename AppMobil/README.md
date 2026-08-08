# AppMobil

Aplicacion movil de Coffee Code construida con React Native + Expo.

## Modulos principales

- Mesero: mesas y menu activo.
- Cocina: pedidos pendientes e inventario bajo.
- Caja: resumen monetario y cuentas pendientes.

La app consume los endpoints reales de `ApiBackend`.

## Configuracion de API

Por defecto usa `http://127.0.0.1:8000`, util para simulador o web cuando ApiBackend corre en el mismo equipo.

Para telefono fisico con Expo Go, define:

```env
EXPO_PUBLIC_API_BASE_URL=http://TU_IP_LOCAL:8000
```

En macOS puedes obtener la IP local con:

```bash
ipconfig getifaddr en0
```

Levanta ApiBackend escuchando en red local con `uvicorn app.main:app --host 0.0.0.0 --port 8000`.

## Ejecutar

```bash
npm install
EXPO_PUBLIC_API_BASE_URL=http://TU_IP_LOCAL:8000 npm start
```

Despues escanea el QR con Expo Go.
