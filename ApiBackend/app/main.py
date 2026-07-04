from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.base_datos import probar_conexion
from app.rutas import auth, caja, catalogos, cocina, estadisticas, mesero, reportes, usuarios

app = FastAPI(
    title="Coffee Code API",
    description="API para cafeteria: web admin, cocina, caja y mesero.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(catalogos.router)
app.include_router(usuarios.router)
app.include_router(mesero.router)
app.include_router(cocina.router)
app.include_router(caja.router)
app.include_router(estadisticas.router)
app.include_router(reportes.router)


@app.get("/health")
def health_check():
    return {"status": "ok", "project": "Coffee Code"}


@app.get("/health/db")
def health_check_db():
    probar_conexion()
    return {"status": "ok", "database": "connected"}
