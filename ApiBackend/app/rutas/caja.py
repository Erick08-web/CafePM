from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.base_datos import obtener_sesion
from app.servicios.consultas import listar_diccionarios, obtener_diccionario

router = APIRouter(prefix="/caja", tags=["Modulo Caja"])


class PagoCrear(BaseModel):
    id_pedido: int
    metodo_pago: str
    monto: float


class GastoCrear(BaseModel):
    id_usuario: int
    concepto: str
    id_categoria_gasto: int
    monto: float


class CompraDetalleCrear(BaseModel):
    id_insumo: int
    cantidad: float
    costo_unitario: float


class CompraCrear(BaseModel):
    id_usuario: int
    id_proveedor: int | None = None
    detalle: list[CompraDetalleCrear]


@router.get("/cuentas")
def listar_cuentas_pendientes(sesion: Session = Depends(obtener_sesion)):
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
def registrar_pago(datos: PagoCrear, sesion: Session = Depends(obtener_sesion)):
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


@router.get("/gastos")
def listar_gastos(sesion: Session = Depends(obtener_sesion)):
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
def registrar_gasto(datos: GastoCrear, sesion: Session = Depends(obtener_sesion)):
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
def listar_compras(sesion: Session = Depends(obtener_sesion)):
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
def registrar_compra(datos: CompraCrear, sesion: Session = Depends(obtener_sesion)):
    if not datos.detalle:
        raise HTTPException(status_code=400, detail="La compra debe tener detalle")

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
def recibir_compra(id_compra: int, sesion: Session = Depends(obtener_sesion)):
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
def resumen_caja(sesion: Session = Depends(obtener_sesion)):
    return obtener_diccionario(sesion, "SELECT * FROM vw_resumen_financiero")
