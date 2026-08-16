"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Search } from "lucide-react";
import { demoPatients } from "@/lib/demo-data";
import { StatusBadge } from "./status-badge";

export function PatientList() {
  const [query, setQuery] = useState("");
  const patients = useMemo(() => demoPatients.filter((patient) => `${patient.name} ${patient.identifier}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return <><div className="toolbar"><div className="search"><Search aria-hidden="true" size={18}/><input className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre o identificador…" aria-label="Filtrar pacientes ficticios"/></div></div>
    <p className="results-count muted" role="status" aria-live="polite">{patients.length} {patients.length === 1 ? "registro ficticio" : "registros ficticios"}</p>
    <div className="table-wrap"><table className="table"><thead><tr><th>Paciente</th><th>Contacto</th><th>Última visita</th><th>Próxima cita</th><th>Estado</th></tr></thead><tbody>{patients.map((patient) => <tr key={patient.id}><td><div className="patient-cell"><div className="avatar">{patient.initials}</div><div>{patient.name}<div className="muted" style={{fontSize: ".72rem",fontWeight:500}}>{patient.identifier}</div>{patient.alert && <div className="patient-alert"><AlertTriangle size={13}/>{patient.alert}</div>}</div></div></td><td>{patient.phone}<div className="muted" style={{fontSize: ".72rem"}}>{patient.email}</div></td><td>{patient.lastVisit}</td><td>{patient.nextAppointment}</td><td><StatusBadge status={patient.status}/></td></tr>)}</tbody></table></div>
    <div className="patient-cards">{patients.map((patient) => <article className="card patient-card" key={patient.id}><div className="patient-cell"><div className="avatar">{patient.initials}</div><div>{patient.name}<div className="muted" style={{fontSize: ".72rem",fontWeight:500}}>{patient.identifier}</div></div><StatusBadge status={patient.status}/></div><dl className="patient-meta"><div><dt>Teléfono</dt><dd>{patient.phone}</dd></div><div><dt>Correo</dt><dd>{patient.email}</dd></div><div><dt>Última visita</dt><dd>{patient.lastVisit}</dd></div><div><dt>Próxima cita</dt><dd>{patient.nextAppointment}</dd></div></dl>{patient.alert && <div className="patient-alert"><AlertTriangle size={13}/>{patient.alert}</div>}</article>)}</div>
    {patients.length === 0 && <div className="placeholder" role="status"><div><h3>Sin coincidencias</h3><p className="muted">Prueba con otro nombre ficticio.</p></div></div>}
  </>;
}
