"use client";

import {
  Activity,
  Bell,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  FileBarChart,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageSearch,
  Search,
  Settings,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { signOut } from "@/app/auth/actions";
import { DEMO_NOTICE } from "@/lib/demo-data";
import type { AppUser } from "@/types/auth";

const links = [
  ["Dashboard", "/dashboard", LayoutDashboard],
  ["Pacientes", "/pacientes", Users],
  ["Agenda", "/agenda", CalendarDays],
  ["Tratamientos", "/tratamientos", ClipboardList],
  ["Recordatorios", "/recordatorios", Bell],
  ["Finanzas", "/finanzas", WalletCards],
  ["Inventario", "/inventario", PackageSearch],
  ["Reportes", "/reportes", FileBarChart],
  ["Ajustes", "/ajustes", Settings],
] as const;

const routesByRole: Record<string, readonly string[]> = {
  reception: ["/dashboard", "/pacientes", "/agenda", "/recordatorios"],
  dentist: ["/dashboard", "/pacientes", "/agenda", "/tratamientos", "/reportes"],
  facial_harmonization: [
    "/dashboard",
    "/pacientes",
    "/agenda",
    "/tratamientos",
    "/reportes",
  ],
  auditor: ["/dashboard", "/reportes"],
};

const roleNames: Record<string, string> = {
  admin: "Administración",
  reception: "Recepción",
  dentist: "Odontología",
  facial_harmonization: "Armonización",
  auditor: "Auditoría",
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: AppUser;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const canManagePatients = user.roleCodes.some((role) =>
    ["admin", "reception"].includes(role),
  );
  const visibleLinks = links.filter(([, href]) =>
    user.roleCodes.includes("admin")
      ? true
      : user.roleCodes.some((role) => routesByRole[role]?.includes(href)),
  );

  useEffect(() => {
    if (!open) return;

    sidebarRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  return (
    <div className="shell">
      <aside
        ref={sidebarRef}
        id="primary-navigation"
        className={`sidebar ${open ? "open" : ""}`}
        aria-label="Navegación principal"
      >
        <div className="brand">
          <div className="brand-mark">A</div>
          <div>
            <div className="brand-name">Clínica Amalia</div>
            <div className="brand-subtitle">Gestión clínica</div>
          </div>
        </div>
        <nav className="nav">
          {visibleLinks.map(([label, href, Icon]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              aria-current={pathname === href ? "page" : undefined}
              className={`nav-link ${pathname === href ? "active" : ""}`}
            >
              <Icon size={18} />
              <span>{label}</span>
              {pathname === href && (
                <ChevronRight
                  aria-hidden="true"
                  size={15}
                  style={{ marginLeft: "auto" }}
                />
              )}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="profile">
            <div className="avatar">{initials(user.displayName)}</div>
            <div>
              <strong style={{ fontSize: ".8rem" }}>{user.displayName}</strong>
              <div style={{ fontSize: ".68rem", opacity: 0.7 }}>
                {user.roleCodes.map((role) => roleNames[role] ?? role).join(" · ")}
              </div>
            </div>
          </div>
          <form action={signOut}>
            <button type="submit" className="nav-link logout-button">
              <LogOut size={17} />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>
      {open && (
        <button
          aria-label="Cerrar menú"
          onClick={() => {
            setOpen(false);
            menuButtonRef.current?.focus();
          }}
          className="menu-backdrop"
        />
      )}
      <div className="main">
        <div className="demo-banner">
          <Activity size={14} />
          {DEMO_NOTICE}
        </div>
        <header className="topbar">
          <button
            ref={menuButtonRef}
            className="icon-button mobile-menu"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="primary-navigation"
            onClick={() => setOpen((current) => !current)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="search">
            <Search aria-hidden="true" size={18} />
            <input
              className="input"
              aria-label="Búsqueda global no disponible"
              placeholder="Búsqueda próximamente"
              title="La búsqueda global se habilitará en una fase posterior"
              disabled
            />
          </div>
          <button
            className="icon-button"
            aria-label="Notificaciones no disponibles"
            title="Las notificaciones se habilitarán en una fase posterior"
            disabled
          >
            <Bell size={19} />
          </button>
          {canManagePatients && (
            <Link href="/pacientes" className="button-primary">
              <Users size={17} />
              Nuevo paciente
            </Link>
          )}
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
