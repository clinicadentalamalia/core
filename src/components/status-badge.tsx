export function StatusBadge({ status }: { status: string }) {
  const tone = status === "Confirmada" || status === "Completada" || status === "Activo" ? "success" : status === "En atención" ? "info" : status === "Por confirmar" || status === "Seguimiento" ? "warning" : "neutral";
  return <span className={`badge ${tone}`}>{status}</span>;
}
