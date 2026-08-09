import { obtenerTokenLocal } from "@/services/session-storage";

// Prefer EXPO_PUBLIC_API_BASE_URL for phones. The local fallback is kept
// for simulator/web development on the same machine as ApiBackend.
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

let onUnauthorized: (() => void | Promise<void>) | null = null;

export function configurarManejadorNoAutorizado(handler: (() => void | Promise<void>) | null) {
  onUnauthorized = handler;
}

async function leerMensajeError(respuesta: Response) {
  try {
    const cuerpo = await respuesta.json();
    if (typeof cuerpo?.detail === "string") {
      return cuerpo.detail;
    }
  } catch {
    // Keep a friendly fallback when the API returns a non-JSON error.
  }
  return `La API respondio con estado ${respuesta.status}`;
}

async function crearHeaders(ruta: string, headers: HeadersInit = {}) {
  const token = ruta === "/auth/login" ? null : await obtenerTokenLocal();
  return {
    ...headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function manejarRespuestaNoOk(respuesta: Response, ruta: string) {
  const mensaje = await leerMensajeError(respuesta);
  if (respuesta.status === 401 && ruta !== "/auth/login" && onUnauthorized) {
    await onUnauthorized();
  }
  throw new ApiError(mensaje, respuesta.status);
}

export async function consultarApi<T>(ruta: string): Promise<T> {
  try {
    const respuesta = await fetch(`${API_BASE_URL}${ruta}`, {
      headers: await crearHeaders(ruta),
    });
    if (!respuesta.ok) {
      await manejarRespuestaNoOk(respuesta, ruta);
    }
    return (await respuesta.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("No se pudo conectar con la API. Revisa que ApiBackend este corriendo.");
  }
}

export async function enviarApi<T>(ruta: string, payload: unknown, metodo = "POST"): Promise<T> {
  try {
    const respuesta = await fetch(`${API_BASE_URL}${ruta}`, {
      method: metodo,
      headers: await crearHeaders(ruta, { "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });
    if (!respuesta.ok) {
      await manejarRespuestaNoOk(respuesta, ruta);
    }
    return (await respuesta.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("No pudimos conectar con Coffee Code. Verifica tu conexion e intentalo nuevamente.");
  }
}

export function obtenerApiBaseUrl() {
  return API_BASE_URL;
}
