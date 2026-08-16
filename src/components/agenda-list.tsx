"use client";

import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { demoAppointments } from "@/lib/demo-data";
import { StatusBadge } from "./status-badge";

export function AgendaList() {
  const [view, setView] = useState<"Día"|"Semana"|"Mes">("Día");
  return <div className="card section-card"><div className="section-head"><div><p className="eyebrow">Viernes 7 de agosto</p><h2 className="section-title">Agenda demostrativa</h2></div><div style={{display:"flex",gap:6}}><button className="icon-button" aria-label="Día anterior no disponible en la demostración" title="Navegación de fechas próximamente" disabled><ChevronLeft size={18}/></button><button className="icon-button" aria-label="Día siguiente no disponible en la demostración" title="Navegación de fechas próximamente" disabled><ChevronRight size={18}/></button></div></div>
    <div className="toolbar" role="group" aria-label="Vista de agenda">{(["Día","Semana","Mes"] as const).map((item) => <button key={item} type="button" aria-pressed={view === item} onClick={() => setView(item)} className={view === item ? "button-primary" : "button-secondary"}>{item}</button>)}</div>
    {view === "Día" ? <div className="agenda-day">{demoAppointments.map((appointment) => <article className="agenda-item" key={appointment.id}><div className="time">{appointment.time}</div><div aria-hidden="true" className={`agenda-color ${appointment.category === "Armonización" ? "facial" : ""}`}/><div><strong>{appointment.patient}</strong><div className="category-label">{appointment.category}</div><div className="muted" style={{fontSize:".78rem",marginTop:4}}>{appointment.service} · {appointment.professional} · {appointment.box}</div></div><StatusBadge status={appointment.status}/></article>)}</div> : <div className="placeholder" style={{minHeight:300}}><div><CalendarDays className="placeholder-icon" style={{padding:17}}/><h3>Vista {view.toLowerCase()} preparada</h3><p className="muted">Se conectará al modelo de agenda después de aprobar integridad y RLS.</p></div></div>}
  </div>;
}
