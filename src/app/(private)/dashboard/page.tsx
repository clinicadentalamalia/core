import Link from "next/link";
import { ArrowUpRight, CalendarDays, CheckCircle2, Clock3, FileSignature, Plus, Sparkles, UserRoundPlus, Users } from "lucide-react";
import { demoAppointments, demoPatients } from "@/lib/demo-data";
import { StatusBadge } from "@/components/status-badge";

const stats = [
  ["Pacientes activos", "248", "+12 este mes", Users],
  ["Controles esta semana", "36", "8 por confirmar", CalendarDays],
  ["Tratamientos por renovar", "14", "3 prioritarios", Sparkles],
  ["Atenciones pendientes", "7", "2 requieren revisión", Clock3],
] as const;
const quick = [["Nuevo paciente", UserRoundPlus, "/pacientes"], ["Nueva cita", Plus, "/agenda"], ["Crear consentimiento", FileSignature, "/tratamientos"], ["Reporte mensual", ArrowUpRight, "/reportes"]] as const;

export default function DashboardPage() {
  return <>
    <div className="hero-row"><div><p className="eyebrow">Panel de administración</p><h1 className="page-title">Buenos días, Amanda</h1><p className="muted">Este es el resumen ficticio de la clínica para hoy.</p></div><Link className="button-primary" href="/pacientes"><UserRoundPlus size={17}/>Nuevo paciente</Link></div>
    <section className="stats" aria-label="Indicadores demostrativos">{stats.map(([label,value,detail,Icon]) => <article className="card stat-card" key={label}><div className="stat-top"><span className="muted" style={{fontSize:".78rem",fontWeight:750}}>{label}</span><span className="stat-icon"><Icon size={19}/></span></div><div className="stat-value">{value}</div><span className="muted" style={{fontSize:".72rem"}}>{detail}</span></article>)}</section>
    <div className="dashboard-grid"><section className="card section-card"><div className="section-head"><div><p className="eyebrow">Operación diaria</p><h2 className="section-title">Citas de hoy</h2></div><Link href="/agenda" className="button-secondary">Ver agenda</Link></div>{demoAppointments.map((item) => <div className="appointment" key={item.id}><span className="time">{item.time}</span><div className="avatar" style={{width:38,height:38,fontSize:".7rem"}}>{item.patient.split(" ").map((part) => part[0]).join("").slice(0,2)}</div><div><strong style={{fontSize:".86rem"}}>{item.patient}</strong><div className="muted" style={{fontSize:".72rem",marginTop:4}}>{item.service}</div></div><div className="muted" style={{fontSize:".74rem"}}>{item.professional}<br/>{item.box}</div><StatusBadge status={item.status}/></div>)}</section>
      <aside style={{display:"grid",gap:18}}><section className="card section-card"><div className="section-head"><div><p className="eyebrow">Agosto 2026</p><h2 className="section-title">Calendario</h2></div></div><div className="calendar">{["L","M","M","J","V","S","D"].map((d,i)=><span className="day-name" key={`${d}-${i}`}>{d}</span>)}{Array.from({length:31},(_,i)=>i+1).map(day => <span key={day} className={day===7?"today":[3,12,18,24,28].includes(day)?"has-event":""}>{day}</span>)}</div></section>
      <section className="card section-card"><div className="section-head"><div><p className="eyebrow">Atajos</p><h2 className="section-title">Acciones rápidas</h2></div></div><div className="quick-grid">{quick.map(([label,Icon,href]) => <Link className="quick-action" href={href} key={label}><Icon size={20}/><span>{label}</span></Link>)}</div></section></aside>
    </div>
    <section className="card section-card" style={{marginTop:18}}><div className="section-head"><div><p className="eyebrow">Últimos registros</p><h2 className="section-title">Pacientes recientes</h2></div><CheckCircle2 size={20} color="var(--amalia-success)"/></div><div className="table-wrap"><table className="table"><thead><tr><th>Paciente</th><th>Última visita</th><th>Próxima cita</th><th>Estado</th></tr></thead><tbody>{demoPatients.slice(0,3).map(p=><tr key={p.id}><td className="patient-cell"><div className="avatar">{p.initials}</div>{p.name}</td><td>{p.lastVisit}</td><td>{p.nextAppointment}</td><td><StatusBadge status={p.status}/></td></tr>)}</tbody></table></div></section>
  </>;
}
