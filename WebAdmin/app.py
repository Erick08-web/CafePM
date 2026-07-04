import os
from typing import Any

import requests
from dotenv import load_dotenv
from flask import Flask, flash, redirect, render_template, request, url_for

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "coffee-code-dev-secret")
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000").rstrip("/")


def api_get(ruta: str, default: Any = None):
    try:
        respuesta = requests.get(f"{API_BASE_URL}{ruta}", timeout=8)
        respuesta.raise_for_status()
        return respuesta.json()
    except requests.RequestException as error:
        flash(f"No se pudo consultar la API: {error}", "error")
        return default


def api_post(ruta: str, payload: dict):
    try:
        respuesta = requests.post(f"{API_BASE_URL}{ruta}", json=payload, timeout=8)
        if respuesta.status_code >= 400:
            detalle = respuesta.json().get("detail", respuesta.text)
            return False, detalle
        return True, respuesta.json()
    except requests.RequestException as error:
        return False, str(error)


def estado_api():
    try:
        respuesta = requests.get(f"{API_BASE_URL}/health/db", timeout=3)
        return respuesta.ok
    except requests.RequestException:
        return False


@app.context_processor
def variables_globales():
    return {
        "nombre_proyecto": "Coffee Code",
        "api_base_url": API_BASE_URL,
        "api_disponible": estado_api(),
    }


@app.get("/")
def inicio():
    resumen = api_get("/estadisticas/resumen", {})
    productos = api_get("/estadisticas/productos-mas-vendidos", [])
    gastos = api_get("/estadisticas/gastos-por-categoria", [])
    pedidos = api_get("/estadisticas/pedidos-por-estado", [])
    return render_template(
        "inicio.html",
        resumen=resumen,
        productos=productos,
        gastos=gastos,
        pedidos=pedidos,
    )


@app.get("/usuarios")
def usuarios():
    lista_usuarios = api_get("/usuarios", [])
    return render_template("usuarios.html", usuarios=lista_usuarios)


@app.route("/usuarios/nuevo", methods=["GET", "POST"])
def usuario_nuevo():
    roles = api_get("/catalogos/roles", [])
    permisos = api_get("/catalogos/permisos", [])

    if request.method == "POST":
        payload = {
            "nombre": request.form.get("nombre", "").strip(),
            "correo": request.form.get("correo", "").strip(),
            "password": request.form.get("password", "").strip(),
            "id_rol": int(request.form.get("id_rol", "0")),
            "permisos": [int(valor) for valor in request.form.getlist("permisos")],
        }
        ok, resultado = api_post("/usuarios", payload)
        if ok:
            flash("Usuario creado correctamente.", "success")
            return redirect(url_for("usuarios"))
        flash(f"No se pudo crear el usuario: {resultado}", "error")

    return render_template("usuario_formulario.html", roles=roles, permisos=permisos)


@app.get("/estadisticas")
def estadisticas():
    resumen = api_get("/estadisticas/resumen", {})
    productos = api_get("/estadisticas/productos-mas-vendidos", [])
    gastos = api_get("/estadisticas/gastos-por-categoria", [])
    pedidos = api_get("/estadisticas/pedidos-por-estado", [])
    return render_template(
        "estadisticas.html",
        resumen=resumen,
        productos=productos,
        gastos=gastos,
        pedidos=pedidos,
    )


@app.get("/reportes")
def reportes():
    tipo = request.args.get("tipo", "pedidos")
    rutas = {
        "pedidos": "/reportes/pedidos",
        "inventario": "/reportes/inventario",
        "productos": "/reportes/productos",
    }
    if tipo not in rutas:
        tipo = "pedidos"
    datos = api_get(rutas[tipo], [])
    return render_template("reportes.html", tipo=tipo, datos=datos)


@app.get("/cocina")
def cocina():
    pedidos = api_get("/cocina/pedidos", [])
    inventario_bajo = api_get("/cocina/inventario-bajo", [])
    return render_template("cocina.html", pedidos=pedidos, inventario_bajo=inventario_bajo)


@app.get("/caja")
def caja():
    resumen = api_get("/caja/resumen", {})
    cuentas = api_get("/caja/cuentas", [])
    gastos = api_get("/caja/gastos", [])
    compras = api_get("/caja/compras", [])
    return render_template("caja.html", resumen=resumen, cuentas=cuentas, gastos=gastos, compras=compras)


if __name__ == "__main__":
    app.run(debug=True, port=5000)
