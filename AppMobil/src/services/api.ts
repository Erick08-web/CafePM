const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function consultarApi<T>(ruta: string): Promise<T> {
  try {
    const respuesta = await fetch(`${API_BASE_URL}${ruta}`);
    if (!respuesta.ok) {
      throw new ApiError(`La API respondio con estado ${respuesta.status}`);
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
  const respuesta = await fetch(`${API_BASE_URL}${ruta}`, {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!respuesta.ok) {
    throw new ApiError(`La API respondio con estado ${respuesta.status}`);
  }
  return (await respuesta.json()) as T;
}

export function obtenerApiBaseUrl() {
  return API_BASE_URL;
}
