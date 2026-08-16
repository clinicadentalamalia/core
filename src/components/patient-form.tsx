"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(3, "Ingresa un nombre ficticio").max(80, "Usa hasta 80 caracteres"),
  identifier: z.string().trim().min(5, "Ingresa un identificador ficticio").max(32, "Usa hasta 32 caracteres"),
  phone: z.string().trim().min(8, "Ingresa un teléfono de demostración").max(20, "Usa hasta 20 caracteres"),
  email: z.string().trim().max(254, "Usa hasta 254 caracteres").pipe(z.email("Ingresa un correo válido de demostración")),
});
type FormValues = z.infer<typeof schema>;

export function PatientForm() {
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: "", identifier: "", phone: "", email: "" } });
  const submit = () => { setSaved(true); reset(); };
  return <form onSubmit={handleSubmit(submit)} className="form-grid" noValidate>
    <div className="field full"><label htmlFor="patient-name">Nombre ficticio</label><input id="patient-name" className="input" placeholder="Ej. Paciente Demo" autoComplete="name" maxLength={80} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "patient-name-error" : undefined} {...register("name")}/>{errors.name && <span id="patient-name-error" className="error-text" role="alert">{errors.name.message}</span>}</div>
    <div className="field"><label htmlFor="identifier">Identificador ficticio</label><input id="identifier" className="input" placeholder="ID-DEMO-005" maxLength={32} aria-invalid={Boolean(errors.identifier)} aria-describedby={errors.identifier ? "identifier-error" : undefined} {...register("identifier")}/>{errors.identifier && <span id="identifier-error" className="error-text" role="alert">{errors.identifier.message}</span>}</div>
    <div className="field"><label htmlFor="phone">Teléfono demo</label><input id="phone" className="input" type="tel" placeholder="+56 9 0000 0000" autoComplete="tel" maxLength={20} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "phone-error" : undefined} {...register("phone")}/>{errors.phone && <span id="phone-error" className="error-text" role="alert">{errors.phone.message}</span>}</div>
    <div className="field full"><label htmlFor="email">Correo de prueba</label><input id="email" className="input" type="email" placeholder="paciente@example.test" autoComplete="email" maxLength={254} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} {...register("email")}/>{errors.email && <span id="email-error" className="error-text" role="alert">{errors.email.message}</span>}</div>
    <button className="button-primary" type="submit">Guardar demostración</button>
    {saved && <div className="success-box full" role="status">Paciente ficticio validado. No se guardó en la base de datos.</div>}
  </form>;
}
