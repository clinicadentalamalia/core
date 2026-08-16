import type { DemoAppointment, DemoPatient, Role } from "@/types/demo";

export const DEMO_NOTICE = "Entorno demostrativo · Todos los nombres y datos son ficticios";

export const demoPatients: DemoPatient[] = [
  { id: "pac-demo-001", initials: "VP", name: "Valentina Prado", identifier: "ID-DEMO-001", phone: "+56 9 1111 1111", email: "valentina@example.test", lastVisit: "04 ago 2026", nextAppointment: "Hoy, 10:30", status: "Activo", alert: "Alergia ficticia: látex" },
  { id: "pac-demo-002", initials: "MR", name: "Martina Rojas", identifier: "ID-DEMO-002", phone: "+56 9 2222 2222", email: "martina@example.test", lastVisit: "31 jul 2026", nextAppointment: "12 ago, 09:00", status: "Seguimiento" },
  { id: "pac-demo-003", initials: "SC", name: "Sofía Contreras", identifier: "ID-DEMO-003", phone: "+56 9 3333 3333", email: "sofia@example.test", lastVisit: "28 jul 2026", nextAppointment: "Sin agendar", status: "Activo" },
  { id: "pac-demo-004", initials: "CB", name: "Camila Bustos", identifier: "ID-DEMO-004", phone: "+56 9 4444 4444", email: "camila@example.test", lastVisit: "18 jul 2026", nextAppointment: "15 ago, 16:00", status: "Inactivo" },
];

export const demoAppointments: DemoAppointment[] = [
  { id: "cit-demo-001", time: "09:00", patient: "Martina Rojas", service: "Evaluación inicial", professional: "Dra. Emilia Demo", box: "Box 1", status: "Completada", category: "Odontología" },
  { id: "cit-demo-002", time: "10:30", patient: "Valentina Prado", service: "Control preventivo", professional: "Dra. Emilia Demo", box: "Box 1", status: "En atención", category: "Odontología" },
  { id: "cit-demo-003", time: "12:00", patient: "Sofía Contreras", service: "Evaluación facial", professional: "Dra. Antonia Demo", box: "Box 2", status: "Confirmada", category: "Armonización" },
  { id: "cit-demo-004", time: "15:30", patient: "Camila Bustos", service: "Control tratamiento", professional: "Dra. Antonia Demo", box: "Box 2", status: "Por confirmar", category: "Armonización" },
];

export const modulesByRole: Record<Role, string[]> = {
  Administrador: ["Dashboard", "Pacientes", "Agenda", "Tratamientos", "Recordatorios", "Finanzas", "Inventario", "Reportes", "Ajustes"],
  Recepción: ["Dashboard", "Pacientes", "Agenda", "Recordatorios", "Finanzas"],
  Odontólogo: ["Dashboard", "Pacientes", "Agenda", "Tratamientos", "Reportes"],
  Armonización: ["Dashboard", "Pacientes", "Agenda", "Tratamientos", "Inventario"],
};
