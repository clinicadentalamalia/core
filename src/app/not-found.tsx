import Link from "next/link";

export default function NotFound() {
  return <main className="placeholder"><div><p className="eyebrow">404</p><h1 className="page-title">Página no encontrada</h1><p className="muted">La ruta solicitada no existe en esta entrega.</p><Link className="button-primary" href="/dashboard">Volver al dashboard</Link></div></main>;
}
