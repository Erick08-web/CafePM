from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.base_datos import obtener_sesion
from app.configuracion import configuracion
from app.seguridad import crear_token_acceso
from app.servicios.consultas import obtener_diccionario, listar_diccionarios

router = APIRouter(prefix="/auth", tags=["Autenticacion"])


class LoginDatos(BaseModel):
    correo: EmailStr
    password: str


@router.post("/login")
def login(datos: LoginDatos, sesion: Session = Depends(obtener_sesion)):
    usuario = obtener_diccionario(
        sesion,
        """
        SELECT u.id_usuario, u.nombre, u.correo, u.id_rol, r.nombre AS rol, u.activo
        FROM usuarios u
        JOIN roles r ON r.id_rol = u.id_rol
        WHERE u.correo = :correo
          AND u.password_hash = crypt(:password, u.password_hash)
        """,
        datos.model_dump(),
    )
    if usuario is None or not usuario["activo"]:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales invalidas")

    usuario["permisos"] = listar_diccionarios(
        sesion,
        """
        SELECT p.clave, p.nombre
        FROM usuario_permisos up
        JOIN permisos p ON p.id_permiso = up.id_permiso
        WHERE up.id_usuario = :id_usuario
        ORDER BY p.id_permiso
        """,
        {"id_usuario": usuario["id_usuario"]},
    )
    token = crear_token_acceso(usuario)
    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": configuracion.access_token_expire_minutes * 60,
        "usuario": usuario,
        **usuario,
    }
