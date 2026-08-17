import { ShieldCheck, UserRoundPlus } from "lucide-react";
import { PatientForm } from "@/components/patient-form";
import { PatientList } from "@/components/patient-list";
import { createClient } from "@/lib/supabase/server";
import type { PatientSummary } from "@/types/operational";

const dateFormatter = new Intl.DateTimeFormat("es-CL", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Santiago",
});

const statusNames: Record<string, string> = {
  active: "Activo",
  archived: "Archivado",
  follow_up: "Seguimiento",
  inactive: "Inactivo",
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function PatientsPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId =
    typeof claimsData?.claims.sub === "string" ? claimsData.claims.sub : "";
  const [{ data, error }, { data: roles }] = await Promise.all([
    supabase
      .from("patients")
      .select(
        "id, full_name, identifier, phone, email, status, appointments(starts_at, status)",
      )
      .order("created_at", { ascending: false })
      .limit(100),
    supabase.from("user_roles").select("role_code").eq("user_id", userId),
  ]);

  if (error) {
    throw new Error("No fue posible cargar el directorio de pacientes.");
  }

  const patients: PatientSummary[] = (data ?? []).map((patient) => {
    const completed = patient.appointments
      .filter((appointment) => appointment.status === "completed")
      .sort(
        (left, right) =>
          Date.parse(right.starts_at) - Date.parse(left.starts_at),
      );
    const upcoming = patient.appointments
      .filter(
        (appointment) =>
          !["cancelled", "completed", "no_show"].includes(appointment.status),
      )
      .sort(
        (left, right) =>
          Date.parse(left.starts_at) - Date.parse(right.starts_at),
      );

    return {
      email: patient.email ?? "Sin correo",
      id: patient.id,
      identifier: patient.identifier,
      initials: getInitials(patient.full_name),
      lastVisit: completed[0]
        ? dateFormatter.format(new Date(completed[0].starts_at))
        : "Sin visitas",
      name: patient.full_name,
      nextAppointment: upcoming[0]
        ? dateFormatter.format(new Date(upcoming[0].starts_at))
        : "Sin agendar",
      phone: patient.phone ?? "Sin teléfono",
      status: statusNames[patient.status] ?? patient.status,
    };
  });
  const canCreate =
    roles?.some(({ role_code }) =>
      ["admin", "reception"].includes(role_code),
    ) ?? false;

  return (
    <>
      <div className="hero-row">
        <div>
          <p className="eyebrow">Gestión administrativa</p>
          <h1 className="page-title">Pacientes</h1>
          <p className="muted">
            Directorio administrativo protegido por permisos de base de datos.
          </p>
        </div>
      </div>
      <div className={canCreate ? "panel-grid" : undefined}>
        <section className="card section-card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Directorio autorizado</p>
              <h2 className="section-title">Listado de pacientes</h2>
            </div>
          </div>
          <PatientList patients={patients} />
        </section>
        {canCreate && (
          <aside className="card section-card">
            <div className="section-head">
              <div>
                <p className="eyebrow">Nuevo registro</p>
                <h2 className="section-title">Paciente administrativo</h2>
              </div>
              <UserRoundPlus size={21} color="var(--amalia-primary)" />
            </div>
            <PatientForm />
            <div className="login-note">
              <ShieldCheck
                size={15}
                style={{ display: "inline", marginRight: 6 }}
              />
              No ingreses antecedentes clínicos, documentos ni fotografías en
              esta fase.
            </div>
          </aside>
        )}
      </div>
    </>
  );
}
