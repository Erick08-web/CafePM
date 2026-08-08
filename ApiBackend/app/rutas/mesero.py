from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.base_datos import obtener_sesion
from app.seguridad import requerir_permisos
from app.servicios.consultas import listar_diccionarios, obtener_diccionario

router = APIRouter(prefix="/mesero", tags=["Modulo Mesero"])


class DetallePedidoCrear(BaseModel):
    id_producto: int
    cantidad: int = Field(gt=0)
    observaciones: str | None = None


class PedidoCrear(BaseModel):
    id_mesa: int
    id_mesero: int
    productos: list[DetallePedidoCrear] = Field(min_length=1)


@router.get("/mesas")
def listar_mesas(
    sesion: Session = Depends(obtener_sesion),
    usuario=Depends(requerir_permisos("mesero", "caja")),
):
    return listar_diccionarios(sesion, "SELECT * FROM mesas ORDER BY numero_mesa")


@router.get("/productos")
def listar_productos(
    sesion: Session = Depends(obtener_sesion),
    usuario=Depends(requerir_permisos("mesero")),
):
    return listar_diccionarios(
        sesion,
        """
        SELECT p.id_producto, p.nombre, p.descripcion, p.precio, p.activo,
               c.nombre AS categoria
        FROM productos p
        LEFT JOIN categorias_producto c ON c.id_categoria = p.id_categoria
        WHERE p.activo = TRUE
        ORDER BY c.nombre, p.nombre
        """,
    )


@router.post("/pedidos", status_code=status.HTTP_201_CREATED)
def crear_pedido(
    datos: PedidoCrear,
    sesion: Session = Depends(obtener_sesion),
    usuario=Depends(requerir_permisos("mesero")),
):
    if datos.id_mesero != usuario["id_usuario"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No puedes crear pedidos a nombre de otro usuario")

    mesa = obtener_diccionario(
        sesion,
        "SELECT id_mesa, estado FROM mesas WHERE id_mesa = :id_mesa",
        {"id_mesa": datos.id_mesa},
    )
    if mesa is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mesa no encontrada")
    if mesa["estado"] != "libre":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="La mesa no esta disponible para crear pedido")

    productos_validos = {}
    for item in datos.productos:
        producto = obtener_diccionario(
            sesion,
            "SELECT id_producto, precio FROM productos WHERE id_producto = :id_producto AND activo = TRUE",
            {"id_producto": item.id_producto},
        )
        if producto is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Producto {item.id_producto} no encontrado o inactivo")
        productos_validos[item.id_producto] = producto

    pedido = obtener_diccionario(
        sesion,
        """
        INSERT INTO pedidos (id_mesa, id_mesero)
        VALUES (:id_mesa, :id_mesero)
        RETURNING id_pedido, id_mesa, id_mesero, fecha_hora, estado, total
        """,
        {"id_mesa": datos.id_mesa, "id_mesero": datos.id_mesero},
    )

    for item in datos.productos:
        producto = productos_validos[item.id_producto]

        sesion.execute(
            text(
                """
                INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario, observaciones)
                VALUES (:id_pedido, :id_producto, :cantidad, :precio_unitario, :observaciones)
                """
            ),
            {
                "id_pedido": pedido["id_pedido"],
                "id_producto": item.id_producto,
                "cantidad": item.cantidad,
                "precio_unitario": producto["precio"],
                "observaciones": item.observaciones,
            },
        )

    sesion.commit()
    return obtener_diccionario(sesion, "SELECT * FROM pedidos WHERE id_pedido = :id_pedido", {"id_pedido": pedido["id_pedido"]})


@router.get("/pedidos/{id_pedido}")
def obtener_pedido(
    id_pedido: int,
    sesion: Session = Depends(obtener_sesion),
    usuario=Depends(requerir_permisos("mesero", "caja")),
):
    pedido = obtener_diccionario(sesion, "SELECT * FROM pedidos WHERE id_pedido = :id_pedido", {"id_pedido": id_pedido})
    if pedido is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido no encontrado")
    pedido["detalle"] = listar_diccionarios(
        sesion,
        """
        SELECT dp.id_detalle, dp.id_producto, p.nombre, dp.cantidad, dp.precio_unitario,
               dp.subtotal, dp.observaciones
        FROM detalle_pedido dp
        JOIN productos p ON p.id_producto = dp.id_producto
        WHERE dp.id_pedido = :id_pedido
        ORDER BY dp.id_detalle
        """,
        {"id_pedido": id_pedido},
    )
    return pedido
