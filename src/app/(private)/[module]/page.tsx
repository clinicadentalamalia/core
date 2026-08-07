import { Boxes, ClipboardCheck, Construction } from "lucide-react";
import { notFound } from "next/navigation";

const modules: Record<string, {title:string;description:string;next:string}> = {
  tratamientos: { title:"Tratamientos", description:"Planes odontológicos y de armonización, con versiones y trazabilidad.", next:"Aprobar modelo de tratamientos, prestaciones y consentimientos." },
  recordatorios: { title:"Recordatorios", description:"Seguimientos y correos sin información clínica sensible.", next:"Definir consentimiento comunicacional, cola e idempotencia." },
  finanzas: { title:"Finanzas", description:"Presupuestos, pagos, saldos y caja sin eliminar movimientos históricos.", next:"Aprobar estados financieros, reversos y matriz de acceso." },
  inventario: { title:"Inventario", description:"Productos, proveedores, lotes, vencimientos y movimientos inmutables.", next:"Aprobar unidades, reglas de lote y consumo por procedimiento." },
  reportes: { title:"Reportes", description:"Indicadores operativos, clínicos y financieros minimizados por rol.", next:"Definir métricas, exportaciones y auditoría asociada." },
  ajustes: { title:"Ajustes", description:"Usuarios, roles, prestaciones, boxes, auditoría y parámetros.", next:"Aprobar matriz RLS y modelo de perfiles antes de Auth real." },
};

export default async function ModulePage({ params }: { params: Promise<{module:string}> }) {
  const { module } = await params; const item = modules[module]; if (!item) notFound();
  return <><div className="hero-row"><div><p className="eyebrow">Módulo preparado</p><h1 className="page-title">{item.title}</h1><p className="muted">{item.description}</p></div></div><section className="card placeholder"><div><span className="placeholder-icon"><Construction size={27}/></span><p className="eyebrow">Siguiente incremento</p><h2 className="section-title" style={{fontSize:"2rem"}}>Ruta funcional lista</h2><p className="muted" style={{maxWidth:520}}>{item.next}</p><div style={{display:"flex",justifyContent:"center",gap:8,marginTop:20}}><span className="badge success"><ClipboardCheck size={13}/>Navegación verificada</span><span className="badge info"><Boxes size={13}/>Sin datos reales</span></div></div></section></>;
}
