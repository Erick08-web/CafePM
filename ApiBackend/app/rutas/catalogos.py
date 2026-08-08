from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.base_datos import obtener_sesion
from app.seguridad import requerir_permisos
from app.servicios.consultas import listar_diccionarios

router = APIRouter(prefix="/catalogos", tags=["Catalogos"])


@router.get("/roles")
def listar_roles(sesion: Session = Depends(obtener_sesion), usuario=Depends(requerir_permisos("admin"))):
    return listar_diccionarios(sesion, "SELECT * FROM roles ORDER BY id_rol")


@router.get("/permisos")
def listar_permisos(sesion: Session = Depends(obtener_sesion), usuario=Depends(requerir_permisos("admin"))):
    return listar_diccionarios(sesion, "SELECT * FROM permisos ORDER BY id_permiso")


@router.get("/categorias-producto")
def listar_categorias_producto(sesion: Session = Depends(obtener_sesion), usuario=Depends(requerir_permisos("admin"))):
    return listar_diccionarios(sesion, "SELECT * FROM categorias_producto ORDER BY nombre")


@router.get("/categorias-gasto")
def listar_categorias_gasto(sesion: Session = Depends(obtener_sesion), usuario=Depends(requerir_permisos("admin", "caja"))):
    return listar_diccionarios(sesion, "SELECT * FROM categorias_gasto ORDER BY nombre")
