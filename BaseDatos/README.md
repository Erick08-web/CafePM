# BaseDatos

Esta carpeta contiene la base de datos PostgreSQL de Coffee Code.

## Archivos

- `init/01_Esquema.sql`: crea tipos, tablas, relaciones, triggers y vistas.
- `init/02_DatosIniciales.sql`: inserta roles, permisos, usuarios, mesas, productos e inventario inicial.

Docker ejecuta automaticamente estos scripts la primera vez que se crea el volumen de PostgreSQL.

## Levantar PostgreSQL

Desde la raiz del repo:

```bash
docker compose up -d postgres
```

## Reiniciar desde cero

Si necesitas reconstruir la base desde cero:

```bash
docker compose down -v
docker compose up -d postgres
```
