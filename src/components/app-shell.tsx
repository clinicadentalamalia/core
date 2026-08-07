"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Activity, Bell, CalendarDays, ChevronRight, ClipboardList, FileBarChart, LayoutDashboard, LogOut, Menu, PackageSearch, Search, Settings, Users, WalletCards, X } from "lucide-react";
import { DEMO_NOTICE } from "@/lib/demo-data";

const links = [
  ["Dashboard", "/dashboard", LayoutDashboard], ["Pacientes", "/pacientes", Users], ["Agenda", "/agenda", CalendarDays],
  ["Tratamientos", "/tratamientos", ClipboardList], ["Recordatorios", "/recordatorios", Bell], ["Finanzas", "/finanzas", WalletCards],
  ["Inventario", "/inventario", PackageSearch], ["Reportes", "/reportes", FileBarChart], ["Ajustes", "/ajustes", Settings],
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return <div className="shell">
    <aside className={`sidebar ${open ? "open" : ""}`} aria-label="Navegación principal">
      <div className="brand"><div className="brand-mark">A</div><div><div className="brand-name">Clínica Amalia</div><div className="brand-subtitle">Gestión clínica</div></div></div>
      <nav className="nav">{links.map(([label, href, Icon]) => <Link key={href} href={href} onClick={() => setOpen(false)} className={`nav-link ${pathname === href ? "active" : ""}`}><Icon size={18}/><span>{label}</span>{pathname === href && <ChevronRight size={15} style={{ marginLeft: "auto" }}/>}</Link>)}</nav>
      <div className="sidebar-footer"><div className="profile"><div className="avatar">AD</div><div><strong style={{fontSize: ".8rem"}}>Amanda Demo</strong><div style={{fontSize: ".68rem", opacity: .7}}>Administradora ficticia</div></div></div><Link href="/login" className="nav-link"><LogOut size={17}/>Cerrar sesión demo</Link></div>
    </aside>
    {open && <button aria-label="Cerrar menú" onClick={() => setOpen(false)} style={{position:"fixed",inset:0,zIndex:45,border:0,background:"rgba(37,30,33,.35)"}}/>}
    <div className="main">
      <div className="demo-banner"><Activity size={14}/>{DEMO_NOTICE}</div>
      <header className="topbar">
        <button className="icon-button mobile-menu" aria-label={open ? "Cerrar menú" : "Abrir menú"} onClick={() => setOpen(!open)}>{open ? <X size={20}/> : <Menu size={20}/>}</button>
        <div className="search"><Search size={18}/><input className="input" aria-label="Buscar paciente ficticio" placeholder="Buscar paciente ficticio…"/></div>
        <button className="icon-button" aria-label="Notificaciones"><Bell size={19}/></button>
        <Link href="/pacientes" className="button-primary"><Users size={17}/>Nuevo paciente</Link>
      </header>
      <main className="content">{children}</main>
    </div>
  </div>;
}
