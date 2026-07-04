# WebAdmin

Aplicacion web administrativa de Coffee Code construida con Flask.

## Modulos incluidos

- Dashboard con resumen financiero.
- Gestion de usuarios y roles.
- Alta de usuarios con permisos por modulo.
- Estadisticas de gastos, ganancias, productos vendidos y pedidos.
- Reportes de pedidos, inventario y productos.
- Vistas de apoyo para Cocina y Caja.

## Requisitos

La API debe estar corriendo en `http://localhost:8000` y PostgreSQL debe estar activo con Docker.

```bash
cd ApiBackend
source .venv/bin/activate
uvicorn app.main:app --reload
```

En otra terminal:

```bash
cd WebAdmin
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Variables opcionales:

```env
FLASK_SECRET_KEY=replace-with-a-secret-key
API_BASE_URL=http://localhost:8000
```
