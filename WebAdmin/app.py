import os
from functools import wraps
from typing import Any

import requests
from dotenv import load_dotenv
from flask import Flask, Response, flash, redirect, render_template, request, session, url_for

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "coffee-code-dev-secret")
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000").rstrip("/")


def token_actual():
    return session.get("access_token")


def usuario_actual():
    return session.get("usuario")


def headers_autenticados():
    token = token_actual()
    return {"Authorization": f"Bearer {token}"} if token else {}


def usuario_es_admin(usuario: dict | None):
    if not usuario:
        return False
    rol = str(usuario.get("rol") or "").strip().lower()
    permisos = {str(permiso.get("clave") or "").strip().lower() for permiso in usuario.get("permisos", [])}
    return rol == "admin" or "admin" in permisos


def requiere_login(vista):
    @wraps(vista)
    def wrapper(*args, **kwargs):
        if not token_actual() or not usuario_es_admin(usuario_actual()):
            flash("Inicia sesion con una cuenta administrativa para continuar.", "error")
            return redirect(url_for("login"))
        return vista(*args, **kwargs)

    return wrapper


def cerrar_sesion_expirada():
    session.clear()
    flash("Tu sesion expiro o ya no es valida. Inicia sesion nuevamente.", "error")


def api_get(ruta: str, default: Any = None):
    try:
        respuesta = requests.get(f"{API_BASE_URL}{ruta}", headers=headers_autenticados(), timeout=8)
        if respuesta.status_code == 401:
            cerrar_sesion_expirada()
            return default
        respuesta.raise_for_status()
        return respuesta.json()
    except requests.RequestException as error:
        flash(f"No se pudo consultar la API: {error}", "error")
        return default


def api_post(ruta: str, payload: dict):
    try:
        respuesta = requests.post(f"{API_BASE_URL}{ruta}", json=payload, headers=headers_autenticados(), timeout=8)
        if respuesta.status_code == 401:
            cerrar_sesion_expirada()
            return False, "Sesion expirada"
        if respuesta.status_code >= 400:
            detalle = respuesta.json().get("detail", respuesta.text)
            return False, detalle
        return True, respuesta.json()
    except requests.RequestException as error:
        return False, str(error)


def api_put(ruta: str, payload: dict):
    try:
        respuesta = requests.put(f"{API_BASE_URL}{ruta}", json=payload, headers=headers_autenticados(), timeout=8)
        if respuesta.status_code == 401:
            cerrar_sesion_expirada()
            return False, "Sesion expirada"
        if respuesta.status_code >= 400:
            detalle = respuesta.json().get("detail", respuesta.text)
            return False, detalle
        return True, respuesta.json()
    except requests.RequestException as error:
        return False, str(error)


def api_delete(ruta: str):
    try:
        respuesta = requests.delete(f"{API_BASE_URL}{ruta}", headers=headers_autenticados(), timeout=8)
        if respuesta.status_code == 401:
            cerrar_sesion_expirada()
            return False, "Sesion expirada"
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
        "endpoint_actual": request.endpoint,
        "usuario_web": usuario_actual(),
    }


@app.route("/login", methods=["GET", "POST"])
def login():
    if token_actual() and usuario_es_admin(usuario_actual()):
        return redirect(url_for("inicio"))

    if request.method == "POST":
        payload = {
            "correo": request.form.get("correo", "").strip(),
            "password": request.form.get("password", "").strip(),
        }
        try:
            respuesta = requests.post(f"{API_BASE_URL}/auth/login", json=payload, timeout=8)
            if respuesta.status_code == 401:
                flash("Correo o contrasena incorrectos.", "error")
                return render_template("login.html")
            if respuesta.status_code >= 400:
                detalle = respuesta.json().get("detail", respuesta.text)
                flash(f"No se pudo iniciar sesion: {detalle}", "error")
                return render_template("login.html")
            datos = respuesta.json()
        except requests.RequestException as error:
            flash(f"No se pudo conectar con la API: {error}", "error")
            return render_template("login.html")

        usuario = datos.get("usuario") or datos
        if not usuario_es_admin(usuario):
            flash("Tus credenciales son validas, pero no tienes acceso administrativo a WebAdmin.", "error")
            return render_template("login.html")

        session["access_token"] = datos["access_token"]
        session["usuario"] = usuario
        flash("Sesion iniciada correctamente.", "success")
        return redirect(url_for("inicio"))

    return render_template("login.html")


@app.post("/logout")
def logout():
    session.clear()
    flash("Sesion cerrada correctamente.", "success")
    return redirect(url_for("login"))


