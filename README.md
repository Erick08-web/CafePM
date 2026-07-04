# Coffee Code

Proyecto de segundo parcial para Programacion Movil.

Coffee Code es un sistema para la administracion de una cafeteria. Incluye backend API, web administrativa, app movil y base de datos PostgreSQL.

## Modulos de la entrega

- **BaseDatos**: PostgreSQL con Docker, esquema, triggers, vistas y datos semilla.
- **ApiBackend**: API REST con FastAPI para WebAdmin y AppMobil.
- **WebAdmin**: panel Flask para usuarios, roles, estadisticas y reportes.
- **AppMobil**: app Expo/React Native para Mesero, Cocina y Caja.
- **Postman**: coleccion para probar los endpoints principales.
- **Documentacion**: plan, checklist, comandos y evidencias.

## Estructura

```txt
CafePM/
├── docker-compose.yml
├── .env.example
├── BaseDatos/
├── ApiBackend/
├── WebAdmin/
├── AppMobil/
├── Postman/
└── Documentacion/
```

## Requisitos

- Docker Desktop abierto.
- Python 3.11 o superior.
- Node.js y npm.
- Expo Go en el telefono para probar la app movil.

## 1. Levantar PostgreSQL

Desde la raiz del proyecto:

```bash
docker compose up -d postgres
```

La base se crea automaticamente con los scripts de `BaseDatos/init`.

Datos locales:

```env
POSTGRES_DB=coffee_code_db
POSTGRES_USER=coffee_user
POSTGRES_PASSWORD=coffee_pass
DATABASE_URL=postgresql://coffee_user:coffee_pass@localhost:5432/coffee_code_db
```

## 2. Levantar ApiBackend

```bash
cd ApiBackend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API local:

```txt
http://127.0.0.1:8000
```

Documentacion automatica de FastAPI:

```txt
http://127.0.0.1:8000/docs
```

## 3. Levantar WebAdmin

En otra terminal:

```bash
cd WebAdmin
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Web local:

```txt
http://127.0.0.1:5000
```

## 4. Levantar AppMobil

En otra terminal:

```bash
cd AppMobil
npm install --no-audit --no-fund
npm start
```

Si pruebas en telefono fisico con Expo Go, usa la IP local de tu Mac para la API:

```bash
EXPO_PUBLIC_API_BASE_URL=http://TU_IP_LOCAL:8000 npm start
```

## Usuarios de prueba

| Rol | Correo | Password |
| --- | --- | --- |
| Admin | admin@coffeecode.com | admin123 |
| Mesero | mesero@coffeecode.com | 1234 |
| Caja | caja@coffeecode.com | 1234 |
| Cocina | cocina@coffeecode.com | 1234 |

## Endpoints principales

- `GET /health`
- `GET /health/db`
- `POST /auth/login`
- `GET /usuarios`
- `GET /mesero/mesas`
- `GET /mesero/productos`
- `GET /cocina/pedidos`
- `GET /caja/resumen`
- `GET /estadisticas/resumen`
- `GET /reportes/pedidos/pdf`
- `GET /reportes/pedidos/xlsx`

## Verificaciones rapidas

```bash
cd ApiBackend
source .venv/bin/activate
python -m compileall app
```

```bash
cd AppMobil
npm run typecheck
```

## Apagar servicios

Deten API/Web con `Ctrl + C`.

Para apagar PostgreSQL:

```bash
docker compose down
```
