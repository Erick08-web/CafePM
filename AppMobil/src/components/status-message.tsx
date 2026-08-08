import { ErrorState, LoadingState } from "@/components/app-state";

type Props = {
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

export function StatusMessage({ loading, error, onRetry }: Props) {
  if (loading) {
    return <LoadingState title="Cargando datos" message="Sincronizando informacion reciente de la cafeteria." />;
  }

  if (!error) {
    return null;
  }

  return <ErrorState title="Sin conexion con la API" message={error} onRetry={onRetry} />;
}
