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
    modificadores: list[int] = Field(default_factory=list)


class PedidoCrear(BaseModel):
    id_mesa: int
    id_mesero: int
    productos: list[DetallePedidoCrear] = Field(min_length=1)


def listar_personalizaciones_detalle(sesion: Session, id_detalle: int):
    return listar_diccionarios(
        sesion,
        """
        SELECT id_opcion, nombre_grupo, nombre_opcion, precio_adicional
        FROM detalle_pedido_modificador
        WHERE id_detalle = :id_detalle
        ORDER BY id_detalle_modificador
        """,
        {"id_detalle": id_detalle},
    )


def validar_modificadores_producto(sesion: Session, id_producto: int, modificadores: list[int]):
    opciones = listar_diccionarios(
        sesion,
        """
        SELECT o.id_opcion, o.nombre AS nombre_opcion, o.precio_adicional,
               g.id_grupo, g.nombre AS nombre_grupo, g.tipo_seleccion,
               pg.obligatorio
        FROM producto_opcion_modificador po
        JOIN opciones_modificador o ON o.id_opcion = po.id_opcion
        JOIN grupos_modificador g ON g.id_grupo = o.id_grupo
        JOIN producto_grupo_modificador pg ON pg.id_producto = po.id_producto AND pg.id_grupo = g.id_grupo
        WHERE po.id_producto = :id_producto
          AND o.activo = TRUE
          AND g.activo = TRUE
        ORDER BY g.orden, po.orden, o.orden
        """,
        {"id_producto": id_producto},
    )
    grupos = listar_diccionarios(
        sesion,
        """
        SELECT g.id_grupo, g.nombre, g.tipo_seleccion, pg.obligatorio
        FROM producto_grupo_modificador pg
        JOIN grupos_modificador g ON g.id_grupo = pg.id_grupo
        WHERE pg.id_producto = :id_producto AND g.activo = TRUE
        """,
        {"id_producto": id_producto},
    )

    opciones_por_id = {int(opcion["id_opcion"]): opcion for opcion in opciones}
    seleccionados = [opciones_por_id.get(int(id_opcion)) for id_opcion in modificadores]

    if any(opcion is None for opcion in seleccionados):
        raise HTTPException(status_code=400, detail="Una personalizacion no esta disponible para este producto")

    por_grupo: dict[int, list[dict]] = {}
    for opcion in seleccionados:
        por_grupo.setdefault(int(opcion["id_grupo"]), []).append(opcion)

    for grupo in grupos:
        id_grupo = int(grupo["id_grupo"])
        seleccion_grupo = por_grupo.get(id_grupo, [])
        if grupo["obligatorio"] and not seleccion_grupo:
            raise HTTPException(status_code=400, detail=f"{grupo['nombre']} requerido")
        if grupo["tipo_seleccion"] == "single" and len(seleccion_grupo) > 1:
            raise HTTPException(status_code=400, detail=f"Selecciona solo una opcion en {grupo['nombre']}")

    precio_adicional = sum(float(opcion["precio_adicional"]) for opcion in seleccionados)
    return seleccionados, precio_adicional


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
        ORDER BY c.nombre, p.nombre
        """,
    )


@router.get("/productos/{id_producto}/personalizaciones")
def obtener_personalizaciones_producto(
    id_producto: int,
    sesion: Session = Depends(obtener_sesion),
    usuario=Depends(requerir_permisos("mesero")),
):
    producto = obtener_diccionario(
        sesion,
        """
        SELECT p.id_producto, p.nombre, p.descripcion, p.precio, p.activo,
               c.nombre AS categoria
        FROM productos p
        LEFT JOIN categorias_producto c ON c.id_categoria = p.id_categoria
        WHERE p.id_producto = :id_producto
        """,
        {"id_producto": id_producto},
    )
    if producto is None:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    grupos = listar_diccionarios(
        sesion,
        """
        SELECT g.id_grupo, g.clave, g.nombre, g.tipo_seleccion, pg.obligatorio, pg.orden
        FROM producto_grupo_modificador pg
        JOIN grupos_modificador g ON g.id_grupo = pg.id_grupo
        WHERE pg.id_producto = :id_producto AND g.activo = TRUE
        ORDER BY pg.orden, g.orden
        """,
        {"id_producto": id_producto},
    )
    for grupo in grupos:
        grupo["opciones"] = listar_diccionarios(
            sesion,
            """
            SELECT o.id_opcion, o.nombre, o.precio_adicional, po.es_default
            FROM producto_opcion_modificador po
            JOIN opciones_modificador o ON o.id_opcion = po.id_opcion
            WHERE po.id_producto = :id_producto
              AND o.id_grupo = :id_grupo
              AND o.activo = TRUE
            ORDER BY po.orden, o.orden
            """,
            {"id_producto": id_producto, "id_grupo": grupo["id_grupo"]},
        )
    return {"producto": producto, "grupos": grupos}


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

    productos_validos = []
    modificadores_por_linea = []
    for item in datos.productos:
        producto = obtener_diccionario(
            sesion,
            "SELECT id_producto, precio FROM productos WHERE id_producto = :id_producto AND activo = TRUE",
            {"id_producto": item.id_producto},
        )
        if producto is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Producto {item.id_producto} no encontrado o inactivo")
        productos_validos.append(producto)
        modificadores_por_linea.append(validar_modificadores_producto(sesion, item.id_producto, item.modificadores))

    pedido = obtener_diccionario(
        sesion,
        """
        INSERT INTO pedidos (id_mesa, id_mesero)
        VALUES (:id_mesa, :id_mesero)
        RETURNING id_pedido, id_mesa, id_mesero, fecha_hora, estado, total
        """,
        {"id_mesa": datos.id_mesa, "id_mesero": datos.id_mesero},
    )

    for index, item in enumerate(datos.productos):
        producto = productos_validos[index]
        modificadores, precio_adicional = modificadores_por_linea[index]
        precio_unitario = float(producto["precio"]) + precio_adicional

        detalle = obtener_diccionario(
            sesion,
            """
            INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario, observaciones)
            VALUES (:id_pedido, :id_producto, :cantidad, :precio_unitario, :observaciones)
            RETURNING id_detalle
            """,
            {
                "id_pedido": pedido["id_pedido"],
                "id_producto": item.id_producto,
                "cantidad": item.cantidad,
                "precio_unitario": precio_unitario,
                "observaciones": item.observaciones,
            },
        )
        for modificador in modificadores:
            sesion.execute(
                text(
                    """
                    INSERT INTO detalle_pedido_modificador (id_detalle, id_opcion, nombre_grupo, nombre_opcion, precio_adicional)
                    VALUES (:id_detalle, :id_opcion, :nombre_grupo, :nombre_opcion, :precio_adicional)
                    """
                ),
                {
                    "id_detalle": detalle["id_detalle"],
                    "id_opcion": modificador["id_opcion"],
                    "nombre_grupo": modificador["nombre_grupo"],
                    "nombre_opcion": modificador["nombre_opcion"],
                    "precio_adicional": modificador["precio_adicional"],
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
    for detalle in pedido["detalle"]:
        detalle["personalizaciones"] = listar_personalizaciones_detalle(sesion, detalle["id_detalle"])
    return pedido
