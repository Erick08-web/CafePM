from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.configuracion import configuracion

engine = create_engine(configuracion.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def obtener_sesion():
    sesion = SessionLocal()
    try:
        yield sesion
    finally:
        sesion.close()


def probar_conexion():
    with engine.connect() as conexion:
        return conexion.execute(text("SELECT 1")).scalar_one()
