"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="es"><body><main className="placeholder"><div><p className="eyebrow">Error inesperado</p><h1 className="page-title">La aplicación no pudo iniciar</h1><p className="muted">No se guardó información. Intenta cargar la demostración nuevamente.</p><button className="button-primary" type="button" onClick={reset}>Reintentar</button></div></main></body></html>;
}
