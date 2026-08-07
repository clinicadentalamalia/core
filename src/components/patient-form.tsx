"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(3, "Ingresa un nombre ficticio"),
  identifier: z.string().min(5, "Ingresa un identificador ficticio"),
  phone: z.string().min(8, "Ingresa un teléfono de demostración"),
  email: z.email("Ingresa un correo válido de demostración"),
});
type FormValues = z.infer<typeof schema>;

export function PatientForm() {
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: "", identifier: "", phone: "", email: "" } });
  const submit = () => { setSaved(true); reset(); setTimeout(() => setSaved(false), 4000); };
  return <form onSubmit={handleSubmit(submit)} className="form-grid" noValidate>
    <div className="field full"><label htmlFor="patient-name">Nombre ficticio</label><input id="patient-name" className="input" placeholder="Ej. Paciente Demo" {...register("name")}/>{errors.name && <span className="error-text">{errors.name.message}</span>}</div>
    <div className="field"><label htmlFor="identifier">Identificador ficticio</label><input id="identifier" className="input" placeholder="RUT ficticio" {...register("identifier")}/>{errors.identifier && <span className="error-text">{errors.identifier.message}</span>}</div>
    <div className="field"><label htmlFor="phone">Teléfono demo</label><input id="phone" className="input" placeholder="+56 9 0000 0000" {...register("phone")}/>{errors.phone && <span className="error-text">{errors.phone.message}</span>}</div>
    <div className="field full"><label htmlFor="email">Correo de prueba</label><input id="email" className="input" placeholder="paciente@example.test" {...register("email")}/>{errors.email && <span className="error-text">{errors.email.message}</span>}</div>
    <button className="button-primary" type="submit">Guardar demostración</button>
    {saved && <div className="success-box full" role="status">Paciente ficticio validado. No se guardó en la base de datos.</div>}
  </form>;
}
