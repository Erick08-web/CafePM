import { useCallback, useEffect, useState } from "react";

import { consultarApi } from "@/services/api";

type Estado<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  recargar: () => Promise<void>;
};

export function useApi<T>(ruta: string): Estado<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await consultarApi<T>(ruta);
      setData(resultado);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrio un error inesperado");
    } finally {
      setLoading(false);
    }
  }, [ruta]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  return { data, loading, error, recargar: cargar };
}
