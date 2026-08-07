export type Role = "Administrador" | "Recepción" | "Odontólogo" | "Armonización";
export type PatientStatus = "Activo" | "Seguimiento" | "Inactivo";

export interface DemoPatient {
  id: string;
  initials: string;
  name: string;
  identifier: string;
  phone: string;
  email: string;
  lastVisit: string;
  nextAppointment: string;
  status: PatientStatus;
  alert?: string;
}

export interface DemoAppointment {
  id: string;
  time: string;
  patient: string;
  service: string;
  professional: string;
  box: string;
  status: "Confirmada" | "Por confirmar" | "En atención" | "Completada";
  category: "Odontología" | "Armonización";
}
