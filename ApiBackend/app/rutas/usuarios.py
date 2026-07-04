from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.base_datos import obtener_sesion
from app.servicios.consultas import listar_diccionarios, obtener_diccionario

router = APIRouter(prefix="/usuarios", tags=["Usuarios y roles"])


class UsuarioCrear(BaseModel):
    nombre: str
    correo: EmailStr
    password: str
    id_rol: int
    permisos: list[int] = []


class UsuarioActualizar(BaseModel):
    nombre: str | None = None
    id_rol: int | None = None
    activo: bool | None = None
    permisos: list[int] | None = None


@router.get("")
def listar_usuarios(sesion: Session = Depends(obtener_sesion)):
    return listar_diccionarios(
        sesion,
        """
        SELECT u.id_usuario, u.nombre, u.correo, u.activo, u.fecha_creacion,
               r.id_rol, r.nombre AS rol
        FROM usuarios u
        JOIN roles r ON r.id_rol = u.id_rol
        ORDER BY u.id_usuario
        """,
    )


@router.get("/{id_usuario}")
def obtener_usuario(id_usuario: int, sesion: Session = Depends(obtener_sesion)):
    usuario = obtener_diccionario(
        sesion,
        """
        SELECT u.id_usuario, u.nombre, u.correo, u.activo, u.fecha_creacion,
               r.id_rol, r.nombre AS rol
        FROM usuarios u
        JOIN roles r ON r.id_rol = u.id_rol
        WHERE u.id_usuario = :id_usuario
        """,
        {"id_usuario": id_usuario},
    )
    if usuario is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    usuario["permisos"] = listar_diccionarios(
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
    return usuario


@router.post("", status_code=status.HTTP_201_CREATED)
def crear_usuario(datos: UsuarioCrear, sesion: Session = Depends(obtener_sesion)):
    existente = obtener_diccionario(
        sesion,
        "SELECT id_usuario FROM usuarios WHERE correo = :correo",
        {"correo": datos.correo},
    )
    if existente:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El correo ya esta registrado")

    usuario = obtener_diccionario(
        sesion,
        """
        INSERT INTO usuarios (nombre, correo, password_hash, id_rol)
        VALUES (:nombre, :correo, crypt(:password, gen_salt('bf')), :id_rol)
        RETURNING id_usuario, nombre, correo, id_rol, activo, fecha_creacion
        """,
        datos.model_dump(exclude={"permisos"}),
    )

    for id_permiso in datos.permisos:
        sesion.execute(
            text("INSERT INTO usuario_permisos (id_usuario, id_permiso) VALUES (:id_usuario, :id_permiso) ON CONFLICT DO NOTHING"),
            {"id_usuario": usuario["id_usuario"], "id_permiso": id_permiso},
        )
    sesion.commit()
    return usuario


@router.put("/{id_usuario}")
def actualizar_usuario(id_usuario: int, datos: UsuarioActualizar, sesion: Session = Depends(obtener_sesion)):
    usuario = obtener_diccionario(sesion, "SELECT * FROM usuarios WHERE id_usuario = :id_usuario", {"id_usuario": id_usuario})
    if usuario is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    valores = datos.model_dump(exclude_unset=True, exclude={"permisos"})
    if valores:
        asignaciones = ", ".join(f"{campo} = :{campo}" for campo in valores)
        valores["id_usuario"] = id_usuario
        sesion.execute(text(f"UPDATE usuarios SET {asignaciones} WHERE id_usuario = :id_usuario"), valores)

    if datos.permisos is not None:
        sesion.execute(text("DELETE FROM usuario_permisos WHERE id_usuario = :id_usuario"), {"id_usuario": id_usuario})
        for id_permiso in datos.permisos:
            sesion.execute(
                text("INSERT INTO usuario_permisos (id_usuario, id_permiso) VALUES (:id_usuario, :id_permiso)"),
                {"id_usuario": id_usuario, "id_permiso": id_permiso},
            )
    sesion.commit()
    return obtener_usuario(id_usuario, sesion)
