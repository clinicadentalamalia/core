import { ShieldCheck, UserRoundPlus } from "lucide-react";
import { PatientForm } from "@/components/patient-form";
import { PatientList } from "@/components/patient-list";

export default function PatientsPage() {
  return <><div className="hero-row"><div><p className="eyebrow">Gestión administrativa</p><h1 className="page-title">Pacientes</h1><p className="muted">Búsqueda y alta demostrativa, sin persistencia ni datos reales.</p></div></div><div className="panel-grid"><section className="card section-card"><div className="section-head"><div><p className="eyebrow">Directorio ficticio</p><h2 className="section-title">Listado de pacientes</h2></div><span className="badge info">4 registros demo</span></div><PatientList/></section><aside className="card section-card"><div className="section-head"><div><p className="eyebrow">Nuevo registro</p><h2 className="section-title">Paciente ficticio</h2></div><UserRoundPlus size={21} color="var(--amalia-primary)"/></div><PatientForm/><div className="login-note"><ShieldCheck size={15} style={{display:"inline",marginRight:6}}/>Esta entrega valida el formulario, pero no guarda información en Supabase hasta aprobar modelo y RLS.</div></aside></div></>;
}
