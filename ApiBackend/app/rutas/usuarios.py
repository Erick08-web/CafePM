from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.base_datos import obtener_sesion
from app.seguridad import requerir_permisos
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
    correo: EmailStr | None = None
    password: str | None = None
    id_rol: int | None = None
    activo: bool | None = None
    permisos: list[int] | None = None


@router.get("")
def listar_usuarios(
    sesion: Session = Depends(obtener_sesion),
    usuario_actual=Depends(requerir_permisos("admin")),
):
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
def obtener_usuario(
    id_usuario: int,
    sesion: Session = Depends(obtener_sesion),
    usuario_actual=Depends(requerir_permisos("admin")),
):
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
def crear_usuario(
    datos: UsuarioCrear,
    sesion: Session = Depends(obtener_sesion),
    usuario_actual=Depends(requerir_permisos("admin")),
):
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
def actualizar_usuario(
    id_usuario: int,
    datos: UsuarioActualizar,
    sesion: Session = Depends(obtener_sesion),
    usuario_actual=Depends(requerir_permisos("admin")),
):
    usuario = obtener_diccionario(sesion, "SELECT * FROM usuarios WHERE id_usuario = :id_usuario", {"id_usuario": id_usuario})
    if usuario is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    if datos.correo is not None:
        existente = obtener_diccionario(
            sesion,
            """
            SELECT id_usuario
            FROM usuarios
            WHERE correo = :correo AND id_usuario <> :id_usuario
            """,
            {"correo": datos.correo, "id_usuario": id_usuario},
        )
        if existente:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El correo ya esta registrado")

    valores = datos.model_dump(exclude_unset=True, exclude={"permisos", "password"})
    if valores:
        asignaciones = ", ".join(f"{campo} = :{campo}" for campo in valores)
        valores["id_usuario"] = id_usuario
        sesion.execute(text(f"UPDATE usuarios SET {asignaciones} WHERE id_usuario = :id_usuario"), valores)

    if datos.password:
        sesion.execute(
            text(
                """
                UPDATE usuarios
                SET password_hash = crypt(:password, gen_salt('bf'))
                WHERE id_usuario = :id_usuario
                """
            ),
            {"password": datos.password, "id_usuario": id_usuario},
        )

    if datos.permisos is not None:
        sesion.execute(text("DELETE FROM usuario_permisos WHERE id_usuario = :id_usuario"), {"id_usuario": id_usuario})
        for id_permiso in datos.permisos:
            sesion.execute(
                text("INSERT INTO usuario_permisos (id_usuario, id_permiso) VALUES (:id_usuario, :id_permiso)"),
                {"id_usuario": id_usuario, "id_permiso": id_permiso},
            )
    sesion.commit()
    return obtener_usuario(id_usuario, sesion)


@router.delete("/{id_usuario}")
def eliminar_usuario(
    id_usuario: int,
    sesion: Session = Depends(obtener_sesion),
    usuario_actual=Depends(requerir_permisos("admin")),
):
    usuario = obtener_diccionario(
        sesion,
        """
        SELECT u.id_usuario, u.activo, r.nombre AS rol
        FROM usuarios u
        JOIN roles r ON r.id_rol = u.id_rol
        WHERE u.id_usuario = :id_usuario
        """,
        {"id_usuario": id_usuario},
    )
    if usuario is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    if not usuario["activo"]:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El usuario ya esta inactivo")

    if usuario["rol"].lower() == "admin":
        administradores = obtener_diccionario(
            sesion,
            """
            SELECT COUNT(*) AS total
            FROM usuarios u
            JOIN roles r ON r.id_rol = u.id_rol
            WHERE LOWER(r.nombre) = 'admin' AND u.activo = TRUE
            """,
        )
        if administradores["total"] <= 1:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="No se puede eliminar al ultimo administrador activo",
            )

    sesion.execute(
        text("UPDATE usuarios SET activo = FALSE WHERE id_usuario = :id_usuario"),
        {"id_usuario": id_usuario},
    )
    sesion.commit()
    return {"mensaje": "Usuario eliminado correctamente", "id_usuario": id_usuario}
