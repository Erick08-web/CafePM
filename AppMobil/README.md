# AppMobil

Aplicacion movil de Coffee Code construida con React Native + Expo.

## Modulos principales

- Mesero: mesas y menu activo.
- Cocina: pedidos pendientes e inventario bajo.
- Caja: resumen monetario y cuentas pendientes.

La app consume los endpoints reales de `ApiBackend`.

## Configuracion de API

Por defecto usa:

```env
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

Si pruebas en un telefono fisico con Expo Go, cambia esa URL por la IP local de tu Mac, por ejemplo:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.50:8000
```

## Ejecutar

```bash
npm install
npm start
```

Despues escanea el QR con Expo Go.
