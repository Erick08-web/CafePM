from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.base_datos import obtener_sesion
from app.servicios.consultas import listar_diccionarios, obtener_diccionario

router = APIRouter(prefix="/estadisticas", tags=["Estadisticas"])


@router.get("/resumen")
def obtener_resumen(sesion: Session = Depends(obtener_sesion)):
    return obtener_diccionario(sesion, "SELECT * FROM vw_resumen_financiero")


@router.get("/productos-mas-vendidos")
def productos_mas_vendidos(sesion: Session = Depends(obtener_sesion)):
    return listar_diccionarios(sesion, "SELECT * FROM vw_productos_mas_vendidos LIMIT 10")


@router.get("/gastos-por-categoria")
def gastos_por_categoria(sesion: Session = Depends(obtener_sesion)):
    return listar_diccionarios(
        sesion,
        """
        SELECT cg.nombre AS categoria, SUM(g.monto) AS total
        FROM gastos g
        JOIN categorias_gasto cg ON cg.id_categoria_gasto = g.id_categoria_gasto
        GROUP BY cg.nombre
        ORDER BY total DESC
        """,
    )


@router.get("/pedidos-por-estado")
def pedidos_por_estado(sesion: Session = Depends(obtener_sesion)):
    return listar_diccionarios(
        sesion,
        """
        SELECT estado, COUNT(*) AS total
        FROM pedidos
        GROUP BY estado
        ORDER BY estado
        """,
    )
