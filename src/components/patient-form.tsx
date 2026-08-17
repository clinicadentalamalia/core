"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  startTransition,
  useActionState,
  useEffect,
} from "react";
import { useForm } from "react-hook-form";
import { createPatient } from "@/app/(private)/pacientes/actions";
import {
  patientSchema,
  type PatientFormValues,
} from "@/lib/validation/patient";
import type { PatientActionState } from "@/types/operational";

const initialState: PatientActionState = {
  message: null,
  status: "idle",
};

export function PatientForm() {
  const [state, action, pending] = useActionState(createPatient, initialState);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: { name: "", identifier: "", phone: "", email: "" },
  });

  useEffect(() => {
    if (state.status === "success") reset();
  }, [reset, state.status]);

  const submit = handleSubmit((values) => {
    const formData = new FormData();
    Object.entries(values).forEach(([name, value]) =>
      formData.set(name, value),
    );
    startTransition(() => action(formData));
  });

  const fieldError = (field: keyof PatientFormValues) =>
    errors[field]?.message ?? state.fieldErrors?.[field]?.[0];

  return (
    <form
      onSubmit={submit}
      className="form-grid"
      noValidate
    >
      <div className="field full">
        <label htmlFor="patient-name">Nombre completo</label>
        <input
          id="patient-name"
          className="input"
          placeholder="Ej. Paciente de prueba"
          autoComplete="name"
          maxLength={100}
          aria-invalid={Boolean(fieldError("name"))}
          aria-describedby={fieldError("name") ? "patient-name-error" : undefined}
          {...register("name")}
        />
        {fieldError("name") && (
          <span id="patient-name-error" className="error-text" role="alert">
            {fieldError("name")}
          </span>
        )}
      </div>
      <div className="field">
        <label htmlFor="identifier">Identificador administrativo</label>
        <input
          id="identifier"
          className="input"
          placeholder="ID-PRUEBA-005"
          maxLength={32}
          aria-invalid={Boolean(fieldError("identifier"))}
          aria-describedby={
            fieldError("identifier") ? "identifier-error" : undefined
          }
          {...register("identifier")}
        />
        {fieldError("identifier") && (
          <span id="identifier-error" className="error-text" role="alert">
            {fieldError("identifier")}
          </span>
        )}
      </div>
      <div className="field">
        <label htmlFor="phone">Teléfono</label>
        <input
          id="phone"
          className="input"
          type="tel"
          placeholder="+56 9 0000 0000"
          autoComplete="tel"
          maxLength={24}
          aria-invalid={Boolean(fieldError("phone"))}
          aria-describedby={fieldError("phone") ? "phone-error" : undefined}
          {...register("phone")}
        />
        {fieldError("phone") && (
          <span id="phone-error" className="error-text" role="alert">
            {fieldError("phone")}
          </span>
        )}
      </div>
      <div className="field full">
        <label htmlFor="email">Correo</label>
        <input
          id="email"
          className="input"
          type="email"
          placeholder="paciente@example.test"
          autoComplete="email"
          maxLength={254}
          aria-invalid={Boolean(fieldError("email"))}
          aria-describedby={fieldError("email") ? "email-error" : undefined}
          {...register("email")}
        />
        {fieldError("email") && (
          <span id="email-error" className="error-text" role="alert">
            {fieldError("email")}
          </span>
        )}
      </div>
      <button className="button-primary" type="submit" disabled={pending}>
        {pending ? "Guardando…" : "Guardar paciente"}
      </button>
      {state.message && (
        <div
          className={state.status === "success" ? "success-box full" : "error-box full"}
          role={state.status === "success" ? "status" : "alert"}
        >
          {state.message}
        </div>
      )}
    </form>
  );
}
