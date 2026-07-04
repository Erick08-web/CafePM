from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.base_datos import obtener_sesion
from app.servicios.consultas import listar_diccionarios

router = APIRouter(prefix="/reportes", tags=["Reportes"])


@router.get("/pedidos")
def reporte_pedidos(sesion: Session = Depends(obtener_sesion)):
    return listar_diccionarios(
        sesion,
        """
        SELECT pe.id_pedido, pe.fecha_hora, pe.estado, pe.total,
               m.numero_mesa, u.nombre AS mesero
        FROM pedidos pe
        LEFT JOIN mesas m ON m.id_mesa = pe.id_mesa
        LEFT JOIN usuarios u ON u.id_usuario = pe.id_mesero
        ORDER BY pe.fecha_hora DESC
        """,
    )


@router.get("/inventario")
def reporte_inventario(sesion: Session = Depends(obtener_sesion)):
    return listar_diccionarios(sesion, "SELECT * FROM inventario ORDER BY nombre")


@router.get("/productos")
def reporte_productos(sesion: Session = Depends(obtener_sesion)):
    return listar_diccionarios(
        sesion,
        """
        SELECT p.*, c.nombre AS categoria
        FROM productos p
        LEFT JOIN categorias_producto c ON c.id_categoria = p.id_categoria
        ORDER BY c.nombre, p.nombre
        """,
    )
