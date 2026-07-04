from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.base_datos import obtener_sesion
from app.servicios.consultas import listar_diccionarios
from app.servicios.reportes import crear_pdf, crear_xlsx

router = APIRouter(prefix="/reportes", tags=["Reportes"])


def obtener_datos_reporte(tipo: str, sesion: Session):
    if tipo == "pedidos":
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
    if tipo == "inventario":
        return listar_diccionarios(sesion, "SELECT * FROM inventario ORDER BY nombre")
    if tipo == "productos":
        return listar_diccionarios(
            sesion,
            """
            SELECT p.*, c.nombre AS categoria
            FROM productos p
            LEFT JOIN categorias_producto c ON c.id_categoria = p.id_categoria
            ORDER BY c.nombre, p.nombre
            """,
        )
    raise HTTPException(status_code=404, detail="Tipo de reporte no encontrado")


@router.get("/pedidos")
def reporte_pedidos(sesion: Session = Depends(obtener_sesion)):
    return obtener_datos_reporte("pedidos", sesion)


@router.get("/inventario")
def reporte_inventario(sesion: Session = Depends(obtener_sesion)):
    return obtener_datos_reporte("inventario", sesion)


@router.get("/productos")
def reporte_productos(sesion: Session = Depends(obtener_sesion)):
    return obtener_datos_reporte("productos", sesion)


@router.get("/{tipo}/pdf")
def descargar_reporte_pdf(tipo: str, sesion: Session = Depends(obtener_sesion)):
    datos = obtener_datos_reporte(tipo, sesion)
    archivo = crear_pdf(tipo, datos)
    return StreamingResponse(
        archivo,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=coffee_code_{tipo}.pdf"},
    )


@router.get("/{tipo}/xlsx")
def descargar_reporte_xlsx(tipo: str, sesion: Session = Depends(obtener_sesion)):
    datos = obtener_datos_reporte(tipo, sesion)
    archivo = crear_xlsx(tipo, datos)
    return StreamingResponse(
        archivo,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=coffee_code_{tipo}.xlsx"},
    )
