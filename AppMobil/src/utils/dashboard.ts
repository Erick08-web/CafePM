export function obtenerSaludo(fecha = new Date()) {
  const hora = fecha.getHours();

  if (hora < 12) return "Buenos dias";
  if (hora < 19) return "Buenas tardes";
  return "Buenas noches";
}

export function money(value: number | undefined | null) {
  return `$${(value ?? 0).toFixed(2)}`;
}

export function formatDateTime(value?: string) {
  if (!value) return "Sin fecha";

  const fecha = new Date(value);
  if (Number.isNaN(fecha.getTime())) return "Sin fecha";

  return fecha.toLocaleString("es-MX", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  });
}

export function elapsedFromNow(value?: string, now = new Date()) {
  if (!value) return null;

  const fecha = new Date(value);
  if (Number.isNaN(fecha.getTime())) return null;

  const diffMs = Math.max(0, now.getTime() - fecha.getTime());
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "hace menos de 1 min";
  if (diffMinutes < 60) return `hace ${diffMinutes} min`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `hace ${diffHours} h`;

  const diffDays = Math.floor(diffHours / 24);
  return `hace ${diffDays} dia${diffDays === 1 ? "" : "s"}`;
}

export function estadoLegible(estado: string) {
  return estado.replace(/_/g, " ");
}
