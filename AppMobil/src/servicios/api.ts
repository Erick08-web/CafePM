const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

export async function consultarApi(ruta: string) {
  const respuesta = await fetch(`${API_BASE_URL}${ruta}`);
  if (!respuesta.ok) {
    throw new Error('No se pudo consultar la API');
  }
  return respuesta.json();
}
