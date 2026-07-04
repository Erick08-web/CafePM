from sqlalchemy import text
from sqlalchemy.orm import Session


def listar_diccionarios(sesion: Session, consulta: str, parametros: dict | None = None):
    resultado = sesion.execute(text(consulta), parametros or {})
    return [dict(fila._mapping) for fila in resultado]


def obtener_diccionario(sesion: Session, consulta: str, parametros: dict | None = None):
    resultado = sesion.execute(text(consulta), parametros or {}).first()
    if resultado is None:
        return None
    return dict(resultado._mapping)
