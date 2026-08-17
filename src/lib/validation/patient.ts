import { z } from "zod";

export const patientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Ingresa el nombre completo")
    .max(100, "Usa hasta 100 caracteres"),
  identifier: z
    .string()
    .trim()
    .min(5, "Ingresa un identificador válido")
    .max(32, "Usa hasta 32 caracteres"),
  phone: z
    .string()
    .trim()
    .min(8, "Ingresa un teléfono válido")
    .max(24, "Usa hasta 24 caracteres")
    .regex(/^[+()\d\s-]+$/, "Usa solo números y símbolos telefónicos"),
  email: z
    .string()
    .trim()
    .max(254, "Usa hasta 254 caracteres")
    .pipe(z.email("Ingresa un correo válido")),
});

export type PatientFormValues = z.infer<typeof patientSchema>;
