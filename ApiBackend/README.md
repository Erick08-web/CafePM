# ApiBackend

API REST principal del proyecto Coffee Code.

Tecnologia solicitada por la documentacion:

- Python
- FastAPI
- PostgreSQL

## Responsabilidades

- Autenticacion y roles.
- Usuarios y permisos.
- Modulo Cocina: menu, inventario, pedidos pendientes y estados.
- Modulo Caja: cobros, gastos, compras y resumen monetario.
- Modulo Mesero: mesas, levantamiento de pedidos y consulta de estado.
- Estadisticas y reportes para WebAdmin.

## Ejecutar en desarrollo

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
