export interface PatientSummary {
  email: string;
  id: string;
  identifier: string;
  initials: string;
  lastVisit: string;
  name: string;
  nextAppointment: string;
  phone: string;
  status: string;
}

export interface AgendaAppointment {
  box: string;
  category: "Armonización" | "Odontología";
  dateLabel: string;
  id: string;
  patient: string;
  professional: string;
  service: string;
  status: string;
  time: string;
}

export interface PatientActionState {
  fieldErrors?: Partial<
    Record<"email" | "identifier" | "name" | "phone", string[]>
  >;
  message: string | null;
  status: "error" | "idle" | "success";
}
