"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { StatusBadge } from "@/components/status-badge";
import type { AgendaAppointment } from "@/types/operational";

export function AgendaList({
  appointments,
}: {
  appointments: AgendaAppointment[];
}) {
  const [view, setView] = useState<"Día" | "Semana" | "Mes">("Día");

  return (
    <div className="card section-card">
      <div className="section-head">
        <div>
          <p className="eyebrow">Próximas atenciones autorizadas</p>
          <h2 className="section-title">Agenda operativa</h2>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            className="icon-button"
            aria-label="Día anterior no disponible"
            title="La navegación de fechas se habilitará en el siguiente incremento"
            disabled
          >
            <ChevronLeft size={18} />
          </button>
          <button
            className="icon-button"
            aria-label="Día siguiente no disponible"
            title="La navegación de fechas se habilitará en el siguiente incremento"
            disabled
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div className="toolbar" role="group" aria-label="Vista de agenda">
        {(["Día", "Semana", "Mes"] as const).map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={view === item}
            onClick={() => setView(item)}
            className={view === item ? "button-primary" : "button-secondary"}
          >
            {item}
          </button>
        ))}
      </div>
      {view === "Día" ? (
        appointments.length > 0 ? (
          <div className="agenda-day">
            {appointments.map((appointment) => (
              <article className="agenda-item" key={appointment.id}>
                <div className="time">
                  {appointment.time}
                  <span className="date-caption">{appointment.dateLabel}</span>
                </div>
                <div
                  aria-hidden="true"
                  className={`agenda-color ${
                    appointment.category === "Armonización" ? "facial" : ""
                  }`}
                />
                <div>
                  <strong>{appointment.patient}</strong>
                  <div className="category-label">{appointment.category}</div>
                  <div
                    className="muted"
                    style={{ fontSize: ".78rem", marginTop: 4 }}
                  >
                    {appointment.service} · {appointment.professional} ·{" "}
                    {appointment.box}
                  </div>
                </div>
                <StatusBadge status={appointment.status} />
              </article>
            ))}
          </div>
        ) : (
          <div className="placeholder" style={{ minHeight: 300 }} role="status">
            <div>
              <CalendarDays className="placeholder-icon" style={{ padding: 17 }} />
              <h3>Sin citas visibles</h3>
              <p className="muted">
                No hay atenciones próximas para tu ámbito de acceso.
              </p>
            </div>
          </div>
        )
      ) : (
        <div className="placeholder" style={{ minHeight: 300 }}>
          <div>
            <CalendarDays className="placeholder-icon" style={{ padding: 17 }} />
            <h3>Vista {view.toLowerCase()} preparada</h3>
            <p className="muted">
              La navegación avanzada se habilitará en el siguiente incremento.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
