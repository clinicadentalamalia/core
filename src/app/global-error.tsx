"use client";

import { useEffect } from "react";
import { reportClientBoundary } from "@/lib/monitoring";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientBoundary("global", error.digest);
  }, [error.digest]);

  return (
    <html lang="es">
      <body>
        <main className="placeholder">
          <div>
            <p className="eyebrow">Error inesperado</p>
            <h1 className="page-title">La aplicación no pudo iniciar</h1>
            <p className="muted">
              No se guardó información. Intenta cargar la demostración
              nuevamente.
            </p>
            <button className="button-primary" onClick={reset} type="button">
              Reintentar
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
