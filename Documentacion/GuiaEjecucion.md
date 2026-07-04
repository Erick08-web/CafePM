# Guia de ejecucion - Coffee Code

Esta guia sirve para levantar el proyecto completo desde cero.

## 1. Base de datos PostgreSQL

Abrir Docker Desktop y ejecutar desde la raiz del proyecto:

```bash
docker compose up -d postgres
```

Verificar estado:

```bash
docker compose ps
```

Debe aparecer `coffee_code_postgres` como `healthy`.

## 2. API Backend

```bash
cd ApiBackend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Validar en navegador:

```txt
http://127.0.0.1:8000/health
http://127.0.0.1:8000/health/db
http://127.0.0.1:8000/docs
```

## 3. WebAdmin

```bash
cd WebAdmin
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Abrir:

```txt
http://127.0.0.1:5000
```

## 4. AppMobil

```bash
cd AppMobil
npm install --no-audit --no-fund
npm start
```

Escanear QR con Expo Go.

Si se usa telefono fisico, configurar API con IP local:

```bash
EXPO_PUBLIC_API_BASE_URL=http://TU_IP_LOCAL:8000 npm start
```

## 5. Postman

Importar:

```txt
Postman/CoffeeCode.postman_collection.json
```

La variable `api_url` debe apuntar a:

```txt
http://localhost:8000
```
