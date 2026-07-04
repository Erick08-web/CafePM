# Coffee Code

Proyecto de segundo parcial para Programacion Movil.

Coffee Code es un sistema para la administracion de una cafeteria con:

- API Backend con FastAPI.
- Web administrativa con Flask.
- App movil con React Native y Expo.
- Base de datos PostgreSQL en Docker.
- Coleccion Postman para probar endpoints.

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

## Base de datos

La base de datos corre en PostgreSQL usando Docker.

```bash
docker compose up -d postgres
```

Datos de conexion local:

```env
DATABASE_URL=postgresql://coffee_user:coffee_pass@localhost:5432/coffee_code_db
```

## Orden sugerido de trabajo

1. BaseDatos y Docker.
2. ApiBackend.
3. Postman.
4. WebAdmin.
5. AppMobil.
6. Documentacion y evidencias.
