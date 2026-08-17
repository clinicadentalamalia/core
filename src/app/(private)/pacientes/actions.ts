"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { patientSchema } from "@/lib/validation/patient";
import type { PatientActionState } from "@/types/operational";

export async function createPatient(
  _previousState: PatientActionState,
  formData: FormData,
): Promise<PatientActionState> {
  const parsed = patientSchema.safeParse({
    email: formData.get("email"),
    identifier: formData.get("identifier"),
    name: formData.get("name"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Revisa los campos marcados.",
      status: "error",
    };
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (typeof claimsData?.claims.sub !== "string") {
    return {
      message: "La sesión expiró. Vuelve a iniciar sesión.",
      status: "error",
    };
  }

  const { error } = await supabase.from("patients").insert({
    email: parsed.data.email,
    full_name: parsed.data.name,
    identifier: parsed.data.identifier,
    phone: parsed.data.phone,
  });

  if (error?.code === "23505") {
    return {
      fieldErrors: {
        identifier: ["Ya existe un paciente con ese identificador."],
      },
      message: "No se creó un registro duplicado.",
      status: "error",
    };
  }

  if (error) {
    return {
      message:
        error.code === "42501"
          ? "Tu rol no permite crear pacientes."
          : "No fue posible guardar el paciente. Intenta nuevamente.",
      status: "error",
    };
  }

  revalidatePath("/pacientes");
  return {
    message: "Paciente registrado correctamente.",
    status: "success",
  };
}
