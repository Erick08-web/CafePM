from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.base_datos import obtener_sesion
from app.servicios.consultas import listar_diccionarios, obtener_diccionario

router = APIRouter(prefix="/cocina", tags=["Modulo Cocina"])


class EstadoPedidoActualizar(BaseModel):
    estado: str


@router.get("/pedidos")
def listar_pedidos_cocina(sesion: Session = Depends(obtener_sesion)):
    pedidos = listar_diccionarios(
        sesion,
        """
        SELECT pe.id_pedido, pe.id_mesa, m.numero_mesa, pe.fecha_hora, pe.estado, pe.total
        FROM pedidos pe
        LEFT JOIN mesas m ON m.id_mesa = pe.id_mesa
        WHERE pe.estado IN ('pendiente', 'en_preparacion', 'listo')
        ORDER BY pe.fecha_hora
        """,
    )
    for pedido in pedidos:
        pedido["detalle"] = listar_diccionarios(
            sesion,
            """
            SELECT dp.id_detalle, p.nombre, dp.cantidad, dp.observaciones
            FROM detalle_pedido dp
            JOIN productos p ON p.id_producto = dp.id_producto
            WHERE dp.id_pedido = :id_pedido
            ORDER BY dp.id_detalle
            """,
            {"id_pedido": pedido["id_pedido"]},
        )
    return pedidos


@router.patch("/pedidos/{id_pedido}/estado")
def actualizar_estado_pedido(id_pedido: int, datos: EstadoPedidoActualizar, sesion: Session = Depends(obtener_sesion)):
    if datos.estado not in {"pendiente", "en_preparacion", "listo", "entregado", "cancelado"}:
        raise HTTPException(status_code=400, detail="Estado no valido para cocina")

    pedido = obtener_diccionario(
        sesion,
        "UPDATE pedidos SET estado = :estado WHERE id_pedido = :id_pedido RETURNING *",
        {"estado": datos.estado, "id_pedido": id_pedido},
    )
    if pedido is None:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    sesion.commit()
    return pedido


@router.get("/inventario")
def listar_inventario(sesion: Session = Depends(obtener_sesion)):
    return listar_diccionarios(sesion, "SELECT * FROM inventario ORDER BY nombre")


@router.get("/inventario-bajo")
def listar_inventario_bajo(sesion: Session = Depends(obtener_sesion)):
    return listar_diccionarios(sesion, "SELECT * FROM vw_inventario_bajo ORDER BY nombre")


@router.get("/menu")
def listar_menu(sesion: Session = Depends(obtener_sesion)):
    return listar_diccionarios(
        sesion,
        """
        SELECT p.id_producto, p.nombre, p.descripcion, p.precio, p.activo,
               c.nombre AS categoria
        FROM productos p
        LEFT JOIN categorias_producto c ON c.id_categoria = p.id_categoria
        ORDER BY c.nombre, p.nombre
        """,
    )
