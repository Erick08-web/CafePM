# Coffee Code / CafePM

Sistema integral de administracion de cafeteria preparado para el tercer parcial.

## Arquitectura

- **BaseDatos**: PostgreSQL 16 con esquema, triggers, vistas y datos semilla.
- **ApiBackend**: FastAPI con JWT, roles, permisos y reglas de negocio.
- **WebAdmin**: Flask + templates para administracion protegida.
- **AppMobil**: Expo + React Native + TypeScript para Mesero, Cocina, Caja y Admin.
- **Postman**: coleccion con login y Bearer Token.

## Requisitos

- Docker Desktop abierto.
- Python 3.11 o superior.
- Node.js y npm.
- Expo Go para telefono fisico.

## Variables de entorno

ApiBackend:

```env
DATABASE_URL=postgresql+psycopg://coffee_user:coffee_pass@localhost:5432/coffee_code_db
JWT_SECRET_KEY=replace-with-a-real-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=120
CORS_ORIGINS=["*"]
```

WebAdmin:

```env
FLASK_SECRET_KEY=replace-with-a-real-secret
API_BASE_URL=http://127.0.0.1:8000
```

AppMobil:

```env
EXPO_PUBLIC_API_BASE_URL=http://TU_IP_LOCAL:8000
```

`127.0.0.1` funciona para simulador/web en el mismo equipo. En telefono fisico con Expo Go se debe usar la IP LAN del Mac.

## Levantar el sistema

1. PostgreSQL:

```bash
docker compose up -d postgres
```

2. ApiBackend:

```bash
cd ApiBackend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Para telefono fisico en red local:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

3. WebAdmin:

```bash
cd WebAdmin
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
API_BASE_URL=http://127.0.0.1:8000 python app.py
```

4. AppMobil:

```bash
cd AppMobil
npm install --no-audit --no-fund
EXPO_PUBLIC_API_BASE_URL=http://TU_IP_LOCAL:8000 npm start
```

En macOS puedes obtener la IP LAN con:

```bash
ipconfig getifaddr en0
```

Si usas Ethernet, prueba:

```bash
ipconfig getifaddr en1
```

## URLs

- API: `http://127.0.0.1:8000`
- API Docs: `http://127.0.0.1:8000/docs`
- WebAdmin: `http://127.0.0.1:5000/login`

## Credenciales de revision

| Rol | Correo | Contrasena |
| --- | --- | --- |
| Admin | admin@coffeecode.com | admin123 |
| Mesero | mesero@coffeecode.com | 1234 |
| Cocina | cocina@coffeecode.com | 1234 |
| Caja | caja@coffeecode.com | 1234 |

## Flujo principal de demostracion

1. Login Mesero en AppMobil.
2. Crear pedido en una mesa libre con productos reales.
3. Login Cocina y avanzar `pendiente -> en_preparacion -> listo`.
4. Login Caja y cobrar la cuenta.
5. Verificar pedido `pagado`, mesa `libre`, inventario y resumen financiero.
6. Entrar a WebAdmin como Admin y revisar dashboard, usuarios, estadisticas, reportes, cocina y caja.

## Postman

Importa `Postman/CoffeeCode.postman_collection.json`.

1. Ejecuta `Login Admin - Capturar token`.
2. La coleccion guarda `access_token` en la variable `token`.
3. Las solicitudes protegidas usan Bearer Token automaticamente.

## Health checks

```bash
curl http://127.0.0.1:8000/health
curl http://127.0.0.1:8000/health/db
```

## Validaciones rapidas

```bash
cd AppMobil
npm run typecheck -- --pretty false
```

```bash
python3 -m compileall -q ApiBackend/app
python3 -m compileall -q WebAdmin
```

## Problemas comunes

- Si Expo Go no conecta: no uses `127.0.0.1`; usa la IP LAN del Mac y levanta Uvicorn con `--host 0.0.0.0`.
- Si WebAdmin muestra sesion expirada: vuelve a iniciar sesion en `/login`.
- Si Postman devuelve `401`: ejecuta primero `Login Admin - Capturar token`.
- Si PostgreSQL no responde: confirma que Docker Desktop este abierto y ejecuta `docker compose ps`.
