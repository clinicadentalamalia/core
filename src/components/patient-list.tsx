"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/status-badge";
import type { PatientSummary } from "@/types/operational";

export function PatientList({ patients }: { patients: PatientSummary[] }) {
  const [query, setQuery] = useState("");
  const filteredPatients = useMemo(
    () =>
      patients.filter((patient) =>
        `${patient.name} ${patient.identifier}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [patients, query],
  );

  return (
    <>
      <div className="toolbar">
        <div className="search">
          <Search aria-hidden="true" size={18} />
          <input
            className="input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre o identificador…"
            aria-label="Filtrar pacientes"
          />
        </div>
      </div>
      <p className="results-count muted" role="status" aria-live="polite">
        {filteredPatients.length}{" "}
        {filteredPatients.length === 1 ? "registro" : "registros"}
      </p>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Contacto</th>
              <th>Última visita</th>
              <th>Próxima cita</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient) => (
              <tr key={patient.id}>
                <td>
                  <div className="patient-cell">
                    <div className="avatar">{patient.initials}</div>
                    <div>
                      {patient.name}
                      <div
                        className="muted"
                        style={{ fontSize: ".72rem", fontWeight: 500 }}
                      >
                        {patient.identifier}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  {patient.phone}
                  <div className="muted" style={{ fontSize: ".72rem" }}>
                    {patient.email}
                  </div>
                </td>
                <td>{patient.lastVisit}</td>
                <td>{patient.nextAppointment}</td>
                <td>
                  <StatusBadge status={patient.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="patient-cards">
        {filteredPatients.map((patient) => (
          <article className="card patient-card" key={patient.id}>
            <div className="patient-cell">
              <div className="avatar">{patient.initials}</div>
              <div>
                {patient.name}
                <div
                  className="muted"
                  style={{ fontSize: ".72rem", fontWeight: 500 }}
                >
                  {patient.identifier}
                </div>
              </div>
              <StatusBadge status={patient.status} />
            </div>
            <dl className="patient-meta">
              <div>
                <dt>Teléfono</dt>
                <dd>{patient.phone}</dd>
              </div>
              <div>
                <dt>Correo</dt>
                <dd>{patient.email}</dd>
              </div>
              <div>
                <dt>Última visita</dt>
                <dd>{patient.lastVisit}</dd>
              </div>
              <div>
                <dt>Próxima cita</dt>
                <dd>{patient.nextAppointment}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
      {filteredPatients.length === 0 && (
        <div className="placeholder" role="status">
          <div>
            <h3>{patients.length === 0 ? "Sin pacientes registrados" : "Sin coincidencias"}</h3>
            <p className="muted">
              {patients.length === 0
                ? "El directorio se completará con altas autorizadas."
                : "Prueba con otro nombre o identificador."}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
