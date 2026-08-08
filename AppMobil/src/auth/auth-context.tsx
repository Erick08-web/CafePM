import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { ApiError, configurarManejadorNoAutorizado, enviarApi } from "@/services/api";
import { eliminarSesionLocal, guardarSesionLocal, obtenerSesionLocal } from "@/services/session-storage";
import type { LoginRespuesta, UsuarioAutenticado } from "@/types";

type RutaModulo = "/mesero" | "/cocina" | "/caja" | "/admin";

type AuthContextValue = {
  usuario: UsuarioAutenticado | null;
  cargandoSesion: boolean;
  iniciarSesion: (correo: string, password: string) => Promise<RutaModulo>;
  cerrarSesion: () => Promise<void>;
  obtenerRutaInicial: (usuario: UsuarioAutenticado) => RutaModulo;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizarClave(valor: string) {
  return valor.trim().toLowerCase();
}

export function obtenerRutaPorUsuario(usuario: UsuarioAutenticado): RutaModulo {
  const permisos = usuario.permisos.map((permiso) => normalizarClave(permiso.clave));
  const rol = normalizarClave(usuario.rol ?? "");

  if (permisos.includes("admin") || rol === "admin" || usuario.id_rol === 1) return "/admin";
  if (permisos.includes("mesero") || rol === "mesero" || usuario.id_rol === 2) return "/mesero";
  if (permisos.includes("caja") || rol === "caja" || usuario.id_rol === 3) return "/caja";
  if (permisos.includes("cocina") || rol === "cocina" || usuario.id_rol === 4) return "/cocina";

  return "/mesero";
}

function mensajeLogin(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "Correo o contraseña incorrectos. Verifica tus datos e intentalo nuevamente.";
    }

    if (error.status && error.status >= 500) {
      return "Coffee Code no esta disponible por el momento. Intentalo nuevamente en unos minutos.";
    }

    return error.message || "No pudimos iniciar sesion. Intentalo nuevamente.";
  }

  return "No pudimos conectar con Coffee Code. Verifica tu conexion e intentalo nuevamente.";
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  useEffect(() => {
    let activo = true;

    async function cargarSesion() {
      const sesion = await obtenerSesionLocal();
      if (activo) {
        setUsuario(sesion);
        setCargandoSesion(false);
      }
    }

    void cargarSesion();

    return () => {
      activo = false;
    };
  }, []);

  const iniciarSesion = useCallback(async (correo: string, password: string) => {
    try {
      const respuesta = await enviarApi<LoginRespuesta>("/auth/login", { correo, password });

      if (!respuesta?.id_usuario || !respuesta.correo || !Array.isArray(respuesta.permisos) || !respuesta.access_token) {
        throw new ApiError("La respuesta de Coffee Code no tiene el formato esperado.");
      }

      await guardarSesionLocal(respuesta);
      setUsuario(respuesta);
      return obtenerRutaPorUsuario(respuesta);
    } catch (error) {
      throw new Error(mensajeLogin(error));
    }
  }, []);

  const cerrarSesion = useCallback(async () => {
    await eliminarSesionLocal();
    setUsuario(null);
  }, []);

  useEffect(() => {
    configurarManejadorNoAutorizado(cerrarSesion);
    return () => configurarManejadorNoAutorizado(null);
  }, [cerrarSesion]);

  const value = useMemo(
    () => ({
      usuario,
      cargandoSesion,
      iniciarSesion,
      cerrarSesion,
      obtenerRutaInicial: obtenerRutaPorUsuario,
    }),
    [cerrarSesion, cargandoSesion, iniciarSesion, usuario],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
