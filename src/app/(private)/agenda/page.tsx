import { CalendarPlus } from "lucide-react";
import { AgendaList } from "@/components/agenda-list";

export default function AgendaPage() { return <><div className="hero-row"><div><p className="eyebrow">Profesionales y boxes</p><h1 className="page-title">Agenda</h1><p className="muted">Vista operativa ficticia con estados y categorías clínicas.</p></div><button className="button-primary" aria-label="Nueva cita no disponible en la demostración" title="La creación de citas se habilitará con el modelo de datos" disabled><CalendarPlus size={17}/>Nueva cita demo</button></div><AgendaList/></>; }
