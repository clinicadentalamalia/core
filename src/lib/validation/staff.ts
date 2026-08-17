import { z } from "zod";
import { staffRoleCodes, staffStatuses } from "@/types/staff";

export const staffAccessSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(2, "Ingresa un nombre de al menos 2 caracteres.")
      .max(100, "El nombre no puede superar 100 caracteres."),
    roleCodes: z.array(z.enum(staffRoleCodes)).max(staffRoleCodes.length),
    status: z.enum(staffStatuses),
    userId: z.uuid("La cuenta seleccionada no es válida."),
  })
  .superRefine((value, context) => {
    if (value.status === "active" && value.roleCodes.length === 0) {
      context.addIssue({
        code: "custom",
        message: "Una cuenta activa necesita al menos un rol.",
        path: ["roleCodes"],
      });
    }
  });
