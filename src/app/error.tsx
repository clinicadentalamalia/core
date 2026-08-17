"use client";

import { useEffect } from "react";
import { reportClientBoundary } from "@/lib/monitoring";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientBoundary("segment", error.digest);
  }, [error.digest]);

  return (
    <main className="placeholder">
      <div>
        <p className="eyebrow">Error controlado</p>
        <h1 className="page-title">No pudimos mostrar esta sección</h1>
        <p className="muted">
          La demostración sigue protegida. Puedes intentar cargarla nuevamente.
        </p>
        <button className="button-primary" onClick={reset} type="button">
          Reintentar
        </button>
      </div>
    </main>
  );
}
