from datetime import datetime
from io import BytesIO
from typing import Any

from openpyxl import Workbook
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

TITULOS_REPORTE = {
    "pedidos": "Reporte de pedidos",
    "inventario": "Reporte de inventario",
    "productos": "Reporte de productos",
}


def _normalizar_valor(valor: Any) -> str:
    if valor is None:
        return ""
    if isinstance(valor, datetime):
        return valor.strftime("%Y-%m-%d %H:%M")
    return str(valor)


def crear_pdf(tipo: str, datos: list[dict[str, Any]]) -> BytesIO:
    buffer = BytesIO()
    titulo = TITULOS_REPORTE.get(tipo, "Reporte")
    documento = SimpleDocTemplate(
        buffer,
        pagesize=landscape(letter),
        rightMargin=0.45 * inch,
        leftMargin=0.45 * inch,
        topMargin=0.45 * inch,
        bottomMargin=0.45 * inch,
    )
    estilos = getSampleStyleSheet()
    elementos = [
        Paragraph("Coffee Code", estilos["Title"]),
        Paragraph(titulo, estilos["Heading2"]),
        Paragraph(f"Generado: {datetime.now().strftime('%Y-%m-%d %H:%M')}", estilos["Normal"]),
        Spacer(1, 0.18 * inch),
    ]

    if not datos:
        elementos.append(Paragraph("No hay datos disponibles para este reporte.", estilos["Normal"]))
        documento.build(elementos)
        buffer.seek(0)
        return buffer

    columnas = list(datos[0].keys())
    tabla_datos = [[Paragraph(columna.replace("_", " ").title(), estilos["BodyText"]) for columna in columnas]]
    for fila in datos:
        tabla_datos.append([Paragraph(_normalizar_valor(fila.get(columna)), estilos["BodyText"]) for columna in columnas])

    tabla = Table(tabla_datos, repeatRows=1)
    tabla.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#6f4327")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#d8c9ba")),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f7f1eb")]),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    elementos.append(tabla)
    documento.build(elementos)
    buffer.seek(0)
    return buffer


def crear_xlsx(tipo: str, datos: list[dict[str, Any]]) -> BytesIO:
    buffer = BytesIO()
    libro = Workbook()
    hoja = libro.active
    hoja.title = tipo[:31]
    titulo = TITULOS_REPORTE.get(tipo, "Reporte")

    hoja.append(["Coffee Code"])
    hoja.append([titulo])
    hoja.append([f"Generado: {datetime.now().strftime('%Y-%m-%d %H:%M')}"])
    hoja.append([])

    if datos:
        columnas = list(datos[0].keys())
        hoja.append([columna.replace("_", " ").title() for columna in columnas])
        for fila in datos:
            hoja.append([fila.get(columna) for columna in columnas])

        for celda in hoja[5]:
            celda.font = celda.font.copy(bold=True)

        for columna in hoja.columns:
            ancho = max(len(str(celda.value)) if celda.value is not None else 0 for celda in columna)
            hoja.column_dimensions[columna[0].column_letter].width = min(max(ancho + 2, 12), 34)
    else:
        hoja.append(["No hay datos disponibles para este reporte."])

    libro.save(buffer)
    buffer.seek(0)
    return buffer