@app.get("/")
@requiere_login
def inicio():
    resumen = api_get("/estadisticas/resumen", {})
    productos = api_get("/estadisticas/productos-mas-vendidos", [])
    gastos = api_get("/estadisticas/gastos-por-categoria", [])
    pedidos = api_get("/estadisticas/pedidos-por-estado", [])
    cuentas = api_get("/caja/cuentas", [])
    inventario_bajo = api_get("/cocina/inventario-bajo", [])
    usuarios_lista = api_get("/usuarios", [])
    ultimos_pedidos = api_get("/reportes/pedidos", [])
    total_pedidos = sum(item.get("total", 0) or 0 for item in pedidos)
    usuarios_activos = sum(1 for usuario in usuarios_lista if usuario.get("activo"))
    return render_template(
        "inicio.html",
        resumen=resumen,
        productos=productos,
        gastos=gastos,
        pedidos=pedidos,
        cuentas=cuentas,
        inventario_bajo=inventario_bajo,
        usuarios=usuarios_lista,
        ultimos_pedidos=ultimos_pedidos[:6],
        total_pedidos=total_pedidos,
        usuarios_activos=usuarios_activos,
    )


@app.get("/usuarios")
@requiere_login
def usuarios():
    lista_usuarios = api_get("/usuarios", [])
    return render_template("usuarios.html", usuarios=lista_usuarios)


@app.route("/usuarios/nuevo", methods=["GET", "POST"])
@requiere_login
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

    return render_template(
        "usuario_formulario.html",
        usuario=None,
        permisos_usuario=[],
        roles=roles,
        permisos=permisos,
    )


@app.route("/usuarios/<int:id_usuario>/editar", methods=["GET", "POST"])
@requiere_login
def usuario_editar(id_usuario: int):
    usuario = api_get(f"/usuarios/{id_usuario}")
    if usuario is None:
        flash("No se pudo cargar el usuario solicitado.", "error")
        return redirect(url_for("usuarios"))

    roles = api_get("/catalogos/roles", [])
    permisos = api_get("/catalogos/permisos", [])

    if request.method == "POST":
        payload = {
            "nombre": request.form.get("nombre", "").strip(),
            "correo": request.form.get("correo", "").strip(),
            "id_rol": int(request.form.get("id_rol", "0")),
            "activo": request.form.get("activo") == "true",
            "permisos": [int(valor) for valor in request.form.getlist("permisos")],
        }
        password = request.form.get("password", "").strip()
        if password:
            payload["password"] = password

        ok, resultado = api_put(f"/usuarios/{id_usuario}", payload)
        if ok:
            flash("Usuario actualizado correctamente.", "success")
            return redirect(url_for("usuarios"))
        flash(f"No se pudo actualizar el usuario: {resultado}", "error")

        usuario.update(payload)
        usuario["permisos"] = [{"id_permiso": valor} for valor in payload["permisos"]]

    permisos_usuario = [permiso["id_permiso"] for permiso in usuario.get("permisos", [])]
    return render_template(
        "usuario_formulario.html",
        usuario=usuario,
        permisos_usuario=permisos_usuario,
        roles=roles,
        permisos=permisos,
    )


@app.post("/usuarios/<int:id_usuario>/eliminar")
@requiere_login
def usuario_eliminar(id_usuario: int):
    ok, resultado = api_delete(f"/usuarios/{id_usuario}")
    if ok:
        flash("Usuario eliminado correctamente. Su historial se conserva.", "success")
    else:
        flash(f"No se pudo eliminar el usuario: {resultado}", "error")
    return redirect(url_for("usuarios"))


@app.get("/estadisticas")
@requiere_login
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
@requiere_login
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


@app.get("/reportes/<tipo>/<formato>")
@requiere_login
def descargar_reporte(tipo: str, formato: str):
    if tipo not in {"pedidos", "inventario", "productos"} or formato not in {"pdf", "xlsx"}:
        flash("Reporte no disponible.", "error")
        return redirect(url_for("reportes"))

    try:
        respuesta = requests.get(f"{API_BASE_URL}/reportes/{tipo}/{formato}", headers=headers_autenticados(), timeout=15)
        if respuesta.status_code == 401:
            cerrar_sesion_expirada()
            return redirect(url_for("login"))
        if respuesta.status_code >= 400:
            detalle = respuesta.json().get("detail", respuesta.text)
            flash(f"No se pudo descargar el reporte: {detalle}", "error")
            return redirect(url_for("reportes", tipo=tipo))
    except requests.RequestException as error:
        flash(f"No se pudo descargar el reporte: {error}", "error")
        return redirect(url_for("reportes", tipo=tipo))

    return Response(
        respuesta.content,
        content_type=respuesta.headers.get("content-type"),
        headers={"Content-Disposition": respuesta.headers.get("content-disposition", f"attachment; filename=coffee_code_{tipo}.{formato}")},
    )


@app.get("/cocina")
@requiere_login
def cocina():
    pedidos = api_get("/cocina/pedidos", [])
    inventario_bajo = api_get("/cocina/inventario-bajo", [])
    return render_template("cocina.html", pedidos=pedidos, inventario_bajo=inventario_bajo)


@app.get("/caja")
@requiere_login
def caja():
    resumen = api_get("/caja/resumen", {})
    cuentas = api_get("/caja/cuentas", [])
    gastos = api_get("/caja/gastos", [])
    compras = api_get("/caja/compras", [])
    return render_template("caja.html", resumen=resumen, cuentas=cuentas, gastos=gastos, compras=compras)


if __name__ == "__main__":
    app.run(debug=True, port=5000)
