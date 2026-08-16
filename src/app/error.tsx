"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="placeholder"><div><p className="eyebrow">Error controlado</p><h1 className="page-title">No pudimos mostrar esta sección</h1><p className="muted">La demostración sigue protegida. Puedes intentar cargarla nuevamente.</p><button className="button-primary" type="button" onClick={reset}>Reintentar</button></div></main>;
}
