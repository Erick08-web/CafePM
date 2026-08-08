import * as SecureStore from "expo-secure-store";

import type { UsuarioAutenticado } from "@/types";

const SESSION_KEY = "coffee-code-session";

export async function guardarSesionLocal(usuario: UsuarioAutenticado) {
  const valor = JSON.stringify(usuario);

  if (process.env.EXPO_OS === "web" && typeof localStorage !== "undefined") {
    localStorage.setItem(SESSION_KEY, valor);
    return;
  }

  await SecureStore.setItemAsync(SESSION_KEY, valor);
}

export async function obtenerSesionLocal() {
  let valor: string | null = null;

  if (process.env.EXPO_OS === "web" && typeof localStorage !== "undefined") {
    valor = localStorage.getItem(SESSION_KEY);
  } else {
    valor = await SecureStore.getItemAsync(SESSION_KEY);
  }

  if (!valor) {
    return null;
  }

  try {
    return JSON.parse(valor) as UsuarioAutenticado;
  } catch {
    await eliminarSesionLocal();
    return null;
  }
}

export async function obtenerTokenLocal() {
  const sesion = await obtenerSesionLocal();
  return sesion?.access_token ?? null;
}

export async function eliminarSesionLocal() {
  if (process.env.EXPO_OS === "web" && typeof localStorage !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(SESSION_KEY);
}
