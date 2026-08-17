import { CalendarPlus } from "lucide-react";
import { AgendaList } from "@/components/agenda-list";
import { createClient } from "@/lib/supabase/server";
import type { AgendaAppointment } from "@/types/operational";

const dateFormatter = new Intl.DateTimeFormat("es-CL", {
  day: "2-digit",
  month: "short",
  timeZone: "America/Santiago",
});

const timeFormatter = new Intl.DateTimeFormat("es-CL", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "America/Santiago",
});

const statusNames: Record<string, string> = {
  cancelled: "Cancelada",
  completed: "Completada",
  confirmed: "Confirmada",
  in_progress: "En atención",
  no_show: "No asistió",
  pending_confirmation: "Por confirmar",
  reserved: "Reservada",
  waiting: "En espera",
};

export default async function AgendaPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select(
      "id, starts_at, service_name, service_area, status, patient:patients!appointments_patient_id_fkey(full_name), professional:professionals!appointments_professional_id_fkey(profile:profiles!professionals_profile_id_fkey(display_name)), box:boxes!appointments_box_id_fkey(name)",
    )
    .order("starts_at", { ascending: true })
    .limit(100);

  if (error) {
    throw new Error("No fue posible cargar la agenda autorizada.");
  }

  const appointments: AgendaAppointment[] = (data ?? []).map((appointment) => {
    const startsAt = new Date(appointment.starts_at);
    return {
      box: appointment.box?.name ?? "Sin box",
      category:
        appointment.service_area === "facial_harmonization"
          ? "Armonización"
          : "Odontología",
      dateLabel: dateFormatter.format(startsAt),
      id: appointment.id,
      patient: appointment.patient?.full_name ?? "Paciente no disponible",
      professional:
        appointment.professional?.profile?.display_name ??
        "Profesional no disponible",
      service: appointment.service_name,
      status: statusNames[appointment.status] ?? appointment.status,
      time: timeFormatter.format(startsAt),
    };
  });

  return (
    <>
      <div className="hero-row">
        <div>
          <p className="eyebrow">Profesionales y boxes</p>
          <h1 className="page-title">Agenda</h1>
          <p className="muted">
            Cada rol ve únicamente las citas autorizadas por RLS.
          </p>
        </div>
        <button
          className="button-primary"
          aria-label="Nueva cita no disponible"
          title="La creación de citas se habilitará con el flujo de disponibilidad"
          disabled
        >
          <CalendarPlus size={17} />
          Nueva cita
        </button>
      </div>
      <AgendaList appointments={appointments} />
    </>
  );
}
