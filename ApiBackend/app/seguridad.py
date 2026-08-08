from datetime import UTC, datetime, timedelta
from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.base_datos import obtener_sesion
from app.configuracion import configuracion
from app.servicios.consultas import listar_diccionarios, obtener_diccionario

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def obtener_permisos_usuario(sesion: Session, id_usuario: int):
    return listar_diccionarios(
        sesion,
        """
        SELECT p.id_permiso, p.clave, p.nombre
        FROM usuario_permisos up
        JOIN permisos p ON p.id_permiso = up.id_permiso
        WHERE up.id_usuario = :id_usuario
        ORDER BY p.id_permiso
        """,
        {"id_usuario": id_usuario},
    )


def crear_token_acceso(usuario: dict[str, Any]):
    expira = datetime.now(UTC) + timedelta(minutes=configuracion.access_token_expire_minutes)
    payload = {
        "sub": str(usuario["id_usuario"]),
        "correo": usuario["correo"],
        "rol": usuario["rol"],
        "permisos": [permiso["clave"] for permiso in usuario.get("permisos", [])],
        "exp": expira,
    }
    return jwt.encode(payload, configuracion.jwt_secret_key, algorithm=configuracion.jwt_algorithm)


def usuario_tiene_permiso(usuario: dict[str, Any], permisos_requeridos: set[str]):
    rol = str(usuario.get("rol") or "").strip().lower()
    permisos = {str(permiso.get("clave") or "").strip().lower() for permiso in usuario.get("permisos", [])}
    if rol == "admin" or "admin" in permisos:
        return True
    return bool(permisos_requeridos & ({rol} | permisos))


def obtener_usuario_actual(
    token: str = Depends(oauth2_scheme),
    sesion: Session = Depends(obtener_sesion),
):
    credenciales_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token invalido o expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, configuracion.jwt_secret_key, algorithms=[configuracion.jwt_algorithm])
        id_usuario = int(payload.get("sub"))
    except (JWTError, TypeError, ValueError):
        raise credenciales_error

    usuario = obtener_diccionario(
        sesion,
        """
        SELECT u.id_usuario, u.nombre, u.correo, u.id_rol, r.nombre AS rol, u.activo
        FROM usuarios u
        JOIN roles r ON r.id_rol = u.id_rol
        WHERE u.id_usuario = :id_usuario
        """,
        {"id_usuario": id_usuario},
    )
    if usuario is None or not usuario["activo"]:
        raise credenciales_error

    usuario["permisos"] = obtener_permisos_usuario(sesion, usuario["id_usuario"])
    return usuario


def requerir_permisos(*permisos: str):
    permisos_requeridos = {permiso.strip().lower() for permiso in permisos}

    def dependencia(usuario: dict[str, Any] = Depends(obtener_usuario_actual)):
        if not usuario_tiene_permiso(usuario, permisos_requeridos):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso para acceder a este recurso")
        return usuario

    return dependencia
