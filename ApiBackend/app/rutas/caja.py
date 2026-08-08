from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.exc import IntegrityError
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.base_datos import obtener_sesion
from app.seguridad import requerir_permisos
from app.servicios.consultas import listar_diccionarios, obtener_diccionario

router = APIRouter(prefix="/caja", tags=["Modulo Caja"])


class PagoCrear(BaseModel):
    id_pedido: int
    metodo_pago: str
    monto: float = Field(gt=0)


class GastoCrear(BaseModel):
    id_usuario: int
    concepto: str
    id_categoria_gasto: int
    monto: float = Field(gt=0)


class CompraDetalleCrear(BaseModel):
    id_insumo: int
    cantidad: float = Field(gt=0)
    costo_unitario: float = Field(ge=0)


class CompraCrear(BaseModel):
    id_usuario: int
    id_proveedor: int | None = None
    detalle: list[CompraDetalleCrear] = Field(min_length=1)


@router.get("/cuentas")
def listar_cuentas_pendientes(
    sesion: Session = Depends(obtener_sesion),
    usuario=Depends(requerir_permisos("caja")),
):
    return listar_diccionarios(
        sesion,
        """
        SELECT pe.id_pedido, pe.id_mesa, m.numero_mesa, pe.fecha_hora, pe.estado, pe.total
        FROM pedidos pe
        LEFT JOIN mesas m ON m.id_mesa = pe.id_mesa
        WHERE pe.estado IN ('entregado', 'listo')
        ORDER BY pe.fecha_hora
        """,
    )


@router.post("/pagos", status_code=status.HTTP_201_CREATED)
def registrar_pago(
    datos: PagoCrear,
    sesion: Session = Depends(obtener_sesion),
    usuario=Depends(requerir_permisos("caja")),
):
    if datos.metodo_pago not in {"efectivo", "tarjeta", "transferencia"}:
        raise HTTPException(status_code=400, detail="Metodo de pago no valido")

    pedido = obtener_diccionario(
        sesion,
        "SELECT id_pedido, estado, total FROM pedidos WHERE id_pedido = :id_pedido",
        {"id_pedido": datos.id_pedido},
    )
    if pedido is None:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    if pedido["estado"] == "pagado":
        raise HTTPException(status_code=409, detail="El pedido ya fue pagado")

    if pedido["estado"] not in {"listo", "entregado"}:
        raise HTTPException(status_code=409, detail="El pedido aun no esta listo para cobro")

    if round(float(datos.monto), 2) != round(float(pedido["total"]), 2):
        raise HTTPException(status_code=400, detail="El monto debe coincidir con el total del pedido")

    try:
        pago = obtener_diccionario(
            sesion,
            """
            INSERT INTO pagos (id_pedido, metodo_pago, monto)
            VALUES (:id_pedido, :metodo_pago, :monto)
            RETURNING *
            """,
            datos.model_dump(),
        )
        sesion.commit()
        return pago
    except IntegrityError as error:
        sesion.rollback()
        raise HTTPException(status_code=409, detail="El pedido ya fue pagado") from error


@router.get("/gastos")
def listar_gastos(
    sesion: Session = Depends(obtener_sesion),
    usuario=Depends(requerir_permisos("caja", "admin")),
):
    return listar_diccionarios(
        sesion,
        """
        SELECT g.*, c.nombre AS categoria, u.nombre AS usuario
        FROM gastos g
        JOIN categorias_gasto c ON c.id_categoria_gasto = g.id_categoria_gasto
        LEFT JOIN usuarios u ON u.id_usuario = g.id_usuario
        ORDER BY g.fecha_gasto DESC, g.id_gasto DESC
        """,
    )


@router.post("/gastos", status_code=status.HTTP_201_CREATED)
def registrar_gasto(
    datos: GastoCrear,
    sesion: Session = Depends(obtener_sesion),
    usuario=Depends(requerir_permisos("caja")),
):
    if datos.id_usuario != usuario["id_usuario"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No puedes registrar gastos a nombre de otro usuario")

    gasto = obtener_diccionario(
        sesion,
        """
        INSERT INTO gastos (id_usuario, concepto, id_categoria_gasto, monto)
        VALUES (:id_usuario, :concepto, :id_categoria_gasto, :monto)
        RETURNING *
        """,
        datos.model_dump(),
    )
    sesion.commit()
    return gasto


@router.get("/compras")
def listar_compras(
    sesion: Session = Depends(obtener_sesion),
    usuario=Depends(requerir_permisos("caja", "admin")),
):
    return listar_diccionarios(
        sesion,
        """
        SELECT c.*, p.nombre AS proveedor, u.nombre AS usuario
        FROM compras c
        LEFT JOIN proveedores p ON p.id_proveedor = c.id_proveedor
        LEFT JOIN usuarios u ON u.id_usuario = c.id_usuario
        ORDER BY c.fecha_compra DESC
        """,
    )


@router.post("/compras", status_code=status.HTTP_201_CREATED)
def registrar_compra(
    datos: CompraCrear,
    sesion: Session = Depends(obtener_sesion),
    usuario=Depends(requerir_permisos("caja")),
):
    if datos.id_usuario != usuario["id_usuario"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No puedes registrar compras a nombre de otro usuario")

    compra = obtener_diccionario(
        sesion,
        """
        INSERT INTO compras (id_usuario, id_proveedor)
        VALUES (:id_usuario, :id_proveedor)
        RETURNING *
        """,
        {"id_usuario": datos.id_usuario, "id_proveedor": datos.id_proveedor},
    )
    for item in datos.detalle:
        sesion.execute(
            text(
                """
                INSERT INTO detalle_compra (id_compra, id_insumo, cantidad, costo_unitario)
                VALUES (:id_compra, :id_insumo, :cantidad, :costo_unitario)
                """
            ),
            {"id_compra": compra["id_compra"], **item.model_dump()},
        )
    sesion.commit()
    return obtener_diccionario(sesion, "SELECT * FROM compras WHERE id_compra = :id_compra", {"id_compra": compra["id_compra"]})


@router.patch("/compras/{id_compra}/recibir")
def recibir_compra(
    id_compra: int,
    sesion: Session = Depends(obtener_sesion),
    usuario=Depends(requerir_permisos("caja")),
):
    compra = obtener_diccionario(
        sesion,
        "UPDATE compras SET estado = 'recibida' WHERE id_compra = :id_compra RETURNING *",
        {"id_compra": id_compra},
    )
    if compra is None:
        raise HTTPException(status_code=404, detail="Compra no encontrada")
    sesion.commit()
    return compra


@router.get("/resumen")
def resumen_caja(
    sesion: Session = Depends(obtener_sesion),
    usuario=Depends(requerir_permisos("caja", "admin")),
):
    return obtener_diccionario(sesion, "SELECT * FROM vw_resumen_financiero")
